@echo off
REM ========================================
REM JGU KI-Assistent - Nur Proxy starten
REM (Für VSCode Live Server Benutzer)
REM ========================================

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║  JGU KI-Assistent - Proxy-Server                      ║
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

echo ✓ Node.js gefunden:
node --version
echo.

REM Starte Proxy-Server
echo ✓ Starte Proxy-Server...
echo.
echo   Verwenden Sie VSCode Live Server für die HTML-Datei!
echo   Rechtsklick auf JGU_Agenten.html → "Open with Live Server"
echo.
echo ═══════════════════════════════════════════════════════
echo.

node proxy-server.js
