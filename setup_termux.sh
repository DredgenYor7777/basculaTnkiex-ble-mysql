#!/data/data/com.termux/files/usr/bin/bash

# ============================================
#  INSTALADOR AUTOMÁTICO - BÁSCULA APP
#  Para Termux en Android
# ============================================

echo "════════════════════════════════════════"
echo "  📱 INSTALANDO BÁSCULA APP EN ANDROID"
echo "════════════════════════════════════════"
echo ""

# Actualizar paquetes
echo "📦 Actualizando paquetes de Termux..."
pkg update -y
pkg upgrade -y

# Instalar dependencias del sistema
echo ""
echo "🔧 Instalando dependencias del sistema..."
pkg install -y python
pkg install -y python-pip
pkg install -y git
pkg install -y mariadb
pkg install -y termux-api

# Instalar dependencias de Python
echo ""
echo "🐍 Instalando dependencias de Python..."
pip install --upgrade pip
pip install -r requirements_termux.txt

# Configurar MariaDB
echo ""
echo "💾 Configurando base de datos..."
echo "Iniciando MariaDB..."

# Iniciar MariaDB si no está corriendo
if ! pgrep -x "mysqld" > /dev/null; then
    mysqld_safe &
    sleep 5
fi

# Crear base de datos y tabla
echo "Creando base de datos 'bascula'..."
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS bascula;
USE bascula;

CREATE TABLE IF NOT EXISTS lecturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    peso DECIMAL(5,2) NOT NULL,
    usuario VARCHAR(100),
    altura DECIMAL(3,2),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    recomendacion TEXT DEFAULT NULL
);

-- Insertar datos de ejemplo
INSERT INTO lecturas (peso, usuario, altura) VALUES
(70.5, 'Juan Pérez', 1.75),
(65.2, 'María García', 1.68),
(82.3, 'Carlos López', 1.80);

FLUSH PRIVILEGES;
EOF

echo ""
echo "✅ Base de datos configurada correctamente"

# Crear script de inicio
echo ""
echo "📝 Creando script de inicio..."
cat > start_app.sh <<'STARTSCRIPT'
#!/data/data/com.termux/files/usr/bin/bash

# Iniciar MariaDB si no está corriendo
if ! pgrep -x "mysqld" > /dev/null; then
    echo "🔄 Iniciando base de datos..."
    mysqld_safe &
    sleep 3
fi

# Obtener IP local
IP=$(ip -4 addr show wlan0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | head -n 1)

echo ""
echo "════════════════════════════════════════"
echo "  🚀 INICIANDO BÁSCULA APP"
echo "════════════════════════════════════════"
echo ""
echo "📱 Accede desde este dispositivo:"
echo "   http://localhost:5000"
echo ""
echo "🌐 Accede desde otros dispositivos:"
echo "   http://$IP:5000"
echo ""
echo "════════════════════════════════════════"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar Flask
python app.py
STARTSCRIPT

chmod +x start_app.sh

# Crear script de detención
cat > stop_app.sh <<'STOPSCRIPT'
#!/data/data/com.termux/files/usr/bin/bash

echo "🛑 Deteniendo aplicación..."
pkill -f "python app.py"
pkill -f "mysqld"
echo "✅ Aplicación detenida"
STOPSCRIPT

chmod +x stop_app.sh

echo ""
echo "════════════════════════════════════════"
echo "  ✅ INSTALACIÓN COMPLETADA"
echo "════════════════════════════════════════"
echo ""
echo "📱 Para iniciar la aplicación, ejecuta:"
echo "   ./start_app.sh"
echo ""
echo "🛑 Para detener la aplicación:"
echo "   ./stop_app.sh"
echo ""
echo "💡 CONSEJO: Instala la PWA desde el navegador"
echo "   para tener un acceso directo como app"
echo ""
echo "════════════════════════════════════════"
