# 📱 INICIO RÁPIDO - Báscula en Android

## 🚀 Instalación en 5 minutos

### **1. Instala Termux**
- Descarga desde: https://f-droid.org/
- Busca "Termux" e instala

### **2. Copia el proyecto**
- Conecta móvil a PC por USB
- Copia carpeta `bascula` a `Almacenamiento interno/`

### **3. En Termux ejecuta:**
```bash
termux-setup-storage
# Dale permisos cuando lo pida

cd /storage/emulated/0/bascula
chmod +x setup_termux.sh
./setup_termux.sh
```

⏱️ **Espera 5-10 minutos** mientras se instala todo

### **4. Inicia la app:**
```bash
./start_app.sh
```

### **5. Abre en el navegador:**
```
http://localhost:5000
```

### **6. Instala como PWA:**
- Menú (3 puntos) → "Agregar a pantalla de inicio"

---

## ✅ ¡Listo!

Ahora tienes tu app funcionando en el móvil:
- ✅ Sin internet
- ✅ Sin PC
- ✅ 100% portable

---

## 📖 ¿Problemas?

Lee la guía completa: [GUIA_TERMUX_ANDROID.md](GUIA_TERMUX_ANDROID.md)

---

## 🔄 Uso diario:

```bash
cd /storage/emulated/0/bascula
./start_app.sh
```

Luego abre el navegador en `http://localhost:5000`
