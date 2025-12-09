# 📊 Dashboard de Báscula con Claude AI (Se elimino Claude AI por creditos insuficientes)

Sistema completo para monitorear peso corporal en tiempo real desde una báscula Bluetooth (OKOK), con dashboard web interactivo y **chatbot inteligente powered by Claude (Anthropic)**.

---

## 🚀 Características

### ✅ Funcionalidades Actuales
- **Captura automática** de peso desde báscula BLE
- **Dashboard en tiempo real** con Server-Sent Events (SSE)
- **Gráfica interactiva** de últimas 50 lecturas
- **Historial completo** almacenado en MySQL
- **Chatbot inteligente con Claude AI** - Respuestas contextuales y precisas
- **Sugerencias personalizadas** - Planes alimenticios y recomendaciones de salud
- **Modales interactivos** - Captura de usuario y visualización de sugerencias
- **Debounce inteligente** - Detecta lecturas únicas vs. múltiples
- **Diseño responsive** y moderno

### 🤖 Chatbot con Claude AI
El chatbot usa **Claude 3.5 Sonnet** de Anthropic para:
- Análisis contextual de tus lecturas de peso
- Respuestas inteligentes en lenguaje natural
- Consejos personalizados de salud y nutrición
- Cálculos estadísticos automáticos
- Recomendaciones basadas en tu historial

**Ejemplos de preguntas:**
- `"¿Cómo ha sido mi progreso esta semana?"`
- `"Dame consejos para bajar de peso"`
- `"¿Qué debería comer hoy?"`
- `"Analiza mi tendencia de peso"`
- `"Dame un plan alimenticio saludable"`

### 🎯 Sistema de Sugerencias Automáticas
Cuando te pesas, Claude genera automáticamente:
1. **Análisis de la medición** - Evaluación del peso registrado
2. **Plan alimenticio** - 3-4 comidas saludables específicas
3. **Recomendaciones generales** - Hábitos, hidratación, ejercicio

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Flask** - Framework web Python
- **PyMySQL** - Conector de base de datos
- **Anthropic SDK** - Integración con Claude AI
- **python-dotenv** - Manejo de variables de entorno
- **Bleak** - Librería BLE para Python
- **Flask-CORS** - Manejo de CORS

### Frontend
- **HTML5** / **CSS3** / **JavaScript ES6**
- **Chart.js** - Gráficas interactivas
- **Server-Sent Events** - Actualización en tiempo real
- **Fetch API** - Comunicación con backend

### Base de Datos
- **MySQL 8** - Almacenamiento de lecturas

---

## 📁 Estructura del Proyecto

```
bascula/
├── app.py                    # Backend Flask con Claude AI
├── ble_uploader.py          # Cliente BLE para báscula
├── .env                     # Variables de entorno (API keys)
├── .env.example             # Plantilla de configuración
├── .gitignore               # Archivos a ignorar en git
├── requirements.txt         # Dependencias Python
├── schema.sql               # Script de base de datos
├── public/
│   ├── index.html           # HTML con modales interactivos
│   ├── styles.css           # CSS con estilos de modales
│   └── app.js              # JavaScript con lógica de Claude
├── README.md                # Este archivo
├── CONFIGURACION.md         # ⭐ Guía de configuración detallada
└── RECOMENDACIONES.md       # Guía de mejoras futuras
```

---

## 🔧 Instalación Rápida

### ⚡ Método Rápido

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Configurar base de datos
mysql -u root -p < schema.sql

# 3. Configurar variables de entorno
# Edita .env con tu API key de Claude y credenciales de BD

# 4. Iniciar servidor
python app.py

# 5. En otra terminal, iniciar cliente BLE
python ble_uploader.py
```

### 📖 Instalación Detallada

**Para instrucciones paso a paso completas, consulta [CONFIGURACION.md](CONFIGURACION.md)**

La guía incluye:
- Cómo obtener tu API key de Claude (Anthropic)
- Configuración de variables de entorno
- Actualización de base de datos
- Solución de problemas comunes
- Verificación de instalación
- Costos estimados de API

---

## 🚀 Uso

### 1. Iniciar el Servidor Flask
```bash
python app.py
```
El servidor estará disponible en: `http://localhost:5000`

### 2. Iniciar el Cliente BLE
```bash
python ble_uploader.py
```
Esto comenzará a escuchar la báscula y enviar datos automáticamente.

### 3. Abrir el Dashboard
Navega a: `http://localhost:5000`

---

## 📡 API REST

### Endpoints Disponibles

