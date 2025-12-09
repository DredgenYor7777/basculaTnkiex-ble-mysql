# 📱 GUÍA: Instalar Báscula App en Android con Termux

## 🎯 ¿Qué lograrás?

Tu aplicación de báscula funcionando **100% en tu móvil Android**:
- ✅ Sin necesidad de PC
- ✅ Funciona completamente offline
- ✅ Base de datos local en el móvil
- ✅ Instalable como PWA (app independiente)
- ✅ Acceso a Bluetooth del móvil
- ✅ Portable y funcional en cualquier lugar

---

## 📋 REQUISITOS

- **Android 7.0 o superior**
- **2 GB de espacio libre**
- **Termux instalado**

---

## 🚀 INSTALACIÓN PASO A PASO

### **PASO 1: Instalar Termux**

**IMPORTANTE:** NO uses la versión de Google Play Store (está desactualizada)

**Opción A: F-Droid (RECOMENDADO)**
1. Descarga F-Droid: https://f-droid.org/
2. Instala F-Droid
3. Busca "Termux" en F-Droid
4. Instala **Termux** y **Termux:API**

**Opción B: GitHub**
1. Ve a: https://github.com/termux/termux-app/releases
2. Descarga el APK más reciente
3. Instala (permite instalación de fuentes desconocidas)

---

### **PASO 2: Transferir el proyecto al móvil**

**Opción A: USB (MÁS RÁPIDO)**
1. Conecta tu móvil a la PC con cable USB
2. Copia toda la carpeta `bascula` a:
   - `Almacenamiento interno/bascula/`

**Opción B: Compresión y transferencia**
1. En tu PC, comprime la carpeta `bascula` en un ZIP
2. Envíalo por WhatsApp/Email/Drive a tu móvil
3. Descomprime en `Almacenamiento interno/`

---

### **PASO 3: Dar permisos a Termux**

Abre **Termux** y ejecuta:

```bash
termux-setup-storage
```

- Aparecerá un mensaje pidiendo permisos
- Toca **"Permitir"**
- Esto permite a Termux acceder a tus archivos

---

### **PASO 4: Navegar al proyecto**

En Termux, ejecuta:

```bash
cd /storage/emulated/0/bascula
```

Verifica que estás en la carpeta correcta:

```bash
ls
```

Deberías ver archivos como: `app.py`, `setup_termux.sh`, etc.

---

### **PASO 5: Ejecutar instalación automática**

```bash
chmod +x setup_termux.sh
./setup_termux.sh
```

**⏱️ Esto tomará 5-10 minutos**

El script instalará automáticamente:
- Python
- MariaDB (MySQL)
- Todas las dependencias
- Configurará la base de datos
- Creará scripts de inicio

**Durante la instalación:**
- Te preguntará si deseas continuar → Escribe `Y` y presiona Enter
- Puede pedir permisos → Acepta todos

---

### **PASO 6: Iniciar la aplicación**

Una vez terminada la instalación:

```bash
./start_app.sh
```

Verás algo como:

```
════════════════════════════════════════
  🚀 INICIANDO BÁSCULA APP
════════════════════════════════════════

📱 Accede desde este dispositivo:
   http://localhost:5000

🌐 Accede desde otros dispositivos:
   http://192.168.1.XX:5000

════════════════════════════════════════
```

---

### **PASO 7: Abrir la aplicación**

1. **En el mismo móvil:**
   - Abre Chrome/Firefox
   - Ve a: `http://localhost:5000`

2. **Desde otro dispositivo (mismo WiFi):**
   - Usa la IP que muestra el script
   - Ejemplo: `http://192.168.1.50:5000`

---

### **PASO 8: Instalar como PWA (App independiente)**

1. Una vez abierta en el navegador
2. Toca el **menú** (3 puntos)
3. Selecciona **"Agregar a pantalla de inicio"** o **"Instalar app"**
4. Toca **"Agregar"**

**¡Listo!** Ahora tienes un ícono en tu pantalla de inicio que abre la app directamente.

---

## 🔄 USO DIARIO

### **Iniciar la app:**
```bash
cd /storage/emulated/0/bascula
./start_app.sh
```

### **Detener la app:**
- Presiona `Ctrl+C` en Termux
- O ejecuta: `./stop_app.sh`

### **Mantener corriendo en segundo plano:**
1. Inicia la app con `./start_app.sh`
2. Toca el botón de inicio (no cierres Termux)
3. La app seguirá corriendo
4. Accede desde el navegador normalmente

**⚠️ IMPORTANTE:** Si cierras Termux, la app se detiene. Para mantenerla siempre activa, no cierres Termux.

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### **Problema 1: "command not found" al ejecutar setup_termux.sh**

**Solución:**
```bash
pkg install bash
chmod +x setup_termux.sh
bash setup_termux.sh
```

---

