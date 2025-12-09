import asyncio
import requests
from bleak import BleakScanner

TARGET_MAC = "7E:0A:51:29:3F:F4"  # <- tu báscula
API_URL = "http://127.0.0.1:5000/api/agregar"

def decode_weight(data):
    # Big endian: primeros 2 bytes
    if len(data) < 2:
        return None
    raw = int.from_bytes(data[0:2], byteorder="big")
    return raw / 100

def procesar(device, adv):
    if device.address.upper() != TARGET_MAC:
        return

    for _, v in adv.manufacturer_data.items():
        peso = decode_weight(v)
        if peso is None:
            continue

        print(f"📦 Raw: {v.hex()}")
        print(f"⚖ Peso: {peso:.2f} kg")

        try:
            # Enviar al servidor Flask
            r = requests.post(API_URL, json={"peso": peso})
            print(f"💾 Guardado en MySQL: {peso:.2f} kg → {r.text}")
        except Exception as e:
            print("❌ Error enviando al servidor:", e)

async def main():
    print("🟦 Escuchando la báscula OKOK…")
    
    scanner = BleakScanner(procesar)
    await scanner.start()
    await asyncio.sleep(9999)  # nunca se detiene
    await scanner.stop()

asyncio.run(main())
