<?php
/**
 * REST-API für die Prompt-Bibliothek
 *
 * GET  api_prompts.php                    → alle aktiven Prompts + Kategorien
 * GET  api_prompts.php?suche=text         → Volltextsuche
 * GET  api_prompts.php?kategorie=2        → nach Kategorie filtern
 * GET  api_prompts.php?id=5              → einzelnen Prompt laden
 */

require_once __DIR__ . '/db_config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Nur GET erlaubt']);
    exit;
}

try {
    $db = getDb();

    // Einzelnen Prompt abrufen
    if (!empty($_GET['id'])) {
        $stmt = $db->prepare('
            SELECT p.*, k.name AS kategorie_name, k.farbe AS kategorie_farbe
            FROM prompts p
            LEFT JOIN kategorien k ON p.kategorie_id = k.id
            WHERE p.id = ? AND p.aktiv = 1
        ');
        $stmt->execute([(int) $_GET['id']]);
        $prompt = $stmt->fetch();

        if (!$prompt) {
            http_response_code(404);
            echo json_encode(['error' => 'Prompt nicht gefunden']);
            exit;
        }

        echo json_encode($prompt);
        exit;
    }

    // Kategorien immer mitliefern
    $kategorien = $db->query('SELECT * FROM kategorien ORDER BY name')->fetchAll();

    // Prompts abfragen
    $sql    = 'SELECT p.*, k.name AS kategorie_name, k.farbe AS kategorie_farbe
               FROM prompts p
               LEFT JOIN kategorien k ON p.kategorie_id = k.id
               WHERE p.aktiv = 1';
    $params = [];

    // Volltextsuche
    if (!empty($_GET['suche'])) {
        $sql   .= ' AND MATCH(p.titel, p.beschreibung, p.system_prompt) AGAINST(? IN BOOLEAN MODE)';
        $params[] = $_GET['suche'] . '*';
    }

    // Kategorie-Filter
    if (!empty($_GET['kategorie'])) {
        $sql   .= ' AND p.kategorie_id = ?';
        $params[] = (int) $_GET['kategorie'];
    }

    $sql .= ' ORDER BY p.titel ASC';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $prompts = $stmt->fetchAll();

    echo json_encode([
        'kategorien' => $kategorien,
        'prompts'    => $prompts,
        'anzahl'     => count($prompts),
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Datenbankfehler', 'details' => $e->getMessage()]);
}
