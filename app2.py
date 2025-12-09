from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_HOST = "localhost"
DB_USER = "root"
DB_PASS = "cayde"
DB_NAME = "bascula_db"

def get_db():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )

# ------------------------
#  API PARA AGREGAR PESO
# ------------------------
@app.route("/api/agregar", methods=["POST"])
def agregar():
    data = request.json
    peso = data.get("peso")

    if peso is None:
        return jsonify({"error": "Falta el peso"}), 400

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO lecturas (peso, fecha) VALUES (%s, NOW())",
        (peso,)
    )

    conn.commit()
    conn.close()

    return jsonify({"status": "OK", "peso": peso})

# ------------------------
#  API PARA LEER LECTURAS
# ------------------------
@app.route("/api/lecturas", methods=["GET"])
def lecturas():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, peso, fecha 
        FROM lecturas 
        ORDER BY fecha DESC 
        LIMIT 200
    """)

    data = cur.fetchall()
    conn.close()

    return jsonify(data)

# ------------------------
#  HOME
# ------------------------
@app.route("/")
def home():
    return "Servidor Flask OK"

app.run(host="0.0.0.0", port=5000, debug=True)
