# 📱 SOLUCIÓN: Acceder desde móvil

## ❗ Problema
El móvil no puede acceder a `http://192.168.1.75:5000`

## ✅ SOLUCIÓN EN 3 PASOS

---

### **PASO 1: Configurar el Firewall de Windows**

**OPCIÓN A: Automático (MÁS FÁCIL)**
1. Abre `configurar_firewall.bat` **como Administrador**
   - Click derecho → "Ejecutar como administrador"
2. ¡Listo! El firewall ya está configurado

**OPCIÓN B: Manual**
1. Presiona `Windows + R`
2. Escribe: `wf.msc` y presiona Enter
3. Click en "Reglas de entrada" (panel izquierdo)
4. Click en "Nueva regla..." (panel derecho)
5. Selecciona "Puerto" → Siguiente
6. TCP → Puerto local específico: `5000` → Siguiente
7. "Permitir la conexión" → Siguiente
8. Marca todo (Dominio, Privado, Público) → Siguiente
9. Nombre: `Bascula Flask` → Finalizar

---

### **PASO 2: Iniciar el servidor**

```bash
python app.py
```

Debes ver algo como:
```
 * Running on http://0.0.0.0:5000
 * Running on http://192.168.1.75:5000
```

---

### **PASO 3: Conectar desde el móvil**

**IMPORTANTE:** Móvil y PC deben estar en la **MISMA red WiFi**

1. En tu móvil, conecta al mismo WiFi de tu PC
2. Abre el navegador (Chrome/Safari)
3. Escribe: `http://192.168.1.75:5000`
4. ¡Deberías ver el dashboard!

---

## 🔍 VERIFICACIÓN

### ✅ Probar primero desde tu PC

Antes de probar en el móvil, abre en tu PC:
```
http://192.168.1.75:5000
```

**Si funciona en PC pero NO en móvil:**
- El problema es la red WiFi
- Verifica que el móvil esté en el mismo WiFi
- Algunos routers separan las redes (2.4GHz vs 5GHz)

**Si NO funciona ni en PC:**
- El problema es el firewall
- Ejecuta `configurar_firewall.bat` como administrador

---

## 🚨 PROBLEMAS COMUNES

### Problema 1: "No se puede conectar"
**Solución:**
```bash
# Verifica que el servidor esté escuchando
netstat -an | findstr 5000
```
Debe aparecer: `0.0.0.0:5000`

### Problema 2: "Tiempo de espera agotado"
**Solución:**
- Desactiva temporalmente el firewall para probar:
  - Panel de control → Firewall de Windows → Activar o desactivar
  - Si funciona al desactivarlo, el problema ES el firewall
  - Vuelve a activarlo y configura la regla correctamente

### Problema 3: "La IP cambió"
**Solución:**
- Tu IP puede cambiar si reinicias el router
- Ejecuta `ipconfig` de nuevo para ver la nueva IP
- Actualiza la URL en el móvil

### Problema 4: "Funciona en casa pero no en la uni"
**Solución:**
- En la universidad, averigua la IP con `ipconfig`
- La IP será diferente (ejemplo: 10.x.x.x o 172.x.x.x)
- Usa la nueva IP en el móvil

---

## 📋 CHECKLIST COMPLETO

Antes de contactar soporte, verifica:

- [ ] ✅ Servidor corriendo (`python app.py`)
- [ ] ✅ Firewall configurado (`configurar_firewall.bat`)
- [ ] ✅ Móvil conectado al mismo WiFi
- [ ] ✅ Probaste `http://192.168.1.75:5000` en tu PC
- [ ] ✅ IP correcta (ejecuta `ipconfig` para confirmar)

---

## 🎯 RESUMEN RÁPIDO

```bash
# 1. Configurar firewall (como admin)
configurar_firewall.bat

# 2. Iniciar servidor
python app.py

# 3. En móvil (mismo WiFi)
http://192.168.1.75:5000
```

---

## 💡 CONSEJOS

- **IP Fija (Opcional):** Puedes configurar tu PC con IP fija en el router para que no cambie
- **PWA:** Una vez que accedas, instala la PWA desde el menú del navegador
- **Universidad:** Repite los pasos 2 y 3, la IP será diferente pero el proceso es igual

---

¡Con esto debería funcionar perfectamente! 🚀
