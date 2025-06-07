from flask import Flask, request, jsonify, send_from_directory
import requests

app = Flask(__name__, static_folder="../front", static_url_path="")

@app.route("/")
def index():
    return send_from_directory("../front/HTML", "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory("../front", path)

@app.route("/api/chat", methods=["POST"])
def chat():
    message = request.json.get("message")
    response = requests.post("http://localhost:11434/api/generate", json={
        "model": "mistral",
        "prompt": message,
        "stream": False
    })
    return jsonify(response.json())

if __name__ == "__main__":
    app.run(debug=True)
