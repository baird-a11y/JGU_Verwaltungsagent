# KI-Assistent Web-Anwendung - JGU Mainz

> **WICHTIGER HINWEIS:** Dies ist ein Konzept zur Überprüfung der Machbarkeit und Funktionalität.

## 🚀 Schnellstart

1. **Proxy-Server starten** (Terminal 1):
   ```bash
   node proxy-server.js
   ```

2. **Live Server starten** (VSCode):
   - Rechtsklick auf `JGU_Agenten.html` → "Open with Live Server"

3. **App im Browser öffnen** - Automatisch oder manuell: http://localhost:5500/JGU_Agenten.html

**Oder einfach:** Doppelklick auf `START_APP.bat` (Windows)

➡️ **Wichtig:** Siehe [PROXY_ANLEITUNG.md](PROXY_ANLEITUNG.md) für Details zum CORS-Problem

## Übersicht

Eine benutzerfreundliche Web-Anwendung für die Nutzung der KI-Services der Johannes Gutenberg-Universität Mainz. Die Anwendung bietet vorgefertigte Prompts für häufige Aufgaben und **dynamische Modell-Auswahl** direkt von der API.

## Features

###  Vorgefertigte KI-Agenten

- **Text zusammenfassen** - Automatische Erstellung strukturierter Zusammenfassungen
- **Text übersetzen** - Professionelle Übersetzungen in 6 Sprachen (Deutsch, English, Français, Español, Italiano, Nederlands)
- **E-Mail schreiben** - Verfassen professioneller E-Mails basierend auf Stichpunkten
- **Daten analysieren** - Strukturierte Analyse von Daten mit Handlungsempfehlungen
- **Thema erforschen** - Umfassende Research zu beliebigen Themen
- **Code erstellen** - Entwicklung sauberen Codes in 7 Programmiersprachen

### Datei-Support

- **PDF-Dateien** (.pdf) - Automatische Textextraktion
- **Word-Dokumente** (.docx) - Vollständige Inhaltsverarbeitung
- **Textdateien** (.txt) - Direkter Import
- **Multi-Upload** - Bis zu 3 Dateien gleichzeitig verarbeiten

### Weitere Funktionen

- **Dynamische Modell-Auswahl** - Automatisches Abrufen verfügbarer Modelle von der API
- **Intelligente Modell-Kategorisierung** - Erkennt automatisch Code-, Reasoning-, Vision- und Standard-Modelle
- **API-Key-Verwaltung** - Sichere lokale Speicherung (LocalStorage)
- **Verlaufshistorie** - Automatische Speicherung der letzten 50 Ergebnisse
- **Export-Funktionen** - Ergebnisse speichern oder kopieren
- **Debug-Konsole** - Umfassendes Logging-System mit visueller Konsole (🐛 Button)
- **Responsive Design** - Funktioniert auf Desktop und mobilen Geräten
- **Logo-Integration** - Uni Mainz Branding

## Installation & Setup

### Voraussetzungen

