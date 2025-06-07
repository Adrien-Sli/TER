@echo off
echo === Lancement du serveur ===
call venv\Scripts\activate

:: Lancer le modèle en arrière-plan
start "" "cmd /k ollama run mistral"

:: Attendre un peu que le modèle se charge
timeout /t 3 >nul

:: Lancer le serveur Flask
python back\server.py
