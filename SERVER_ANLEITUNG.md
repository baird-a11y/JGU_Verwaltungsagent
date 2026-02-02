# 🚀 Server-Anleitung für JGU KI-Assistent

## ⚠️ WICHTIG: CORS-Problem und Proxy-Server

Die App benötigt **2 Server** für die lokale Entwicklung:

1. **Proxy-Server** (löst CORS-Probleme mit der JGU API)
2. **Webserver** (für die HTML-Datei)

### 🔴 CORS-Problem

Die JGU KI-Chat API blockiert Browser-Anfragen von localhost. Daher muss ein Proxy-Server verwendet werden.

**➡️ Siehe [PROXY_ANLEITUNG.md](PROXY_ANLEITUNG.md) für die komplette Lösung!**

## 📋 Schnellstart

1. **Terminal 1 - Proxy starten:**
   ```bash
   node proxy-server.js
   ```

2. **Terminal 2 - Webserver starten** (siehe Optionen unten)

3. **Browser öffnen** und App nutzen

---

## ⚠️ ALTE ANLEITUNG (Webserver ohne Proxy - funktioniert NICHT vollständig!)

Die App kann **nicht** direkt durch Doppelklick auf die HTML-Datei geöffnet werden, da dies CORS-Fehler verursacht (Browser-Sicherheitsrichtlinien).

## 🎯 Lösung: Lokalen Webserver starten

### Option 1: VSCode Live Server (Empfohlen)

1. **Installieren Sie die "Live Server" Extension in VSCode**
   - Öffnen Sie VSCode
   - Drücken Sie `Ctrl+Shift+X` (Extensions)
   - Suchen Sie nach "Live Server"
   - Installieren Sie die Extension von Ritwick Dey

2. **Starten Sie den Server**
   - Öffnen Sie den Projekt-Ordner in VSCode
   - Rechtsklick auf `JGU_Agenten.html`
   - Wählen Sie "Open with Live Server"
   - Die App öffnet sich automatisch im Browser unter `http://127.0.0.1:5500`

### Option 2: Python HTTP Server

Wenn Python installiert ist:

```bash
# Im Projekt-Verzeichnis:
cd H:\JGU_Verwaltungsagent

# Python 3:
python -m http.server 8000

# Dann öffnen Sie im Browser:
# http://localhost:8000/JGU_Agenten.html
```

### Option 3: Node.js HTTP Server

Wenn Node.js installiert ist:

```bash
# Installieren Sie http-server global:
npm install -g http-server

# Im Projekt-Verzeichnis:
cd H:\JGU_Verwaltungsagent
http-server

# Dann öffnen Sie im Browser:
# http://localhost:8080/JGU_Agenten.html
```

### Option 4: PHP Built-in Server

Wenn PHP installiert ist:

```bash
# Im Projekt-Verzeichnis:
cd H:\JGU_Verwaltungsagent
php -S localhost:8000

# Dann öffnen Sie im Browser:
# http://localhost:8000/JGU_Agenten.html
```

## ✅ So erkennen Sie, dass es funktioniert

1. Die URL im Browser sollte mit `http://` beginnen (nicht `file://`)
2. In der Debug-Konsole (🐛 Button) sollten Sie sehen:
   ```
   [INFO] 📋 Hole verfügbare Modelle von der API...
   [SUCCESS] ✅ Verfügbare Modelle geladen
   ```
3. Keine "Failed to fetch" Fehler

## 🐛 Troubleshooting

### "Failed to fetch" Fehler

**Ursache:** App läuft als lokale Datei (`file://`)

**Lösung:** Siehe Server-Optionen oben

### API-Key Fehler

**Ursache:** API-Key fehlt oder ist ungültig

**Lösung:**
1. Gehen Sie zu https://ki-chat.uni-mainz.de
2. Einstellungen → Konto → API-Schlüssel
3. Erstellen Sie einen neuen Key
4. Fügen Sie ihn in der App ein

### CORS-Fehler trotz Webserver

**Ursache:** API erlaubt keine Anfragen von localhost

**Lösung:** Dies sollte nicht passieren. Falls doch:
- Prüfen Sie Ihre Firewall
- Prüfen Sie Ihren API-Key
- Kontaktieren Sie den ZDV-Support

## 📝 Notizen

- Die App verwendet die offizielle JGU KI-Chat API
- Alle Anfragen gehen direkt an `ki-chat.uni-mainz.de`
- Es werden keine Daten lokal gespeichert (außer API-Key und Historie)
- Der API-Key wird verschlüsselt in localStorage gespeichert

## 🔗 Weitere Informationen

- [ZDV KI-Chat](https://www.zdv.uni-mainz.de/ki-an-der-jgu/)
- [API-Dokumentation](https://www.zdv.uni-mainz.de/ki-chat-api-nutzung/)
