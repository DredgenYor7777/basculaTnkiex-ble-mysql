"""
Script para crear iconos PNG desde SVG
Instala: pip install pillow cairosvg
Ejecuta: python crear_iconos.py
"""
try:
    import cairosvg
    from PIL import Image
    import io

    # Leer SVG
    with open('public/icon.svg', 'r') as f:
        svg_data = f.read()

    # Crear icono 192x192
    png_192 = cairosvg.svg2png(bytestring=svg_data.encode('utf-8'), output_width=192, output_height=192)
    with open('public/icon-192.png', 'wb') as f:
        f.write(png_192)
    print('✅ Icono 192x192 creado')

    # Crear icono 512x512
    png_512 = cairosvg.svg2png(bytestring=svg_data.encode('utf-8'), output_width=512, output_height=512)
    with open('public/icon-512.png', 'wb') as f:
        f.write(png_512)
    print('✅ Icono 512x512 creado')

except ImportError:
    print('❌ Necesitas instalar: pip install pillow cairosvg')
    print('O puedes usar cualquier convertidor online SVG → PNG')
    print('Sube public/icon.svg a: https://convertio.co/es/svg-png/')
    print('Descarga en 192x192 y 512x512')
