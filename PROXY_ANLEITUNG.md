# 🔧 CORS-Problem Lösung mit Proxy-Server

## ❌ Das Problem

Die JGU KI-Chat API blockiert Browser-Anfragen von localhost aufgrund von CORS-Sicherheitsrichtlinien:

```
Access to fetch at 'https://ki-chat.uni-mainz.de/api/models' from origin 'http://127.0.0.1:5500'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Grund:** Die API ist so konfiguriert, dass sie nur Anfragen von bestimmten Domains akzeptiert (vermutlich nur ki-chat.uni-mainz.de), nicht von localhost.

## ✅ Die Lösung: Lokaler Proxy-Server

Ein Proxy-Server auf Ihrem Computer leitet die Anfragen weiter und fügt die benötigten CORS-Header hinzu.

## 🚀 Setup-Anleitung

### Schritt 1: Node.js prüfen/installieren

Prüfen Sie, ob Node.js bereits installiert ist:

```bash
node --version
```

Falls nicht installiert: [Node.js herunterladen](https://nodejs.org/) (LTS-Version empfohlen)

### Schritt 2: Proxy-Server starten

```bash
# Im Projekt-Verzeichnis:
cd H:\JGU_Verwaltungsagent

# Proxy starten:
node proxy-server.js
```

Sie sollten diese Ausgabe sehen:

```
╔═══════════════════════════════════════════════════════╗
║  JGU KI-Chat API Proxy Server                         ║
╚═══════════════════════════════════════════════════════╝

✓ Proxy läuft auf: http://localhost:3000
✓ Leitet weiter an: https://ki-chat.uni-mainz.de
```

### Schritt 3: app.js anpassen

Öffnen Sie [app.js](app.js) und ändern Sie **ALLE** API-URLs von:

```javascript
// ALT:
'https://ki-chat.uni-mainz.de/api/models'
'https://ki-chat.uni-mainz.de/api/chat/completions'

// NEU:
'http://localhost:3000/api/models'
'http://localhost:3000/api/chat/completions'
```

**Konkret:** Ersetzen Sie in app.js:
- Zeile 93: `'https://ki-chat.uni-mainz.de/api/models'` → `'http://localhost:3000/api/models'`
- Zeile 766: `'https://ki-chat.uni-mainz.de/api/chat/completions'` → `'http://localhost:3000/api/chat/completions'`

### Schritt 4: App starten

1. **Proxy läuft weiter** in einem Terminal
2. **Öffnen Sie ein zweites Terminal** und starten Sie Live Server:
   - In VSCode: Rechtsklick auf `JGU_Agenten.html` → "Open with Live Server"
   - Oder: `python -m http.server 8000`

3. **Öffnen Sie die App** im Browser (z.B. http://127.0.0.1:5500)

## 📋 Workflow

Für die Entwicklung benötigen Sie immer **2 laufende Server**:

1. **Proxy-Server** (Terminal 1):
   ```bash
   node proxy-server.js
   ```

2. **Live Server** (Terminal 2 / VSCode):
   - VSCode Live Server ODER
   - `python -m http.server 8000`

## 🐛 Debugging

Der Proxy-Server zeigt alle Anfragen im Terminal:

```
[14:23:45] GET /api/models
  → Forwarding to: https://ki-chat.uni-mainz.de/api/models
  ← Response: 200 OK

[14:23:47] POST /api/chat/completions
  → Forwarding to: https://ki-chat.uni-mainz.de/api/chat/completions
  ← Response: 200 OK
```

## ⚠️ Wichtige Hinweise

### Für die Entwicklung

- Der Proxy läuft NUR lokal auf Ihrem Computer
- Perfekt für Entwicklung und Testing
- API-Key bleibt sicher (wird nur weitergeleitet, nicht gespeichert)

### Für die Produktion

Diese Lösung ist **nur für die Entwicklung**. Für den produktiven Einsatz gibt es 3 Optionen:

1. **App auf ki-chat.uni-mainz.de hosten** (wenn möglich)
   - Dann würde CORS funktionieren (gleiche Domain)

2. **ZDV kontaktieren**
   - Fragen, ob localhost für Entwicklung whitelisted werden kann
   - Oder ob es eine offizielle CORS-Policy gibt

3. **Server-seitige Lösung**
   - Backend-Server, der die API-Calls macht
   - Frontend kommuniziert mit eigenem Backend

## 🔧 Fehlerbehebung

### "Port 3000 ist bereits belegt"

Ändern Sie in [proxy-server.js](proxy-server.js#L12) den Port:

```javascript
const PORT = 3001;  // Oder 3002, 3003, etc.
```

Dann auch in app.js anpassen: `http://localhost:3001/api/...`

### "Cannot find module 'http'"

Node.js ist nicht korrekt installiert. Installieren Sie Node.js neu von https://nodejs.org/

### "ECONNREFUSED" beim Proxy

- Überprüfen Sie Ihre Internetverbindung
- Prüfen Sie, ob ki-chat.uni-mainz.de erreichbar ist
- Firewall-Einstellungen prüfen

### App zeigt immer noch CORS-Fehler

- Stellen Sie sicher, der Proxy läuft (Terminal 1)
- Überprüfen Sie, dass ALLE URLs in app.js geändert wurden
- Browser-Cache leeren (Strg + Shift + R)

## 📞 Support

Falls Probleme auftreten:

1. Prüfen Sie die Debug-Konsole in der App (🐛 Button)
2. Prüfen Sie die Proxy-Terminal-Ausgabe
3. Kontaktieren Sie ZDV-Support für API-Fragen: https://www.zdv.uni-mainz.de/

## 🎯 Zusammenfassung

**Was Sie brauchen:**
- ✅ Node.js installiert
- ✅ Terminal 1: `node proxy-server.js` (Port 3000)
- ✅ Terminal 2: VSCode Live Server (Port 5500)
- ✅ app.js: API-URLs auf `localhost:3000` geändert
- ✅ Browser: App öffnen und testen

**Dann funktioniert die App ohne CORS-Fehler!** 🎉
