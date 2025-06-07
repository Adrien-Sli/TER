@echo off
echo === Installation de l'environnement Python ===

:: Vérifie que Python est installé
where python >nul 2>nul || (
    echo Python n'est pas installé. Merci de l'installer avant de continuer.
    pause
    exit /b
)

:: Créer un environnement virtuel
python -m venv venv
call venv\Scripts\activate

:: Installer Flask et requests
pip install flask requests

:: Vérifie que Ollama est installé
where ollama >nul 2>nul || (
    echo Ollama non détecté. Téléchargement...
    powershell -Command "Invoke-WebRequest https://ollama.com/download/OllamaSetup.exe -OutFile OllamaSetup.exe"
    start /wait OllamaSetup.exe
)

echo Installation terminée.
pause
