#!/usr/bin/env bash
# ========================================
# JGU KI-Assistent - Nur Proxy starten
# (Für VSCode Live Server Benutzer)
# ========================================

set -euo pipefail

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  JGU KI-Assistent - Proxy-Server                      ║"
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
echo "✓ Starte Proxy-Server..."
echo ""
echo "  Verwenden Sie VSCode Live Server für die HTML-Datei!"
echo "  Rechtsklick auf JGU_Agenten.html → 'Open with Live Server'"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/proxy-server.js"
