# 🚀 Guía de Configuración - Dashboard con Claude AI

Esta guía te ayudará a configurar el proyecto con integración de Claude (Anthropic) paso a paso.

---

## 📋 Requisitos Previos

- Python 3.8+
- MySQL 8.0+
- Báscula Bluetooth OKOK
- Cuenta de Anthropic (para API de Claude)

---

## 🔧 Instalación Paso a Paso

### 1. Instalar Dependencias de Python

```bash
pip install -r requirements.txt
```

Las dependencias incluyen:
- `flask` - Framework web
- `flask-cors` - Manejo de CORS
- `pymysql` - Conector MySQL
- `anthropic` - SDK de Claude AI
- `python-dotenv` - Variables de entorno
- `bleak` - Cliente Bluetooth LE
- `requests` - HTTP requests

### 2. Configurar Base de Datos MySQL

#### Opción A: Crear desde cero
```sql
CREATE DATABASE bascula_db;
USE bascula_db;

CREATE TABLE lecturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    peso DECIMAL(5,2) NOT NULL,
    usuario VARCHAR(100) DEFAULT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Opción B: Actualizar tabla existente
```bash
mysql -u root -p < schema.sql
```

O manualmente:
```sql
USE bascula_db;
ALTER TABLE lecturas ADD COLUMN usuario VARCHAR(100) DEFAULT NULL;
```

### 3. Configurar Variables de Entorno

#### Paso 3.1: Obtener API Key de Claude

1. Visita [https://console.anthropic.com/](https://console.anthropic.com/)
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys"
4. Genera una nueva API key
5. Copia la clave (empieza con `sk-ant-...`)

#### Paso 3.2: Configurar archivo .env

Edita el archivo [.env](.env) y reemplaza los valores:

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_contraseña_mysql
DB_NAME=bascula_db

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-tu-api-key-aqui
```

⚠️ **IMPORTANTE**:
- Nunca compartas tu API key
- El archivo `.env` está en `.gitignore` por seguridad
- Usa `.env.example` como plantilla para otros desarrolladores

### 4. Configurar Dirección MAC de la Báscula

Edita [ble_uploader.py](ble_uploader.py:5):

```python
TARGET_MAC = "7E:0A:51:29:3F:F4"  # Cambia esto por tu báscula
```

**Para encontrar la dirección MAC:**

En Windows:
1. Configuración → Bluetooth y dispositivos
2. Encuentra tu báscula
3. Copia la dirección MAC

En Linux/Mac:
```bash
bluetoothctl
scan on
# Busca "OKOK" en la lista
```

---

## ▶️ Iniciar el Sistema

### Terminal 1: Servidor Flask
```bash
python app.py
```

Deberías ver:
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

### Terminal 2: Cliente BLE
```bash
python ble_uploader.py
```

Deberías ver:
```
🟦 Escuchando la báscula OKOK…
```

