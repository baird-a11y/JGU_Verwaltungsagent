<?php
/**
 * PHP-Proxy für JGU KI-Chat API
 * Ersatz für proxy-server.js auf PHP-fähigen Webservern
 *
 * Voraussetzungen:
 *   - PHP mit curl-Extension (php-curl)
 *   - Datei in dasselbe Verzeichnis wie JGU_Agenten.html legen
 *
 * Die app.js erkennt automatisch, ob dieser Proxy verfügbar ist.
 */

// CORS-Header setzen
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Preflight-Anfragen beantworten
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Ziel-API
define('TARGET_API', 'https://ki-chat.uni-mainz.de');

// Pfad aus Query-Parameter oder REQUEST_URI extrahieren
// Aufruf: proxy.php?path=/api/models  oder  proxy.php/api/models (via URL-Rewrite)
if (!empty($_GET['path'])) {
    $apiPath = '/' . ltrim($_GET['path'], '/');
} elseif (!empty($_SERVER['PATH_INFO'])) {
    $apiPath = $_SERVER['PATH_INFO'];
} else {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Kein API-Pfad angegeben. Verwende ?path=/api/...']);
    exit;
}

$targetUrl = TARGET_API . $apiPath;

// Request-Body lesen
$requestBody = file_get_contents('php://input');

// curl initialisieren
$ch = curl_init($targetUrl);

// Basis-Optionen
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER         => true,   // Antwort-Header mitladen (für Content-Type)
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT        => 120,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_CUSTOMREQUEST  => $_SERVER['REQUEST_METHOD'],
]);

// Headers weiterleiten
$forwardHeaders = ['Content-Type: application/json'];
if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $forwardHeaders[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
}
curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardHeaders);

// Body senden (bei POST/PUT)
if (!empty($requestBody)) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $requestBody);
}

// Request ausführen
$response = curl_exec($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$curlError  = curl_error($ch);
curl_close($ch);

// curl-Fehler abfangen
if ($response === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Proxy-Fehler', 'message' => $curlError]);
    exit;
}

// Antwort-Header und -Body trennen
$responseHeaders = substr($response, 0, $headerSize);
$responseBody    = substr($response, $headerSize);

// Content-Type aus API-Antwort übernehmen
$contentType = 'application/json';
foreach (explode("\r\n", $responseHeaders) as $line) {
    if (stripos($line, 'Content-Type:') === 0) {
        $contentType = trim(substr($line, strlen('Content-Type:')));
        break;
    }
}

http_response_code($httpCode);
header('Content-Type: ' . $contentType);
echo $responseBody;
