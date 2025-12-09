@echo off
echo ============================================
echo   CONFIGURANDO FIREWALL PARA LA BASCULA
echo ============================================
echo.

echo Agregando regla de firewall para el puerto 5000...
netsh advfirewall firewall add rule name="Bascula Flask Server" dir=in action=allow protocol=TCP localport=5000

echo.
echo ============================================
echo   FIREWALL CONFIGURADO CORRECTAMENTE
echo ============================================
echo.
echo Ahora puedes acceder desde tu movil usando:
echo http://192.168.1.75:5000
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
