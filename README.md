# KI-Assistent Desktop App - Uni Mainz

**WICHTIGER HINWEIS: Dies ist eine sehr frühe Testversion zur Überprüfung der Machbarkeit und Funktionalität.**

Eine benutzerfreundliche Desktop-Anwendung für die Nutzung der KI-Services der Johannes Gutenberg-Universität Mainz. Die App bietet vorgefertigte Prompts für häufige Aufgaben und unterstützt verschiedene Dateiformate.

## Features

### Vorgefertigte KI-Agenten
- **Text zusammenfassen**: Automatische Erstellung strukturierter Zusammenfassungen
- **Text übersetzen**: Professionelle Übersetzungen in 6 Sprachen (Deutsch, English, Français, Español, Italiano, Nederlands)
- **E-Mail schreiben**: Verfassen professioneller E-Mails basierend auf Stichpunkten
- **Daten analysieren**: Strukturierte Analyse von Daten mit Handlungsempfehlungen
- **Thema erforschen**: Umfassende Research zu beliebigen Themen
- **Code erstellen**: Entwicklung sauberen Codes in 7 Programmiersprachen

### Datei-Support
- **PDF-Dateien** (.pdf): Automatische Textextraktion
- **Word-Dokumente** (.docx): Vollständige Inhaltsverarbeitung
- **Textdateien** (.txt): Direkter Import
- **Multi-Upload**: Bis zu 3 Dateien gleichzeitig verarbeiten

### Weitere Funktionen
- **API-Key-Verwaltung**: Sichere lokale Speicherung
- **Verlaufshistorie**: Automatische Speicherung der letzten 50 Ergebnisse
- **Export-Funktionen**: Ergebnisse speichern oder kopieren
- **Benutzerfreundliche GUI**: Intuitive Tkinter-Oberfläche
- **Logo-Integration**: Uni Mainz Branding

## Installation

### Voraussetzungen
- Python 3.7 oder höher
- Zugang zu ki-chat.uni-mainz.de mit gültigen Uni-Zugangsdaten

### Abhängigkeiten installieren
```bash
pip install tkinter requests PyPDF2 python-docx pillow
```

### Repository klonen
```bash
git clone https://github.com/IhrUsername/JGU_Agenten.git
cd JGU_Agenten
```

## Setup

### 1. Logo hinzufügen (optional)
Platzieren Sie die Datei `Gehin_ganz_logo.png` im Projektverzeichnis für das Uni-Logo.

### 2. API-Key erstellen
1. Öffnen Sie https://ki-chat.uni-mainz.de
2. Melden Sie sich mit Ihren Uni-Zugangsdaten an
3. Gehen Sie zu den Einstellungen/API-Keys
4. Erstellen Sie einen neuen API-Key
5. Kopieren Sie den Key für die erste Nutzung

### 3. Anwendung starten
```bash
python ki_assistant.py
```

## Verwendung

### Erste Schritte
1. **Agent auswählen**: Wählen Sie die gewünschte Aufgabe aus der Dropdown-Liste
2. **Text eingeben**: Beschreiben Sie Ihre Anfrage oder nutzen Sie die Beispiele
3. **Dateien hochladen** (optional): Laden Sie bis zu 3 Dateien zur Verarbeitung hoch
4. **Verarbeitung starten**: Klicken Sie auf "Starten"
5. **Ergebnis nutzen**: Kopieren oder speichern Sie das Ergebnis

### Beispiel-Workflows

#### Text zusammenfassen
```
1. Agent: "Text zusammenfassen" auswählen
2. PDF-Dokument hochladen oder Text einfügen
3. Strukturierte Zusammenfassung erhalten
```

#### Code erstellen
```
1. Agent: "Code erstellen" auswählen
2. Programmiersprache wählen (z.B. Python)
3. Anforderungen beschreiben
4. Dokumentierten Code erhalten
```

## Architektur

### Hauptkomponenten
- **`KIAssistentApp`**: Haupt-GUI-Klasse
- **`APIKeyManager`**: Sichere API-Key-Verwaltung
- **Agent-System**: Vorgefertigte Prompts für verschiedene Aufgaben
- **File-Handler**: Multi-Format-Dateiverarbeitung

### Unterstützte KI-Modelle
- **Standard**: Nemotron Ultra 253B
- **Reasoning**: Nemotron Ultra 253B (Reasoning)
- **Vision**: Gemma3 27B
- **Code**: Qwen2.5 Coder 32B

## Projektstruktur
```
JGU_Agenten/
├── ki_assistant.py          # Hauptanwendung
├── README.md               # Diese Datei
├── Gehin_ganz_logo.png     # Uni-Logo (optional)
├── api_key.txt             # API-Key (wird automatisch erstellt)
└── ki_historie.json        # Verlaufshistorie (wird automatisch erstellt)
```

## Konfiguration