#### GET `/api/lecturas`
Obtiene las últimas 200 lecturas.

**Respuesta:**
```json
[
  {
    "id": 1,
    "peso": "75.50",
    "fecha": "2025-12-06 10:30:45"
  },
  ...
]
```

#### POST `/api/agregar`
Agrega una nueva lectura de peso.

**Request:**
```json
{
  "peso": 75.5
}
```

**Respuesta:**
```json
{
  "status": "OK",
  "peso": 75.5
}
```

#### GET `/api/stream`
Endpoint de Server-Sent Events para actualizaciones en tiempo real.

---

## 💬 Uso del Chatbot

### Ejemplos de Consultas

```
Usuario: "última lectura"
Bot: La última lectura es de 75.50 kg registrada el 2025-12-06 10:30:45

Usuario: "promedio"
Bot: El promedio de las últimas 150 lecturas es 74.23 kg

Usuario: "tendencia"
Bot: La tendencia es a la baja. El peso ha disminuido 0.50 kg desde la lectura anterior.

Usuario: "plan"
Bot:
📊 Resumen de lecturas:
• Total de lecturas: 150
• Promedio: 74.23 kg
• Máximo: 78.50 kg
• Mínimo: 71.20 kg
• Última lectura: 75.50 kg
```

---

## 🎨 Personalización

### Cambiar Colores
Edita [styles.css](public/styles.css):
```css
.ultima-lectura {
    background: linear-gradient(135deg, #TU_COLOR1 0%, #TU_COLOR2 100%);
}
```

### Modificar Límite de Lecturas
En [app.py](app.py:76):
```python
LIMIT 200  # Cambiar a tu preferencia
```

### Ajustar Intervalo de Actualización
En [app.py](app.py:100):
```python
time.sleep(0.5)  # Cambiar intervalo en segundos
```

---

## 🔒 Seguridad

⚠️ **ADVERTENCIAS IMPORTANTES**:

1. **Credenciales expuestas**: Las credenciales de MySQL están en texto plano
   - **Solución**: Ver [RECOMENDACIONES.md](RECOMENDACIONES.md#1-seguridad)

2. **Sin autenticación**: La API no tiene autenticación
   - Cualquiera con acceso a la red puede agregar/leer datos

3. **CORS abierto**: Configurado para aceptar todas las peticiones
   - Restringir en producción

**Para producción**, consulta [RECOMENDACIONES.md](RECOMENDACIONES.md) para implementar:
- Variables de entorno
- Autenticación de usuarios
- HTTPS
- Rate limiting

---

## 🐛 Solución de Problemas

### El servidor no inicia
```bash
# Verificar que MySQL esté corriendo
mysql -u root -p

# Verificar que la base de datos existe
SHOW DATABASES;
```

### El cliente BLE no detecta la báscula
```bash
# Verificar dirección MAC correcta
# En Windows:
# Configuración > Bluetooth > Más opciones

# Asegurar que la báscula está encendida y en modo emparejamiento
```

### Dashboard no actualiza en tiempo real
1. Verifica que el servidor Flask esté corriendo
2. Abre la consola del navegador (F12) para ver errores
3. Verifica que el cliente BLE esté enviando datos

### Error de conexión a MySQL
```python
# Verificar credenciales en app.py
# Verificar que MySQL esté escuchando en localhost:3306
```

---

## 📈 Próximas Mejoras

Ver [RECOMENDACIONES.md](RECOMENDACIONES.md) para:
- Sistema de usuarios
- Exportación de datos (CSV, PDF)
- Integración con IA (OpenAI/Claude)
- Notificaciones push
- Dockerización
- Objetivos de peso
- Comparación de periodos

---

## 🤝 Contribuir

Para agregar nuevas funcionalidades:

1. Consulta [RECOMENDACIONES.md](RECOMENDACIONES.md) para ideas
2. Mantén la separación de código (HTML/CSS/JS en archivos separados)
3. Documenta los cambios en este README
4. Sigue las convenciones de código existentes

---

## 📝 Licencia

Proyecto personal - Uso libre

---

## 👤 Autor

Sistema de monitoreo de báscula desarrollado con Python Flask y JavaScript vanilla.

---

## 🔗 Enlaces Útiles

- [Documentación Flask](https://flask.palletsprojects.com/)
- [Chart.js](https://www.chartjs.org/)
- [Bleak (BLE)](https://github.com/hbldh/bleak)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---

**¿Preguntas?** Consulta [RECOMENDACIONES.md](RECOMENDACIONES.md) para guías detalladas.
