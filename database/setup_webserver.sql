-- =============================================================
--  JGU Verwaltungsagent – Webserver Setup
--  Erstellt: 2026-04-13
-- =============================================================
--
--  HINWEIS:
--  Block 1 (Datenbank & Benutzer) muss als root/Admin ausgeführt
--  werden – ggf. erledigt das die Serveradministration für Sie.
--
--  Block 2 (Tabellen & Daten) führen Sie danach selbst aus, z.B.:
--    mysql -u jgu_app -p jgu_agenten < database/setup_webserver.sql
--
-- =============================================================


-- -------------------------------------------------------------
--  BLOCK 1 – Datenbank & Benutzer  (Root-Rechte erforderlich)
-- -------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS jgu_agenten
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Passwort vor dem Ausführen anpassen!
CREATE USER IF NOT EXISTS 'jgu_app'@'localhost'
    IDENTIFIED BY 'HIER_PASSWORT_SETZEN';

GRANT ALL PRIVILEGES ON jgu_agenten.* TO 'jgu_app'@'localhost';

FLUSH PRIVILEGES;


-- -------------------------------------------------------------
--  BLOCK 2 – Tabellen & Beispieldaten
-- -------------------------------------------------------------

USE jgu_agenten;

-- Kategorien
CREATE TABLE IF NOT EXISTS kategorien (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    beschreibung TEXT,
    farbe       VARCHAR(7)    DEFAULT '#4a90d9',
    erstellt_am TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Prompts
CREATE TABLE IF NOT EXISTS prompts (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titel           VARCHAR(255)  NOT NULL,
    beschreibung    VARCHAR(500),
    kategorie_id    INT UNSIGNED,
    modell_typ      ENUM('standard','reasoning','code','vision') DEFAULT 'standard',
    system_prompt   TEXT          NOT NULL,
    platzhalter     TEXT,
    aktiv           TINYINT(1)    DEFAULT 1,
    erstellt_am     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    geaendert_am    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (kategorie_id) REFERENCES kategorien(id) ON DELETE SET NULL,
    FULLTEXT INDEX ft_suche (titel, beschreibung, system_prompt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -------------------------------------------------------------
--  Beispieldaten – Kategorien
-- -------------------------------------------------------------

INSERT INTO kategorien (name, beschreibung, farbe) VALUES
    ('Texte',         'Zusammenfassen, übersetzen, umformulieren', '#4a90d9'),
    ('Kommunikation', 'E-Mails, Briefe, Berichte',                '#27ae60'),
    ('Analyse',       'Daten, Recherche, Auswertungen',           '#e67e22'),
    ('Code',          'Programmierung und technische Aufgaben',   '#8e44ad');


-- -------------------------------------------------------------
--  Beispieldaten – Prompts
-- -------------------------------------------------------------

INSERT INTO prompts (titel, beschreibung, kategorie_id, modell_typ, system_prompt, platzhalter) VALUES
(
    'Text zusammenfassen',
    'Erstellt eine präzise, strukturierte Zusammenfassung mit Bullet Points',
    1, 'standard',
    'Du bist ein Experte für Textzusammenfassungen. Erstelle eine präzise, strukturierte Zusammenfassung des folgenden Textes. Verwende Bullet Points und hebe die wichtigsten Aspekte hervor.',
    'Geben Sie hier den Text ein, den Sie zusammenfassen möchten...'
),
(
    'E-Mail schreiben',
    'Verfasst professionelle E-Mails aus Stichpunkten',
    2, 'standard',
    'Du bist ein Experte für professionelle Kommunikation. Verfasse basierend auf den folgenden Stichpunkten eine höfliche, professionelle E-Mail mit Betreff, Anrede, strukturiertem Hauptteil und angemessenem Schluss.',
    'Beschreiben Sie, was die E-Mail enthalten soll:\n\nBeispiel:\n- Meeting nächste Woche vereinbaren\n- Agenda: Budget und Planung\n- Teilnehmer: alle Abteilungsleiter'
),
(
    'Daten analysieren',
    'Strukturierte Analyse mit Erkenntnissen und Handlungsempfehlungen',
    3, 'reasoning',
    'Du bist ein Datenanalyst. Analysiere die bereitgestellten Informationen strukturiert. Erstelle eine Analyse mit: 1) Wichtigste Erkenntnisse, 2) Trends/Muster, 3) Konkrete Handlungsempfehlungen.',
    'Fügen Sie hier Ihre Daten ein:\n\nBeispiel:\nVerkaufszahlen 2024:\nQ1: 150.000€\nQ2: 180.000€'
),
(
    'Thema erforschen',
    'Umfassende Recherche mit Überblick, Aspekten und Fazit',
    3, 'reasoning',
    'Du bist ein Research-Experte. Führe eine strukturierte Analyse zum Thema durch. Gliedere deine Antwort: 1) Überblick, 2) Wichtigste Aspekte, 3) Aktuelle Entwicklungen, 4) Fazit/Ausblick.',
    'Geben Sie das Thema an:\n\nBeispiel: Künstliche Intelligenz in der Medizin'
),
(
    'Code erstellen',
    'Sauberer, dokumentierter Code in der gewünschten Programmiersprache',
    4, 'code',
    'Du bist ein erfahrener Entwickler. Schreibe sauberen, effizienten und gut dokumentierten Code. Erkläre kurz, was der Code macht.',
    'Beschreiben Sie, welchen Code Sie benötigen...'
);
