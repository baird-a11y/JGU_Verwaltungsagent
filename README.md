# KI-Assistent Web-Anwendung - JGU Mainz

> **WICHTIGER HINWEIS:** Dies ist ein Konzept zur Überprüfung der Machbarkeit und Funktionalität.

## Schnellstart

**PHP-Server (empfohlen für Webserver-Deployment):**
```bash
php -S localhost:8080
# Dann öffnen: http://localhost:8080/JGU_Agenten.html
```

**Windows (Node.js lokal):**
```
START_APP.bat
```

**Linux / macOS (Node.js lokal):**
```bash
./start_app.sh
```

> Beim ersten Ausführen auf Linux/macOS ggf. einmalig ausführbar machen:
> ```bash
> chmod +x start_app.sh start_proxy_only.sh
> ```

➡️ Siehe [PROXY_ANLEITUNG.md](PROXY_ANLEITUNG.md) für Details zum CORS-Problem

---

## Übersicht

Eine benutzerfreundliche Web-Anwendung für die Nutzung der KI-Services der Johannes Gutenberg-Universität Mainz. Die Anwendung bietet vorgefertigte Prompts für häufige Aufgaben, dynamische Modell-Auswahl direkt von der API sowie eine datenbankgestützte Prompt-Bibliothek.

## Features

### Vorgefertigte KI-Agenten

- **Text zusammenfassen** – Strukturierte Zusammenfassungen
- **Text übersetzen** – Professionelle Übersetzungen in 6 Sprachen (Deutsch, English, Français, Español, Italiano, Nederlands)
- **E-Mail schreiben** – Professionelle E-Mails aus Stichpunkten
- **Daten analysieren** – Strukturierte Analyse mit Handlungsempfehlungen
- **Thema erforschen** – Umfassende Research zu beliebigen Themen
- **Code erstellen** – Sauberer Code in 7 Programmiersprachen

### Prompt-Bibliothek

- **Zentrale Prompt-Verwaltung** – Prompts in MariaDB gespeichert, per Knopfdruck abrufbar
- **Suche & Kategorien** – Volltextsuche und Filterung nach Kategorie
- **Übernehmen & anpassen** – Prompt ins Eingabefeld laden, ohne die Datenbank zu verändern

### Datei-Support

- **PDF-Dateien** (.pdf) – Automatische Textextraktion via PDF.js
- **Textdateien** (.txt) – Direkter Import
- **Multi-Upload** – Bis zu 3 Dateien gleichzeitig

> **Hinweis:** Große Dokumente werden auf 12.000 Zeichen gekürzt (ca. 3.000 Tokens), da das Modell ein begrenztes Kontextfenster hat. Nur der erste Teil des Dokuments wird verarbeitet.

> **DOCX:** Word-Dateien werden aktuell nicht korrekt verarbeitet – bitte als .txt oder .pdf exportieren.

### Weitere Funktionen

- **Automatische Proxy-Erkennung** – Erkennt beim Start selbst, ob PHP-Proxy oder Node.js-Proxy verfügbar ist
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