### Navegador
Abre: [http://localhost:5000](http://localhost:5000)

---

## 🎯 Probar la Configuración

### 1. Verificar Conexión del Dashboard
- El estado debería mostrar "Conectado" (verde)
- Deberías ver la gráfica y tabla vacías o con datos previos

### 2. Probar Captura de Peso
1. Enciende la báscula
2. Súbete a ella
3. Espera 3 segundos (debounce)
4. Debería aparecer el modal de "Nueva medición registrada"
5. Ingresa un nombre
6. Presiona "Guardar"

### 3. Verificar Sugerencias de Claude
Después de guardar el nombre:
1. Debería aparecer el modal de "Sugerencias personalizadas"
2. Verás un spinner mientras Claude genera la respuesta
3. Deberías ver sugerencias de:
   - Análisis de la medición
   - Plan alimenticio
   - Recomendaciones generales

### 4. Probar el Chatbot
En el panel derecho, prueba:
- `"última lectura"`
- `"dame un plan alimenticio"`
- `"cómo está mi tendencia de peso"`
- `"dame consejos de salud"`

---

## 🐛 Solución de Problemas

### Error: "API de Anthropic no configurada"

**Causa**: No se configuró la API key de Claude

**Solución**:
1. Verifica que el archivo `.env` existe
2. Verifica que `ANTHROPIC_API_KEY` está configurado
3. Reinicia el servidor Flask

```bash
# Verificar variables de entorno
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('ANTHROPIC_API_KEY'))"
```

### Error: "Import dotenv could not be resolved"

**Causa**: Falta instalar `python-dotenv`

**Solución**:
```bash
pip install python-dotenv
```

### Error: "Import anthropic could not be resolved"

**Causa**: Falta instalar el SDK de Anthropic

**Solución**:
```bash
pip install anthropic
```

### El modal no aparece después de pesarse

**Posibles causas**:
1. El debounce está funcionando (espera 3 segundos)
2. La báscula envía múltiples lecturas (normal)
3. El stream no está conectado

**Solución**:
1. Verifica en la consola del navegador (F12)
2. Mira los logs del servidor Flask
3. Asegúrate de que el peso cambie entre lecturas

### Claude devuelve errores

**Posibles causas**:
1. API key inválida
2. Sin créditos en la cuenta de Anthropic
3. Rate limiting

**Solución**:
1. Verifica tu API key en [console.anthropic.com](https://console.anthropic.com/)
2. Revisa el balance de créditos
3. Espera un momento antes de reintentar

### La báscula no se detecta

**Solución**:
1. Verifica que la báscula esté encendida
2. Verifica que la dirección MAC sea correcta
3. Asegúrate de que el Bluetooth esté activo
4. Ejecuta el cliente BLE con permisos de administrador

---

## 📊 Estructura del Flujo

```
1. Usuario se pesa en la báscula
   ↓
2. Cliente BLE captura el peso
   ↓
3. Envía a /api/agregar (sin usuario)
   ↓
4. Servidor guarda en BD y notifica vía SSE
   ↓
5. Frontend recibe evento
   ↓
6. Debounce espera 3 segundos
   ↓
7. Si no hay más lecturas, muestra modal
   ↓
8. Usuario ingresa nombre
   ↓
9. Frontend actualiza con /api/agregar (con usuario)
   ↓
10. Muestra modal de sugerencias
    ↓
11. Llama a /api/sugerencias
    ↓
12. Claude genera análisis personalizado
    ↓
13. Muestra sugerencias al usuario
```

---

## 🔒 Seguridad

### Producción

Para usar en producción:

1. **Cambiar credenciales de BD**
```env
DB_PASS=contraseña_segura_aleatoria
```

2. **Desactivar Debug Mode**
```python
# En app.py
app.run(host="0.0.0.0", port=5000, debug=False)
```

3. **Configurar HTTPS**
```bash
# Usar nginx o Apache como proxy reverso
# O usar gunicorn con SSL
```

4. **Restringir CORS**
```python
# En app.py
CORS(app, origins=["https://tu-dominio.com"])
```

5. **Rate Limiting**
```bash
pip install flask-limiter
```

```python
from flask_limiter import Limiter

limiter = Limiter(app, key_func=lambda: request.remote_addr)

@limiter.limit("10 per minute")
@app.route("/api/chatbot", methods=["POST"])
def chatbot():
    # ...
```

---

## 💰 Costos de Claude API

### Modelo: claude-3-5-sonnet-20241022

**Precios (aproximados)**:
- Input: $3.00 por millón de tokens
- Output: $15.00 por millón de tokens

**Estimación de uso**:
- Sugerencia personalizada: ~500 tokens input, ~800 tokens output
- Costo por sugerencia: ~$0.015 (1.5 centavos)
- 100 sugerencias: ~$1.50

**Pregunta del chatbot**:
- ~200 tokens input, ~300 tokens output
- Costo por pregunta: ~$0.005 (0.5 centavos)

**Optimización**:
- Limitar el historial enviado a Claude (ya implementado: 50 lecturas)
- Usar caché de conversaciones
- Implementar rate limiting por usuario

---

## 📝 Verificar Instalación

Ejecuta este script para verificar todo:

```bash
python -c "
import pymysql
import anthropic
from dotenv import load_dotenv
import os

load_dotenv()

print('✅ PyMySQL instalado')
print('✅ Anthropic instalado')
print('✅ dotenv instalado')

api_key = os.getenv('ANTHROPIC_API_KEY')
if api_key and api_key.startswith('sk-ant-'):
    print('✅ API Key configurada')
else:
    print('❌ API Key no configurada o inválida')

db_pass = os.getenv('DB_PASS')
if db_pass and db_pass != 'cayde':
    print('⚠️  Usando contraseña por defecto - cambiar en producción')
else:
    print('✅ Contraseña de BD configurada')
"
```

---

## 🎉 ¡Listo!

Si todos los pasos anteriores funcionan, tu sistema está completamente configurado.

### Próximos Pasos

1. **Prueba con usuarios reales**: Pide a familiares que se pesen
2. **Analiza las sugerencias**: Ve cómo Claude responde a diferentes perfiles
3. **Personaliza prompts**: Edita los prompts en [app.py](app.py) para mejorar respuestas
4. **Agrega funcionalidades**: Consulta [RECOMENDACIONES.md](RECOMENDACIONES.md)

### Soporte

¿Problemas? Verifica:
1. Logs del servidor Flask
2. Consola del navegador (F12)
3. Logs del cliente BLE
4. Estado de la conexión a BD

---

**¿Todo funcionando?** ¡Disfruta de tu dashboard inteligente con Claude! 🎊
