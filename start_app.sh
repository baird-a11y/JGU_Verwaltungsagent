#!/usr/bin/env bash
# ========================================
# JGU KI-Assistent - Start Script (Linux/macOS)
# ========================================

set -euo pipefail

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  JGU KI-Assistent - Starte Server...                 ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Prüfe ob Node.js installiert ist
if ! command -v node &>/dev/null; then
    echo "✗ FEHLER: Node.js ist nicht installiert!"
    echo ""
    echo "  Bitte installieren Sie Node.js von: https://nodejs.org/"
    echo "  Oder per Paketmanager:"
    echo "    Ubuntu/Debian: sudo apt install nodejs"
    echo "    Fedora:        sudo dnf install nodejs"
    echo "    macOS:         brew install node"
    echo ""
    exit 1
fi

echo "✓ Node.js gefunden: $(node --version)"
echo ""

# Prüfe ob proxy-server.js existiert
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ ! -f "$SCRIPT_DIR/proxy-server.js" ]; then
    echo "✗ FEHLER: proxy-server.js nicht gefunden!"
    echo "  Bitte stellen Sie sicher, dass Sie im richtigen Verzeichnis sind."
    echo ""
    exit 1
fi

echo "✓ Proxy-Server gefunden"
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  Proxy-Server (Port 3000) wird im Hintergrund        ║"
echo "║  gestartet. Webserver (Port 8000) wird gestartet.    ║"
echo "║                                                       ║"
echo "║  Zum Beenden: Strg+C drücken                         ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "Starte in 2 Sekunden..."
sleep 2

# Starte Proxy-Server im Hintergrund
echo "✓ Starte Proxy-Server..."
node "$SCRIPT_DIR/proxy-server.js" &
PROXY_PID=$!
sleep 1

# Beim Beenden beide Prozesse stoppen
cleanup() {
    echo ""
    echo "Beende Server..."
    kill "$PROXY_PID" 2>/dev/null || true
    [ -n "${WEB_PID:-}" ] && kill "$WEB_PID" 2>/dev/null || true
    echo "Server wurden beendet."
    exit 0
}
trap cleanup INT TERM

# Prüfe ob Python verfügbar ist
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    PYTHON_CMD=""
fi

if [ -n "$PYTHON_CMD" ]; then
    echo "✓ Starte Python Webserver (Port 8000)..."
    cd "$SCRIPT_DIR"
    $PYTHON_CMD -m http.server 8000 &
    WEB_PID=$!
    sleep 2

    echo ""
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║  ✓ ALLES GESTARTET!                                   ║"
    echo "╠═══════════════════════════════════════════════════════╣"
    echo "║  Öffnen Sie im Browser:                               ║"
    echo "║  http://localhost:8000/JGU_Agenten.html               ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo ""

    # Versuche Browser zu öffnen
    sleep 1
    if command -v xdg-open &>/dev/null; then
        xdg-open "http://localhost:8000/JGU_Agenten.html" &>/dev/null &
    elif command -v open &>/dev/null; then
        open "http://localhost:8000/JGU_Agenten.html" &>/dev/null &
    fi
else
    echo ""
    echo "⚠ HINWEIS: Python nicht gefunden!"
    echo "  Alternativen:"
    echo "    - VSCode Live Server: Rechtsklick auf JGU_Agenten.html → 'Open with Live Server'"
    echo "    - npx: npx http-server (Node.js muss installiert sein)"
    echo ""
    echo "✓ Proxy-Server läuft auf: http://localhost:3000"
    echo ""
fi

echo "Drücken Sie Strg+C zum Beenden..."
# Warte auf Hintergrundprozesse
wait
