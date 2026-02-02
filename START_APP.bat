@echo off
REM ========================================
REM JGU KI-Assistent - Start Script
REM ========================================

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║  JGU KI-Assistent - Starte Server...                 ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

REM Prüfe ob Node.js installiert ist
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ✗ FEHLER: Node.js ist nicht installiert!
    echo.
    echo   Bitte installieren Sie Node.js von: https://nodejs.org/
    echo   Danach starten Sie dieses Script erneut.
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js gefunden
node --version
echo.

REM Prüfe ob proxy-server.js existiert
if not exist "proxy-server.js" (
    echo ✗ FEHLER: proxy-server.js nicht gefunden!
    echo   Bitte stellen Sie sicher, dass Sie im richtigen Verzeichnis sind.
    echo.
    pause
    exit /b 1
)

echo ✓ Proxy-Server gefunden
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║  WICHTIG: Zwei Fenster werden geöffnet               ║
echo ╠═══════════════════════════════════════════════════════╣
echo ║  1. Proxy-Server (Port 3000)                          ║
echo ║  2. Python Webserver (Port 8000)                      ║
echo ║                                                       ║
echo ║  BEIDE FENSTER MÜSSEN OFFEN BLEIBEN!                  ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo Starte in 3 Sekunden...
timeout /t 3 /nobreak >nul

REM Starte Proxy-Server in neuem Fenster
echo ✓ Starte Proxy-Server...
start "JGU Proxy-Server (Port 3000)" cmd /k "node proxy-server.js"
timeout /t 2 /nobreak >nul

REM Prüfe ob Python verfügbar ist
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo ✓ Starte Python Webserver...
    start "JGU Webserver (Port 8000)" cmd /k "python -m http.server 8000"
    timeout /t 2 /nobreak >nul

    echo.
    echo ╔═══════════════════════════════════════════════════════╗
    echo ║  ✓ ALLES GESTARTET!                                   ║
    echo ╠═══════════════════════════════════════════════════════╣
    echo ║  Öffnen Sie im Browser:                               ║
    echo ║  http://localhost:8000/JGU_Agenten.html               ║
    echo ╚═══════════════════════════════════════════════════════╝
    echo.

    REM Öffne Browser automatisch
    timeout /t 2 /nobreak >nul
    start http://localhost:8000/JGU_Agenten.html
) else (
    echo.
    echo ⚠ HINWEIS: Python nicht gefunden!
    echo   Sie können alternativ VSCode Live Server verwenden.
    echo   Öffnen Sie JGU_Agenten.html in VSCode und wählen Sie:
    echo   Rechtsklick → "Open with Live Server"
    echo.
    echo ✓ Proxy-Server läuft auf: http://localhost:3000
    echo.
)

echo.
echo Drücken Sie eine beliebige Taste zum Beenden...
pause >nul

REM Beende alle gestarteten Server
taskkill /FI "WINDOWTITLE eq JGU Proxy-Server*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq JGU Webserver*" /F >nul 2>nul

echo Server wurden beendet.