### API-Einstellungen
Die API-URL und verfügbare Modelle können in der `setup_config()` Methode angepasst werden:

```python
self.api_url = "https://ki-chat.uni-mainz.de"
self.models = {
    "Standard": "Nemotron Ultra 253B",
    # weitere Modelle...
}
```

### Agent-Prompts anpassen
Neue Agenten oder geänderte Prompts können im `self.agents` Dictionary definiert werden.

## Sicherheit

- **Lokale API-Key-Speicherung**: Keys werden nur lokal in `api_key.txt` gespeichert
- **Keine Datenübertragung**: Dateien werden nur zur KI gesendet, nicht extern gespeichert
- **Uni-Integration**: Nutzt die offizielle KI-Infrastruktur der JGU

## Fehlerbehebung

### Häufige Probleme

**"API-Key ungültig"**
- Neuen API-Key auf ki-chat.uni-mainz.de erstellen
- Über "Hilfe" → "API-Key ändern" aktualisieren

**"Datei kann nicht gelesen werden"**
- Unterstützte Formate: .txt, .pdf, .docx
- Bei PDFs: Nur Text-PDFs, keine gescannten Bilder

**"Verbindungsfehler"**
- Internetverbindung prüfen
- VPN-Verbindung zur Uni eventuell erforderlich

## Mitwirken

Verbesserungsvorschläge und Contributions sind willkommen.

## Lizenz

Dieses Projekt ist für die interne Nutzung an der Johannes Gutenberg-Universität Mainz entwickelt.

## Support

Bei Fragen oder Problemen gerne an mich wenden.

## Roadmap

Geplante Features für zukünftige Versionen:

Erweiterte Export-Optionen: Speichern der Ergebnisse in verschiedenen Dateiformaten (PDF, DOCX, HTML, etc.) mit professioneller Formatierung und Metadaten
Flexible Modell-Auswahl: Benutzer können zwischen verschiedenen KI-Modellen je nach Anforderung wählen, mit Performance-Indikatoren zur optimalen Auswahl (Aktuell ist Nemotron als Standard ausgewählt)

WhisperAI Integration: Automatische Transkription von Audio-Dateien und Erstellung von strukturierten Protokollen
Websuche-Integration: Einbindung aktueller Informationen aus dem Internet bzw. Nutzung der vorhanden Websuche
Automatische Updates: Benutzer können die Software automatisch aktualisieren, ohne den Code erneut in eine .exe-Datei umwandeln zu müssen. 

Langfristig - Universitätsspezifische Features

**Für Studierende**

Literaturverzeichnis-Generator: Automatische Zitationserstellung aus PDFs
Prüfungsvorbereitung: Karteikarten und Lernzusammenfassungen aus Vorlesungsunterlagen
Thesis-Assistent: Strukturierung und Gliederung von Abschlussarbeiten
Vorlesungsnotizen-Optimierung: Aufbereitung handschriftlicher Notizen

**Für Forschung**

Datenanalyse-Assistent: Integration mit pandas/matplotlib für statistische Auswertungen
Paper-Reviewer: Analyse wissenschaftlicher Texte auf Struktur und Argumentation
Grant-Writing-Helper: Unterstützung bei der Erstellung von Forschungsanträgen
Methodologie-Berater: Hilfe bei der Auswahl geeigneter Forschungsmethoden

**Für Verwaltung**

Meeting-Protokoll-Generator: Automatische Erstellung strukturierter Protokolle aus Audio-Aufzeichnungen
E-Mail-Template-Bibliothek: Vorgefertigte Vorlagen für häufige Verwaltungsaufgaben
Batch-Verarbeitung: Simultane Bearbeitung mehrerer Dokumente
Compliance-Checker: Überprüfung von Dokumenten auf Richtlinienkonformität

**Zukunftsvision**

Campus-System-Integration: Anbindung an bestehende Universitätssoftware
Multi-User-Funktionalität: Kollaborative Dokumentenbearbeitung
API-Schnittstellen: Integration in andere Anwendungen
Mobile Companion-App: Ergänzende Smartphone-Anwendung

**Entwicklungsstrategie**

Die Umsetzung erfolgt in priorisierten Stufen:

Export-Optionen und Modell-Auswahl für schnelle Nutzererfolge
WhisperAI-Integration als Game-Changer für die Universitätsverwaltung
Spezifische Uni-Features basierend auf Nutzerfeedback und konkreten Anforderungen


## Changelog

### Version 0.1
- Multi-Datei-Upload (bis zu 3 Dateien)
- Verbesserte Fehlerbehandlung
- Erweiterte Dateiformat-Unterstützung
- UI-Verbesserungen

### Version 0.01
- Erste Veröffentlichung
- 6 vorgefertigte KI-Agenten
- PDF/Word/Text-Unterstützung
- API-Key-Verwaltung

---

**Entwickelt für die Johannes Gutenberg-Universität Mainz**
