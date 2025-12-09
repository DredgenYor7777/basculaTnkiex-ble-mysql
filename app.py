from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import pymysql
from datetime import datetime
import json
import time
import threading
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

# Configuración de base de datos
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "cayde")
DB_NAME = os.getenv("DB_NAME", "bascula_db")

# Variable global para la última lectura
ultima_lectura = None
lectura_lock = threading.Lock()

def get_db():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )

@app.route("/api/agregar", methods=["POST"])
def agregar():
    global ultima_lectura
    data = request.json
    peso = data.get("peso")
    usuario = data.get("usuario", None)
    altura = data.get("altura", None)

    if peso is None:
        return jsonify({"error": "Falta el peso"}), 400

    # Validación de peso (rango: 30 kg a 180 kg)
    try:
        peso_float = float(peso)
        if peso_float < 30 or peso_float > 180:
            return jsonify({"error": "Peso fuera de rango (30-180 kg)"}), 400
    except ValueError:
        return jsonify({"error": "Peso inválido"}), 400

    # Validación de altura (si se proporciona, rango: 1.00 m a 2.50 m)
    if altura is not None:
        try:
            altura_float = float(altura)
            if altura_float < 1.00 or altura_float > 2.50:
                return jsonify({"error": "Altura fuera de rango (1.00-2.50 m)"}), 400
        except ValueError:
            return jsonify({"error": "Altura inválida"}), 400

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO lecturas (peso, usuario, altura, fecha) VALUES (%s, %s, %s, NOW())",
        (peso, usuario, altura)
    )

    conn.commit()

    # Obtener la lectura recién insertada
    cur.execute("""
        SELECT id, peso, usuario, altura, DATE_FORMAT(fecha, '%Y-%m-%d %H:%i:%s') as fecha
        FROM lecturas
        WHERE id = LAST_INSERT_ID()
    """)
    nueva_lectura = cur.fetchone()

    conn.close()

    # Actualizar la variable global de forma segura
    with lectura_lock:
        ultima_lectura = nueva_lectura

    print(f"✅ Nueva lectura guardada: {nueva_lectura}")

    return jsonify({"status": "OK", "peso": peso, "usuario": usuario, "altura": altura, "lectura": nueva_lectura})

@app.route("/api/lecturas", methods=["GET"])
def lecturas():
    conn = get_db()
    cur = conn.cursor()

    # Solo mostrar lecturas que tienen nombre de usuario asignado
    cur.execute("""
        SELECT id, peso, usuario, altura, fecha,
               IF(recomendacion IS NOT NULL AND recomendacion != '', 1, 0) as recomendacion
        FROM lecturas
        WHERE usuario IS NOT NULL AND usuario != ''
        ORDER BY fecha DESC
        LIMIT 200
    """)

    data = cur.fetchall()
    conn.close()

    return jsonify(data)

@app.route("/api/stream")
def stream():
    def event_stream():
        global ultima_lectura
        last_id = None
        
        print("🔌 Cliente conectado al stream")
        
        while True:
            with lectura_lock:
                if ultima_lectura and ultima_lectura.get('id') != last_id:
                    last_id = ultima_lectura.get('id')
                    # Enviar evento al cliente
                    yield f"data: {json.dumps(ultima_lectura, default=str)}\n\n"
                    print(f"📤 Enviado al cliente: {ultima_lectura}")
            
            time.sleep(0.5)
    
    return Response(event_stream(), mimetype="text/event-stream")

@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    """Endpoint para el chatbot local (sin API externa)"""
    data = request.json
    pregunta = data.get("pregunta", "")

    if not pregunta:
        return jsonify({"error": "Falta la pregunta"}), 400

    try:
        # El chatbot local ya está implementado en el frontend (app.js)
        # Este endpoint queda para compatibilidad futura
        return jsonify({"respuesta": "El chatbot ahora funciona localmente desde el navegador. Usa la interfaz web para hacer preguntas."})

    except Exception as e:
        print(f"Error en chatbot: {str(e)}")
        return jsonify({"error": f"Error al procesar la pregunta: {str(e)}"}), 500


def calcular_imc(peso, altura):
    """Calcula el IMC (Índice de Masa Corporal)"""
    if altura is None or altura <= 0:
        return None
    return peso / (altura ** 2)

def obtener_categoria_imc(imc):
    """Retorna la categoría según el IMC"""
    if imc < 18.5:
        return "bajo peso"
    elif imc < 25:
        return "peso normal"
    elif imc < 30:
        return "sobrepeso"
    else:
        return "obesidad"

