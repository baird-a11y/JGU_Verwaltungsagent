# KI-Assistent Web-Anwendung - JGU Mainz

> **WICHTIGER HINWEIS:** Dies ist ein Konzept zur Überprüfung der Machbarkeit und Funktionalität.

## Schnellstart

**Windows:**
```
START_APP.bat
```

**Linux / macOS:**
```bash
./start_app.sh
```

Startet automatisch Proxy-Server (Port 3000) + Python-Webserver (Port 8000) und öffnet den Browser.

Für VSCode Live Server Nutzer: `START_PROXY_ONLY.bat` bzw. `./start_proxy_only.sh`

> Beim ersten Ausführen auf Linux/macOS ggf. einmalig ausführbar machen:
> ```bash
> chmod +x start_app.sh start_proxy_only.sh
> ```

➡️ Siehe [PROXY_ANLEITUNG.md](PROXY_ANLEITUNG.md) für Details zum CORS-Problem

---

## Übersicht

Eine benutzerfreundliche Web-Anwendung für die Nutzung der KI-Services der Johannes Gutenberg-Universität Mainz. Die Anwendung bietet vorgefertigte Prompts für häufige Aufgaben und dynamische Modell-Auswahl direkt von der API.

## Features

### Vorgefertigte KI-Agenten

- **Text zusammenfassen** – Strukturierte Zusammenfassungen
- **Text übersetzen** – Professionelle Übersetzungen in 6 Sprachen (Deutsch, English, Français, Español, Italiano, Nederlands)
- **E-Mail schreiben** – Professionelle E-Mails aus Stichpunkten
- **Daten analysieren** – Strukturierte Analyse mit Handlungsempfehlungen
- **Thema erforschen** – Umfassende Research zu beliebigen Themen
- **Code erstellen** – Sauberer Code in 7 Programmiersprachen

### Datei-Support

- **PDF-Dateien** (.pdf) – Automatische Textextraktion via PDF.js
- **Textdateien** (.txt) – Direkter Import
- **Multi-Upload** – Bis zu 3 Dateien gleichzeitig

> **Hinweis:** Große Dokumente werden auf 12.000 Zeichen gekürzt (ca. 3.000 Tokens), da das Modell ein begrenztes Kontextfenster hat. Nur der erste Teil des Dokuments wird verarbeitet.

> **DOCX:** Word-Dateien werden aktuell nicht korrekt verarbeitet – bitte als .txt oder .pdf exportieren.

### Weitere Funktionen

- **Dynamische Modell-Auswahl** – Automatisches Abrufen verfügbarer Modelle von der API
- **Intelligente Modell-Kategorisierung** – Erkennt automatisch Code-, Reasoning-, Vision- und Standard-Modelle
- **API-Key-Verwaltung** – Sichere lokale Speicherung (LocalStorage)
- **Verlaufshistorie** – Automatische Speicherung der letzten 50 Ergebnisse
- **Export-Funktionen** – Ergebnisse speichern oder kopieren
- **Debug-Konsole** – Umfassendes Logging-System (🐛 Button)
- **Responsive Design** – Funktioniert auf Desktop und mobilen Geräten

---

## Installation & Setup

### Voraussetzungen

