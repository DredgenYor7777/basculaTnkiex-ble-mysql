# 📋 Recomendaciones para el Proyecto de Báscula

## ✅ Mejoras Implementadas

### 1. Separación de Código
- **CSS**: Movido a [styles.css](public/styles.css)
- **JavaScript**: Movido a [app.js](public/app.js)
- **HTML**: Limpio y estructurado en [index.html](public/index.html)

### 2. Chatbot Funcional
El chatbot ahora puede responder a las siguientes consultas:
- `última lectura` - Muestra el peso más reciente
- `promedio` - Calcula el promedio de todas las lecturas
- `máximo` / `mínimo` - Encuentra los extremos
- `tendencia` - Analiza si el peso sube o baja
- `plan` - Genera un resumen completo
- `cuántas lecturas` - Total de registros
- `ayuda` - Muestra todos los comandos disponibles

---

## 🚀 Recomendaciones Adicionales

### 1. **Seguridad**
❌ **CRÍTICO**: Las credenciales de la base de datos están hardcodeadas en [app.py](app.py:12-15)

**Solución**:
```python
# Crear archivo .env
DB_HOST=localhost
DB_USER=root
DB_PASS=cayde
DB_NAME=bascula_db

# Usar python-dotenv en app.py
from dotenv import load_dotenv
import os

load_dotenv()
DB_HOST = os.getenv("DB_HOST")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_NAME = os.getenv("DB_NAME")
```

### 2. **Base de Datos**
**Mejoras recomendadas**:

```sql
-- Agregar usuario a las lecturas
ALTER TABLE lecturas ADD COLUMN usuario_id INT;
ALTER TABLE lecturas ADD COLUMN notas TEXT;

-- Crear tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de objetivos
CREATE TABLE objetivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    peso_objetivo DECIMAL(5,2),
    fecha_inicio DATE,
    fecha_meta DATE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### 3. **Funcionalidades del Chatbot**

#### A. Integración con IA (OpenAI o Claude)
```python
# Endpoint mejorado en app.py
@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    import openai

    pregunta = request.json.get("pregunta")

    # Obtener contexto de lecturas
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM lecturas ORDER BY fecha DESC LIMIT 50")
    lecturas = cur.fetchall()
    conn.close()

    # Preparar contexto para la IA
    contexto = f"Lecturas recientes: {lecturas}"

    # Llamar a OpenAI
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "Eres un asistente de análisis de peso corporal."},
            {"role": "user", "content": f"{contexto}\n\nPregunta: {pregunta}"}
        ]
    )

    return jsonify({"respuesta": response.choices[0].message.content})
```

#### B. Comandos Adicionales
- Establecer alertas (ej: "avísame si bajo de 70kg")
- Comparar periodos ("compara esta semana con la anterior")
- Exportar datos ("dame un PDF con mi historial")
- Análisis de hábitos ("¿a qué hora peso más?")

### 4. **Mejoras en el Frontend**

#### A. Selector de Usuario
Agregar en [index.html](public/index.html):
```html
<select id="selector-usuario">
    <option value="">Selecciona usuario</option>
    <option value="1">Juan</option>
    <option value="2">María</option>
</select>
```

#### B. Filtros de Fecha
```html
<div class="filtros">
    <input type="date" id="fecha-inicio">
    <input type="date" id="fecha-fin">
    <button onclick="filtrarPorFecha()">Filtrar</button>
</div>
```

#### C. Gráficas Adicionales
- Gráfica de barras (peso por día de la semana)
- Gráfica de progreso hacia objetivo
- Distribución de pesos (histograma)

### 5. **Notificaciones Push**

```javascript
// En app.js - Solicitar permisos
if ("Notification" in window) {
    Notification.requestPermission();
}

// Notificar cuando hay nueva lectura
function notificarNuevaLectura(peso) {
    if (Notification.permission === "granted") {
        new Notification("Nueva lectura", {
            body: `Peso registrado: ${peso} kg`,
            icon: "/icon.png"
        });
    }
}
```

### 6. **Exportación de Datos**

```python
# Endpoint en app.py
from flask import send_file
import csv