def generar_sugerencias_locales(peso, altura, usuario, historial):
    """Genera sugerencias personalizadas sin usar API externa"""

    sugerencias = []

    # Calcular IMC si hay altura
    imc = None
    categoria = None
    if altura:
        imc = calcular_imc(peso, altura)
        categoria = obtener_categoria_imc(imc)

    # 1. ANÁLISIS DE LA MEDICIÓN ACTUAL
    analisis = "ANÁLISIS DE TU MEDICIÓN\n\n"
    analisis += f"Peso registrado: {peso} kg\n"

    if imc and categoria:
        analisis += f"Altura: {altura} m\n"
        analisis += f"IMC: {imc:.1f}\n"
        analisis += f"Categoría: {categoria.upper()}\n\n"

        if categoria == "bajo peso":
            analisis += "Tu peso está por debajo del rango saludable. Es importante aumentar tu ingesta calórica de manera saludable.\n"
        elif categoria == "peso normal":
            analisis += "¡Felicidades! Tu peso está en el rango saludable. Mantén tus buenos hábitos.\n"
        elif categoria == "sobrepeso":
            analisis += "Tu peso está ligeramente por encima del rango ideal. Con pequeños cambios puedes mejorar tu salud.\n"
        else:  # obesidad
            analisis += "Tu peso está significativamente por encima del rango saludable. Te recomendamos consultar con un profesional.\n"

    # Analizar tendencia si hay historial
    if historial and len(historial) >= 2:
        pesos = [float(h['peso']) for h in historial]
        promedio = sum(pesos) / len(pesos)
        diferencia = peso - float(historial[1]['peso'])

        analisis += f"\nPromedio histórico: {promedio:.1f} kg\n"

        if diferencia > 0.5:
            analisis += f"Tendencia: SUBIDA (+{diferencia:.1f} kg desde última medición)\n"
        elif diferencia < -0.5:
            analisis += f"Tendencia: BAJADA ({diferencia:.1f} kg desde última medición)\n"
        else:
            analisis += "Tendencia: ESTABLE\n"

    sugerencias.append(analisis)

    # 2. PLAN ALIMENTICIO RECOMENDADO
    plan = "\n\nPLAN ALIMENTICIO RECOMENDADO\n\n"

    if categoria == "bajo peso" or (not categoria and peso < 60):
        plan += "DESAYUNO:\n"
        plan += "• Avena con leche entera, plátano y miel\n"
        plan += "• Pan integral con mantequilla de maní\n"
        plan += "• Jugo de frutas natural\n\n"

        plan += "ALMUERZO:\n"
        plan += "• Arroz blanco (1.5 tazas)\n"
        plan += "• Pollo o carne (200g)\n"
        plan += "• Ensalada con aguacate\n"
        plan += "• Frijoles o lentejas\n\n"

        plan += "MERIENDA:\n"
        plan += "• Yogurt griego con granola\n"
        plan += "• Frutos secos (almendras, nueces)\n\n"

        plan += "CENA:\n"
        plan += "• Pasta con salsa y carne\n"
        plan += "• Ensalada verde\n"
        plan += "• Pan integral\n"

    elif categoria == "peso normal" or (not categoria and 60 <= peso <= 80):
        plan += "DESAYUNO:\n"
        plan += "• Avena con frutas frescas\n"
        plan += "• Huevos revueltos (2)\n"
        plan += "• Té verde o café\n\n"

        plan += "ALMUERZO:\n"
        plan += "• Arroz integral (1 taza)\n"
        plan += "• Pescado o pollo a la plancha (150g)\n"
        plan += "• Ensalada variada\n"
        plan += "• Verduras al vapor\n\n"

        plan += "MERIENDA:\n"
        plan += "• Frutas frescas\n"
        plan += "• Yogurt natural\n\n"

        plan += "CENA:\n"
        plan += "• Ensalada grande con proteína\n"
        plan += "• Sopa de verduras\n"
        plan += "• Pan integral (1 rebanada)\n"

    else:  # sobrepeso u obesidad
        plan += "DESAYUNO:\n"
        plan += "• Avena con agua y canela\n"
        plan += "• Frutas bajas en azúcar (fresas, manzana)\n"
        plan += "• Té verde sin azúcar\n\n"

        plan += "ALMUERZO:\n"
        plan += "• Ensalada grande (base principal)\n"
        plan += "• Pechuga de pollo a la plancha (120g)\n"
        plan += "• Verduras cocidas sin aceite\n"
        plan += "• Evitar harinas y arroz\n\n"

        plan += "MERIENDA:\n"
        plan += "• Pepino, zanahoria o apio\n"
        plan += "• Agua de limón\n\n"

        plan += "CENA:\n"
        plan += "• Sopa de verduras (sin papa)\n"
        plan += "• Ensalada con atún\n"
        plan += "• Té de hierbas\n"

    sugerencias.append(plan)

    # 3. RECOMENDACIONES GENERALES
    recomendaciones = "\n\nRECOMENDACIONES GENERALES\n\n"

    recomendaciones += "HIDRATACIÓN:\n"
    recomendaciones += "• Bebe 2-3 litros de agua al día\n"
    recomendaciones += "• Evita bebidas azucaradas y alcohol\n"
    recomendaciones += "• Agua con limón en ayunas\n\n"

    recomendaciones += "ACTIVIDAD FÍSICA:\n"
    if categoria == "bajo peso":
        recomendaciones += "• Ejercicio moderado 3 veces por semana\n"
        recomendaciones += "• Enfócate en pesas y resistencia\n"
        recomendaciones += "• Evita cardio excesivo\n\n"
    elif categoria == "peso normal":
        recomendaciones += "• Ejercicio 4-5 veces por semana\n"
        recomendaciones += "• Combina cardio y pesas\n"
        recomendaciones += "• 30-45 minutos por sesión\n\n"
    else:
        recomendaciones += "• Camina 30-60 minutos diarios\n"
        recomendaciones += "• Inicia con ejercicios de bajo impacto\n"
        recomendaciones += "• Aumenta intensidad gradualmente\n\n"

    recomendaciones += "HÁBITOS SALUDABLES:\n"
    recomendaciones += "• Duerme 7-8 horas cada noche\n"
    recomendaciones += "• Come despacio y mastica bien\n"
    recomendaciones += "• Evita comer 3 horas antes de dormir\n"
    recomendaciones += "• Reduce el estrés con meditación o yoga\n"
    recomendaciones += "• Pésate siempre a la misma hora\n"

    sugerencias.append(recomendaciones)

    return "\n".join(sugerencias)

