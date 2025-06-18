from flask import Flask, send_from_directory, request, jsonify
from pathlib import Path
import os
import requests

# Initialize Flask app
app = Flask(__name__)

# Calculate absolute paths
BASE_DIR = Path(__file__).parent.parent  # Goes up to TER/
FRONTEND_DIR = BASE_DIR / "front"
HTML_DIR = FRONTEND_DIR / "HTML"

# Configuration
app.static_folder = str(FRONTEND_DIR)
app.static_url_path = "/static"

@app.route("/")
def serve_index():
    """Serve the main index.html file"""
    return send_from_directory(HTML_DIR, "index.html")

@app.route("/<path:page>")
def serve_html_pages(page):
    """Serve other HTML pages from the HTML directory"""
    if not page.endswith('.html'):
        page += '.html'
    return send_from_directory(HTML_DIR, page)

@app.route("/static/<path:filename>")
def serve_static(filename):
    """Serve static files (CSS/JS/Images)"""
    return send_from_directory(FRONTEND_DIR, filename)

@app.route("/api/chat", methods=["POST"])
def chat_with_ollama():
    """Handle Ollama API requests"""
    try:
        data = request.json
        ollama_response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": data.get("message", ""),
                "stream": False,
                "options": {
                    "num_predict": 150
                }
            },
            timeout=150
        )
        ollama_response.raise_for_status()
        return jsonify(ollama_response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Print debug information
    print(f"Project root: {BASE_DIR}")
    print(f"Frontend directory: {FRONTEND_DIR}")
    print(f"HTML directory: {HTML_DIR}")
    print(f"Static files available at: {FRONTEND_DIR}")
    
    # Start the server
    app.run(host="0.0.0.0", port=8000, debug=True)