### **Problema 2: Error de permisos**

**Solución:**
```bash
termux-setup-storage
# Dale permisos cuando lo pida
cd /storage/emulated/0/bascula
```

---

### **Problema 3: "mysql: command not found"**

**Solución:**
```bash
pkg install mariadb
mysqld_safe &
```

---

### **Problema 4: La app no carga en el navegador**

**Solución:**
1. Verifica que Termux siga abierto
2. Verifica que el script esté corriendo
3. Espera 5-10 segundos después de iniciar
4. Prueba con: `http://127.0.0.1:5000`

---

### **Problema 5: Error "Address already in use"**

**Solución:**
```bash
# Detener cualquier instancia anterior
pkill -f "python app.py"
# Reiniciar
./start_app.sh
```

---

## 💡 CONSEJOS Y TRUCOS

### **1. Crear acceso directo en Termux**

Edita el archivo `.bashrc`:
```bash
nano ~/.bashrc
```

Agrega al final:
```bash
alias bascula='cd /storage/emulated/0/bascula && ./start_app.sh'
```

Guarda: `Ctrl+X`, luego `Y`, luego `Enter`

Recarga:
```bash
source ~/.bashrc
```

Ahora solo escribe `bascula` para iniciar la app.

---

### **2. Iniciar automáticamente al abrir Termux**

Agrega al final de `.bashrc`:
```bash
cd /storage/emulated/0/bascula
echo "💡 Escribe './start_app.sh' para iniciar la báscula"
```

---

### **3. Mantener Termux corriendo en segundo plano**

Instala **Termux:Boot** (desde F-Droid):
- Permite que Termux inicie al encender el móvil
- Tu app puede estar siempre disponible

---

### **4. Acceder desde otros dispositivos**

Tu móvil se convierte en servidor:
- Conecta tu PC/Tablet al mismo WiFi
- Usa la IP que muestra el script
- Ejemplo: `http://192.168.1.50:5000`

---

### **5. Copias de seguridad de la base de datos**

```bash
cd /storage/emulated/0/bascula
mkdir backups
mysqldump -u root bascula > backups/backup_$(date +%Y%m%d).sql
```

---

## 📊 CARACTERÍSTICAS

### **✅ Funciona:**
- Lecturas de peso
- Base de datos MySQL local
- Chatbot con recomendaciones
- Historial de mediciones
- Interfaz completa
- PWA instalable
- Modo offline

### **⚠️ Limitaciones:**
- **Bluetooth:** Requiere configuración adicional de permisos en Termux
- **Rendimiento:** Menor que en PC (pero suficiente)
- **Batería:** Consume más si está siempre activa

---

## 🔐 SEGURIDAD

### **Configurar contraseña de MySQL:**

```bash
mysql -u root
```

Dentro de MySQL:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'tu_contraseña';
FLUSH PRIVILEGES;
EXIT;
```

Luego actualiza `app.py` con la contraseña.

---

## 🎓 PARA USO EN UNIVERSIDAD

### **Escenario: Presentar proyecto**

1. **Antes de la presentación:**
   - Inicia la app en tu móvil
   - Verifica que funcione

2. **Durante la presentación:**
   - Muestra la app desde tu móvil
   - O proyecta desde la PC usando la IP del móvil
   - Todos pueden acceder al mismo tiempo

3. **Ventajas:**
   - No depende de internet de la universidad
   - No depende de una PC específica
   - Portable y siempre disponible

---

## 📞 AYUDA ADICIONAL

### **Si algo no funciona:**

1. **Verifica los logs:**
```bash
cat /data/data/com.termux/files/usr/var/log/mariadb/mariadb.err
```

2. **Reinicia todo:**
```bash
./stop_app.sh
pkill -9 mysqld
./start_app.sh
```

3. **Reinstala desde cero:**
```bash
pkg uninstall mariadb python
pkg clean
./setup_termux.sh
```

---

## 🚀 PRÓXIMOS PASOS

Una vez que funcione:

1. **Personaliza:** Cambia colores, agrega funciones
2. **Bluetooth:** Configura permisos para usar la báscula física
3. **Mejora:** Agrega gráficas, estadísticas avanzadas
4. **Comparte:** Distribuye el ZIP a compañeros

---

## ✅ CHECKLIST DE INSTALACIÓN

- [ ] Termux instalado desde F-Droid
- [ ] Permisos de almacenamiento otorgados
- [ ] Proyecto copiado al móvil
- [ ] Script de instalación ejecutado
- [ ] Base de datos funcionando
- [ ] App iniciada correctamente
- [ ] Acceso desde navegador OK
- [ ] PWA instalada en pantalla de inicio

---

¡Con esto tendrás tu aplicación funcionando completamente en tu móvil Android! 🎉

**Cualquier duda durante la instalación, avísame y te ayudo paso a paso.** 💪