- **Node.js** (v14 oder höher) - [Download](https://nodejs.org/)
- **Webserver** (VSCode Live Server, Python HTTP Server, oder ähnlich)
- **Browser** (Chrome, Firefox, Edge)
- **API-Key** von [ki-chat.uni-mainz.de](https://ki-chat.uni-mainz.de)

### Schritt-für-Schritt-Anleitung

1. **Repository herunterladen/klonen**
   ```bash
   git clone <repository-url>
   cd JGU_Verwaltungsagent
   ```

2. **CORS-Problem verstehen**

   Die JGU API blockiert Browser-Anfragen von localhost. Daher benötigen Sie einen Proxy-Server.

   ➡️ Siehe [PROXY_ANLEITUNG.md](PROXY_ANLEITUNG.md) für Details

3. **Proxy-Server starten** (Terminal 1)
   ```bash
   node proxy-server.js
   ```

4. **Webserver starten** (Terminal 2)

   **Option A - VSCode Live Server (empfohlen):**
   - Rechtsklick auf `JGU_Agenten.html` → "Open with Live Server"

   **Option B - Python:**
   ```bash
   python -m http.server 8000
   # Dann öffnen: http://localhost:8000/JGU_Agenten.html
   ```

   **Option C - Node.js:**
   ```bash
   npx http-server
   # Dann öffnen: http://localhost:8080/JGU_Agenten.html
   ```

5. **App im Browser öffnen**
   - Mit Live Server: Öffnet automatisch
   - Mit Python/Node.js: Siehe URLs oben

6. **API-Key eingeben**
   - Bei erstem Start öffnet sich ein Modal
   - API-Key von [ki-chat.uni-mainz.de](https://ki-chat.uni-mainz.de) einfügen
   - Wie man den Key bekommt: Avatar → Einstellungen → Konto → "Neuen Schlüssel erstellen"

### Alternative: Start-Script (Windows)

Doppelklick auf `START_APP.bat` startet automatisch:
- Proxy-Server (Port 3000)
- Python Webserver (Port 8000)
- Browser mit der App

Für VSCode Live Server Benutzer: `START_PROXY_ONLY.bat`

## Verwendung

1. **API-Key eingeben** (beim ersten Start)
2. **Aufgabe auswählen** (z.B. "Text zusammenfassen")
3. **Text eingeben** oder **Datei hochladen**
4. **"Starten" klicken**
5. **Ergebnis** erscheint nach 10-30 Sekunden
6. **Optional:** Ergebnis kopieren oder speichern

### Debug-Konsole

- **🐛 Button** unten rechts öffnet die Debug-Konsole
- Zeigt alle API-Anfragen, Fehler und System-Logs
- Hilfreich bei Problemen
- Logs können exportiert werden (💾 Export)

## Technische Anforderungen

- **Node.js** v14+ (für Proxy-Server)
- **Moderner Browser** (Chrome, Firefox, Edge, Safari)
- **Internetverbindung** für API-Zugriff
- **Gültiger API-Key** von JGU Mainz

## Projektstruktur

```
JGU_Verwaltungsagent/
├── JGU_Agenten.html         # Haupt-HTML-Datei
├── app.js                   # Hauptlogik (API-Calls, Agenten)
├── styles.css               # Styling
├── logger.js                # Debug-Logging-System
├── logger.css               # Debug-Konsolen-Styling
├── proxy-server.js          # CORS-Proxy-Server (Node.js)
├── START_APP.bat            # Windows-Start-Script (beide Server)
├── START_PROXY_ONLY.bat     # Windows-Start-Script (nur Proxy)
├── PROXY_ANLEITUNG.md       # Detaillierte Proxy-Anleitung
├── SERVER_ANLEITUNG.md      # Server-Setup-Anleitung
└── README.md                # Diese Datei
```

## Roadmap

### ✅ Abgeschlossen

- [x] Aktualisierung des Codes nach offizieller Dokumentation
  - [KI-Chat API Nutzung](https://www.zdv.uni-mainz.de/ki-chat-api-nutzung/)
  - [KI-Chat Agentic Coding](https://www.zdv.uni-mainz.de/ki-chat-agentic-coding/)
- [x] Erstellung einer Testwebseite (offline) für Probezwecke
- [x] Dynamische Modell-Auswahl von der API
- [x] Debug-Logging-System
- [x] CORS-Proxy-Lösung

### 🔜 Nächste Schritte

- [ ] Download der Antworten als Word oder PDF Dokument (Umwandlung von Markdown in passende Formate)
- [ ] Verbesserte PDF/DOCX-Datei-Verarbeitung (aktuell nur Text)
- [ ] Streaming-Support für schnellere Antworten
- [ ] Dark Mode
- [ ] Mehrere Konversationen/Tabs

## Troubleshooting

### CORS-Fehler trotz Proxy

- ✅ Proxy läuft? (`node proxy-server.js`)
- ✅ `app.js` verwendet `http://localhost:3000/api`?
- ✅ Browser-Cache geleert? (Strg + Shift + R)

### "Failed to fetch" Fehler

- ✅ Internetverbindung aktiv?
- ✅ API-Key korrekt eingegeben?
- ✅ Beide Server laufen (Proxy + Webserver)?

### API-Key-Fehler (401 Unauthorized)

- ✅ API-Key von [ki-chat.uni-mainz.de](https://ki-chat.uni-mainz.de) holen
- ✅ Key vollständig kopiert? (keine Leerzeichen)
- ✅ Key noch gültig? (nicht abgelaufen)

### Modelle werden nicht geladen

- ✅ Proxy-Server läuft?
- ✅ Debug-Konsole (🐛) prüfen für Fehlermeldungen
- ✅ Fallback-Modelle werden automatisch verwendet

➡️ Weitere Hilfe: [PROXY_ANLEITUNG.md](PROXY_ANLEITUNG.md)

## Offizielle Dokumentation

- [ZDV KI-Chat](https://www.zdv.uni-mainz.de/ki-an-der-jgu/)
- [KI-Chat API Nutzung](https://www.zdv.uni-mainz.de/ki-chat-api-nutzung/)
- [KI-Chat Agentic Coding](https://www.zdv.uni-mainz.de/ki-chat-agentic-coding/)
- [API-Endpunkt](https://ki-chat.uni-mainz.de/api)

## Lizenz

Dieses Projekt ist für den internen Gebrauch an der Johannes Gutenberg-Universität Mainz bestimmt.

## Kontakt

Bei Fragen oder Anregungen wenden Sie sich bitte an baselt@uni-mainz.de.