- **Node.js** (v14 oder höher) – [Download](https://nodejs.org/)
- **Webserver** (VSCode Live Server, Python HTTP Server, oder ähnlich)
- **Browser** (Chrome, Firefox, Edge)
- **API-Key** von [ki-chat.uni-mainz.de](https://ki-chat.uni-mainz.de)

### Schritt-für-Schritt-Anleitung

1. **Repository herunterladen/klonen**
   ```bash
   git clone <repository-url>
   cd JGU_Verwaltungsagent
   ```

2. **Proxy-Server starten** (Terminal 1)
   ```bash
   node proxy-server.js
   ```

3. **Webserver starten** (Terminal 2)

   **Option A – VSCode Live Server (empfohlen):**
   Rechtsklick auf `JGU_Agenten.html` → "Open with Live Server"

   **Option B – Python:**
   ```bash
   python3 -m http.server 8000
   # Dann öffnen: http://localhost:8000/JGU_Agenten.html
   ```

   **Option C – Node.js:**
   ```bash
   npx http-server
   # Dann öffnen: http://localhost:8080/JGU_Agenten.html
   ```

4. **API-Key eingeben**
   - Beim ersten Start öffnet sich ein Modal
   - API-Key von [ki-chat.uni-mainz.de](https://ki-chat.uni-mainz.de)
   - Pfad: Avatar → Einstellungen → Konto → "Neuen Schlüssel erstellen"

---

## Verwendung

1. **API-Key eingeben** (beim ersten Start)
2. **Aufgabe auswählen** (z.B. "Text zusammenfassen")
3. **Text eingeben** oder **Datei hochladen** (.txt oder .pdf)
4. **"Starten" klicken**
5. **Ergebnis** erscheint nach 10–30 Sekunden
6. **Optional:** Ergebnis kopieren oder speichern

### Debug-Konsole

Der **🐛 Button** unten rechts öffnet die Debug-Konsole. Sie zeigt alle API-Anfragen, Fehler und System-Logs. Hilfreich bei Problemen – Logs können exportiert werden.

---

## Projektstruktur

```
JGU_Verwaltungsagent/
├── JGU_Agenten.html         # Haupt-HTML-Datei
├── app.js                   # Hauptlogik (API-Calls, Agenten, Datei-Verarbeitung)
├── styles.css               # Styling
├── logger.js                # Debug-Logging-System
├── logger.css               # Debug-Konsolen-Styling
├── proxy-server.js          # CORS-Proxy-Server (Node.js)
├── START_APP.bat            # Windows: beide Server + Browser
├── START_PROXY_ONLY.bat     # Windows: nur Proxy (für VSCode Live Server)
├── start_app.sh             # Linux/macOS: beide Server + Browser
├── start_proxy_only.sh      # Linux/macOS: nur Proxy (für VSCode Live Server)
├── PROXY_ANLEITUNG.md       # Detaillierte Proxy-Anleitung
├── SERVER_ANLEITUNG.md      # Server-Setup-Anleitung
└── README.md                # Diese Datei
```

---

## Roadmap

### Abgeschlossen

- [x] Dynamische Modell-Auswahl von der API
- [x] Debug-Logging-System
- [x] CORS-Proxy-Lösung
- [x] Linux/macOS Start-Skripte
- [x] PDF-Textextraktion via PDF.js

### Nächste Schritte

- [ ] Download der Antworten als Word- oder PDF-Dokument
- [ ] DOCX-Dateiverarbeitung
- [ ] Chunking für große Dokumente (aktuell: Kürzung auf 12.000 Zeichen)
- [ ] Streaming-Support für schnellere Antworten
- [ ] Dark Mode

---

## Troubleshooting

### 400 Bad Request beim Senden

- ✅ Dokument zu groß? Große PDFs werden auf 12.000 Zeichen gekürzt – dies sollte automatisch passieren. Falls nicht: Browser-Cache leeren (Strg+Shift+R)
- ✅ Modell korrekt geladen? Debug-Konsole (🐛) prüfen

### CORS-Fehler trotz Proxy

- ✅ Proxy läuft? (`node proxy-server.js`)
- ✅ `app.js` verwendet `http://localhost:3000/api`?
- ✅ Browser-Cache geleert? (Strg+Shift+R)

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
- ✅ Debug-Konsole (🐛) prüfen
- ✅ Fallback-Modelle werden automatisch verwendet

➡️ Weitere Hilfe: [PROXY_ANLEITUNG.md](PROXY_ANLEITUNG.md)

---

## Offizielle Dokumentation

- [ZDV KI-Chat](https://www.zdv.uni-mainz.de/ki-an-der-jgu/)
- [KI-Chat API Nutzung](https://www.zdv.uni-mainz.de/ki-chat-api-nutzung/)
- [KI-Chat Agentic Coding](https://www.zdv.uni-mainz.de/ki-chat-agentic-coding/)
- [API-Endpunkt](https://ki-chat.uni-mainz.de/api)

## Lizenz

Dieses Projekt ist für den internen Gebrauch an der Johannes Gutenberg-Universität Mainz bestimmt.

## Kontakt

Bei Fragen oder Anregungen: baselt@uni-mainz.de