@app.route("/api/exportar/csv", methods=["GET"])
def exportar_csv():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM lecturas ORDER BY fecha DESC")
    lecturas = cur.fetchall()
    conn.close()

    # Crear CSV
    with open('export.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['ID', 'Peso', 'Fecha'])
        for l in lecturas:
            writer.writerow([l['id'], l['peso'], l['fecha']])

    return send_file('export.csv', as_attachment=True)
```

### 7. **Manejo de Errores**

```python
# En app.py - Mejorar manejo de errores
@app.errorhandler(Exception)
def handle_error(e):
    app.logger.error(f"Error: {str(e)}")
    return jsonify({"error": str(e)}), 500

# Validación de datos
@app.route("/api/agregar", methods=["POST"])
def agregar():
    data = request.json
    peso = data.get("peso")

    # Validaciones
    if peso is None:
        return jsonify({"error": "Falta el peso"}), 400

    try:
        peso = float(peso)
        if peso <= 0 or peso > 500:  # Rango válido
            return jsonify({"error": "Peso fuera de rango"}), 400
    except ValueError:
        return jsonify({"error": "Peso inválido"}), 400

    # ... resto del código
```

### 8. **Optimización de Rendimiento**

#### A. Caché en Backend
```python
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route("/api/lecturas")
@cache.cached(timeout=10)  # Cache por 10 segundos
def lecturas():
    # ... código existente
```

#### B. Lazy Loading en Frontend
```javascript
// Cargar lecturas por demanda
let offset = 0;
const limit = 50;

function cargarMasLecturas() {
    fetch(`/api/lecturas?offset=${offset}&limit=${limit}`)
        .then(res => res.json())
        .then(data => {
            agregarATabla(data);
            offset += limit;
        });
}
```

### 9. **Testing**

```python
# tests/test_app.py
import pytest
from app import app

def test_agregar_lectura():
    client = app.test_client()
    response = client.post('/api/agregar', json={'peso': 75.5})
    assert response.status_code == 200
    assert response.json['status'] == 'OK'

def test_obtener_lecturas():
    client = app.test_client()
    response = client.get('/api/lecturas')
    assert response.status_code == 200
    assert isinstance(response.json, list)
```

### 10. **Dockerización**

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

```yaml
# docker-compose.yml
version: '3'
services:
  web:
    build: .
    ports:
      - "5000:5000"
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: cayde
      MYSQL_DATABASE: bascula_db
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

---

## 📊 Estructura Recomendada del Proyecto

```
bascula/
├── app.py                 # Backend Flask
├── ble_uploader.py       # Cliente BLE
├── requirements.txt      # Dependencias Python
├── .env                  # Variables de entorno
├── .gitignore
├── README.md
├── RECOMENDACIONES.md
├── public/
│   ├── index.html        # HTML principal
│   ├── styles.css        # Estilos CSS
│   ├── app.js           # Lógica JavaScript
│   └── assets/
│       └── icons/
├── tests/
│   ├── test_app.py
│   └── test_chatbot.py
└── docs/
    └── API.md
```

---

## 🔒 Checklist de Seguridad

- [ ] Mover credenciales a variables de entorno
- [ ] Implementar autenticación de usuarios
- [ ] Agregar validación de entrada en todos los endpoints
- [ ] Configurar HTTPS en producción
- [ ] Implementar rate limiting
- [ ] Sanitizar entradas del chatbot
- [ ] Configurar CORS correctamente
- [ ] Agregar logging de seguridad

---

## 🎯 Prioridades

### Alta Prioridad
1. ✅ Separar CSS y JavaScript
2. ✅ Implementar chatbot básico
3. ⚠️ Mover credenciales a .env
4. ⚠️ Agregar validación de datos

### Media Prioridad
5. Implementar selector de usuarios
6. Agregar exportación de datos
7. Mejorar manejo de errores
8. Implementar tests

### Baja Prioridad
9. Integración con IA
10. Notificaciones push
11. Dockerización
12. Múltiples gráficas

---

## 📚 Recursos Útiles

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [Server-Sent Events Guide](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Python dotenv](https://github.com/theskumar/python-dotenv)
- [OpenAI API](https://platform.openai.com/docs/)
- [Anthropic Claude API](https://docs.anthropic.com/)