- **PHP** (v7.4 oder höher) mit `curl`- und `pdo_mysql`-Extension
- **MariaDB** (v10.5 oder höher)
- **Browser** (Chrome, Firefox, Edge)
- **API-Key** von [ki-chat.uni-mainz.de](https://ki-chat.uni-mainz.de)

> Node.js wird für den Betrieb auf einem Webserver nicht mehr benötigt. Nur für lokale Entwicklung ohne PHP weiterhin optional nutzbar.

### Schritt-für-Schritt-Anleitung

#### 1. Repository herunterladen/klonen
```bash
git clone <repository-url>
cd JGU_Verwaltungsagent
```

#### 2. Datenbank einrichten

**Option A – Webserver:** SQL-Datei beim Hoster einreichen bzw. über phpMyAdmin ausführen:
```
database/setup_webserver.sql
```

**Option B – Lokal (Fedora/RHEL):**
```bash
sudo dnf install mariadb-server php-mysqlnd
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo mysql_secure_installation
mysql -u root -p < database/setup_webserver.sql
```

#### 3. Datenbankverbindung konfigurieren

In [db_config.php](db_config.php) die Zugangsdaten anpassen:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'jgu_agenten');
define('DB_USER', 'jgu_app');
define('DB_PASS', 'HIER_PASSWORT_SETZEN');
```

#### 4. PHP-Server starten
```bash
php -S localhost:8080
# Dann öffnen: http://localhost:8080/JGU_Agenten.html
```

#### 5. API-Key eingeben
- Beim ersten Start öffnet sich ein Modal
- API-Key von [ki-chat.uni-mainz.de](https://ki-chat.uni-mainz.de)
- Pfad: Avatar → Einstellungen → Konto → „Neuen Schlüssel erstellen"

---

## Verwendung

1. **API-Key eingeben** (beim ersten Start)
2. **Aufgabe auswählen** (z.B. „Text zusammenfassen") oder **Prompt aus der Bibliothek übernehmen**
3. **Text eingeben** oder **Datei hochladen** (.txt oder .pdf)
4. **„Starten" klicken**
5. **Ergebnis** erscheint nach 10–30 Sekunden
6. **Optional:** Ergebnis kopieren oder speichern

### Prompt-Bibliothek

Der Button **📚 Prompt-Bibliothek** oben rechts öffnet die Bibliotheksseite. Dort können Prompts nach Stichwort oder Kategorie gefiltert werden. Ein Klick auf **„Übernehmen & anpassen"** lädt den Prompt ins Eingabefeld der Hauptseite – die Datenbank bleibt unverändert.

### Debug-Konsole

Der **🐛 Button** unten rechts öffnet die Debug-Konsole. Sie zeigt alle API-Anfragen, Fehler und System-Logs. Hilfreich bei Problemen – Logs können exportiert werden.

---

## Projektstruktur

```
JGU_Verwaltungsagent/
├── JGU_Agenten.html          # Haupt-HTML-Datei
├── prompt_bibliothek.html    # Prompt-Bibliothek
├── app.js                    # Hauptlogik (API-Calls, Agenten, Datei-Verarbeitung)
├── styles.css                # Styling
├── logger.js                 # Debug-Logging-System
├── logger.css                # Debug-Konsolen-Styling
├── proxy.php                 # CORS-Proxy für PHP-Webserver
├── proxy-server.js           # CORS-Proxy-Server (Node.js, nur lokal)
├── api_prompts.php           # REST-API für die Prompt-Bibliothek
├── db_config.php             # Datenbankverbindung (PDO)
├── database/
│   ├── schema.sql            # Tabellenstruktur (Entwicklung)
│   └── setup_webserver.sql   # Vollständiges Setup für den Webserver
├── START_APP.bat             # Windows: Node.js Proxy + Browser
├── START_PROXY_ONLY.bat      # Windows: nur Node.js Proxy
├── start_app.sh              # Linux/macOS: Node.js Proxy + Browser
├── start_proxy_only.sh       # Linux/macOS: nur Node.js Proxy
├── PROXY_ANLEITUNG.md        # Detaillierte Proxy-Anleitung
├── SERVER_ANLEITUNG.md       # Server-Setup-Anleitung
└── README.md                 # Diese Datei
```

---

## Roadmap

### Abgeschlossen

- [x] Dynamische Modell-Auswahl von der API
- [x] Debug-Logging-System
- [x] CORS-Proxy-Lösung (Node.js + PHP)
- [x] Automatische Proxy-Erkennung (PHP vs. Node.js)
- [x] Linux/macOS Start-Skripte
- [x] PDF-Textextraktion via PDF.js
- [x] Prompt-Bibliothek mit MariaDB-Anbindung

### Nächste Schritte

- [ ] Prompts in der Bibliothek über die UI verwalten (hinzufügen, bearbeiten, löschen)
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

### CORS-Fehler

- ✅ PHP-Server läuft? (`php -S localhost:8080`)
- ✅ `proxy.php` liegt im selben Verzeichnis wie `JGU_Agenten.html`?
- ✅ Browser-Cache geleert? (Strg+Shift+R)

### Prompt-Bibliothek lädt nicht

- ✅ MariaDB läuft? (`sudo systemctl status mariadb`)
- ✅ Zugangsdaten in `db_config.php` korrekt?
- ✅ PHP-Extension `pdo_mysql` installiert? (`php -m | grep pdo`)
- ✅ Schema eingespielt? (`mysql -u jgu_app -p jgu_agenten < database/setup_webserver.sql`)

### „Failed to fetch" Fehler

- ✅ Internetverbindung aktiv?
- ✅ API-Key korrekt eingegeben?
- ✅ PHP-Server läuft?

### API-Key-Fehler (401 Unauthorized)

- ✅ API-Key von [ki-chat.uni-mainz.de](https://ki-chat.uni-mainz.de) holen
- ✅ Key vollständig kopiert? (keine Leerzeichen)
- ✅ Key noch gültig? (nicht abgelaufen)

### Modelle werden nicht geladen

- ✅ Proxy erreichbar? Debug-Konsole (🐛) prüfen
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
