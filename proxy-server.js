/**
 * Lokaler Proxy-Server für JGU KI-Chat API
 * Löst CORS-Probleme bei der Entwicklung
 *
 * Verwendung:
 * 1. Node.js installieren (falls noch nicht vorhanden)
 * 2. Im Terminal: node proxy-server.js
 * 3. Der Proxy läuft auf http://localhost:3000
 */

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3000;
const TARGET_API = 'https://ki-chat.uni-mainz.de';

const server = http.createServer((req, res) => {
    // CORS-Header für alle Anfragen setzen
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Preflight-Anfragen behandeln
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

    // API-Pfad extrahieren (z.B. /api/models)
    const apiPath = req.url;
    const targetUrl = `${TARGET_API}${apiPath}`;

    console.log(`  → Forwarding to: ${targetUrl}`);

    // Request-Body sammeln
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        // Headers für Ziel-Request vorbereiten
        const headers = {
            'Content-Type': req.headers['content-type'] || 'application/json',
        };

        // Authorization-Header übernehmen
        if (req.headers['authorization']) {
            headers['Authorization'] = req.headers['authorization'];
        }

        // Request-Optionen
        const options = {
            method: req.method,
            headers: headers
        };

        // HTTPS-Request zur API
        const apiRequest = https.request(targetUrl, options, (apiResponse) => {
            console.log(`  ← Response: ${apiResponse.statusCode} ${apiResponse.statusMessage}`);

            // Status und Headers zurückgeben
            res.writeHead(apiResponse.statusCode, {
                'Content-Type': apiResponse.headers['content-type'] || 'application/json',
                'Access-Control-Allow-Origin': '*'
            });

            // Response-Body durchleiten
            apiResponse.on('data', chunk => {
                res.write(chunk);
            });

            apiResponse.on('end', () => {
                res.end();
            });
        });

        // Fehlerbehandlung
        apiRequest.on('error', (error) => {
            console.error(`  ✗ Error: ${error.message}`);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 'Proxy-Fehler',
                message: error.message
            }));
        });

        // Body senden (falls vorhanden)
        if (body) {
            apiRequest.write(body);
        }

        apiRequest.end();
    });
});

server.listen(PORT, () => {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║  JGU KI-Chat API Proxy Server                         ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log();
    console.log(`✓ Proxy läuft auf: http://localhost:${PORT}`);
    console.log(`✓ Leitet weiter an: ${TARGET_API}`);
    console.log();
    console.log('WICHTIG: Ändern Sie in app.js die API-URL zu:');
    console.log(`  http://localhost:${PORT}/api/...`);
    console.log();
    console.log('Beispiel:');
    console.log('  Alt:  https://ki-chat.uni-mainz.de/api/models');
    console.log(`  Neu:  http://localhost:${PORT}/api/models`);
    console.log();
    console.log('Drücken Sie Ctrl+C zum Beenden');
    console.log('═══════════════════════════════════════════════════════');
    console.log();
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`✗ Port ${PORT} ist bereits belegt!`);
        console.error('  Lösung: Schließen Sie andere Anwendungen auf diesem Port');
        console.error(`  oder ändern Sie PORT in dieser Datei zu einem anderen Wert.`);
    } else {
        console.error('✗ Server-Fehler:', error.message);
    }
    process.exit(1);
});