@app.route("/api/sugerencias", methods=["POST"])
def sugerencias():
    """Endpoint para generar sugerencias personalizadas (LOCAL - sin API)"""

    data = request.json
    peso = data.get("peso")
    altura = data.get("altura")
    usuario = data.get("usuario", "Usuario")
    lectura_id = data.get("lectura_id")  # ID de la lectura para guardar la recomendación

    if not peso:
        return jsonify({"error": "Falta el peso"}), 400

    try:
        peso_float = float(peso)
        altura_float = float(altura) if altura else None

        # Obtener historial del usuario
        conn = get_db()
        cur = conn.cursor()

        if usuario and usuario != "Usuario":
            cur.execute("""
                SELECT peso, altura, DATE(fecha) as fecha
                FROM lecturas
                WHERE usuario = %s
                ORDER BY fecha DESC
                LIMIT 30
            """, (usuario,))
        else:
            cur.execute("""
                SELECT peso, altura, DATE(fecha) as fecha
                FROM lecturas
                ORDER BY fecha DESC
                LIMIT 30
            """)

        historial = cur.fetchall()

        # Generar sugerencias locales
        sugerencias_texto = generar_sugerencias_locales(peso_float, altura_float, usuario, historial)

        # Guardar la recomendación en la base de datos si se proporcionó el ID
        if lectura_id:
            cur.execute("""
                UPDATE lecturas
                SET recomendacion = %s
                WHERE id = %s
            """, (sugerencias_texto, lectura_id))
            conn.commit()

        conn.close()

        return jsonify({"sugerencias": sugerencias_texto, "peso": peso, "altura": altura, "usuario": usuario})

    except Exception as e:
        print(f"Error en sugerencias: {str(e)}")
        return jsonify({"error": f"Error al generar sugerencias: {str(e)}"}), 500


@app.route("/api/recomendacion/<int:lectura_id>", methods=["GET"])
def obtener_recomendacion(lectura_id):
    """Endpoint para obtener la recomendación de una lectura específica"""
    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("""
            SELECT id, peso, usuario, altura, DATE_FORMAT(fecha, '%%Y-%%m-%%d %%H:%%i:%%s') as fecha, recomendacion
            FROM lecturas
            WHERE id = %s
        """, (lectura_id,))

        lectura = cur.fetchone()
        conn.close()

        if not lectura:
            return jsonify({"error": "Lectura no encontrada"}), 404

        if not lectura.get('recomendacion'):
            return jsonify({"error": "Esta lectura no tiene recomendación asociada"}), 404

        return jsonify(lectura)

    except Exception as e:
        print(f"Error al obtener recomendación: {str(e)}")
        return jsonify({"error": f"Error al obtener recomendación: {str(e)}"}), 500


@app.route("/")
def home():
    return app.send_static_file("index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)