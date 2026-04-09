// App-Version (zur Cache-Verifikation)
const APP_VERSION = '4';
console.log('[JGU-Agent] app.js Version', APP_VERSION, 'geladen');

// Global State
const APP_STATE = {
    apiKey: null,
    uploadedFiles: [],
    currentAgent: null,
    availableModels: null,
    modelCategories: {
        standard: null,
        reasoning: null,
        code: null,
        vision: null
    },
    // API-Konfiguration
    // WICHTIG: Für lokale Entwicklung verwenden Sie den Proxy-Server!
    // Siehe PROXY_ANLEITUNG.md für Details
    apiBaseUrl: 'http://localhost:3000/api',  // Proxy-Server (Entwicklung)
    // apiBaseUrl: 'https://ki-chat.uni-mainz.de/api',  // Direkt (funktioniert nicht wegen CORS!)
    agents: {
        summary: {
            modelType: "standard",
            model: null, // Wird dynamisch gesetzt
            prompt: "Du bist ein Experte für Textzusammenfassungen. Erstelle eine präzise, strukturierte Zusammenfassung des folgenden Textes. Verwende Bullet Points und hebe die wichtigsten Aspekte hervor.",
            placeholder: "Geben Sie hier den Text ein, den Sie zusammenfassen möchten...",
            example: "Beispiel: Langer Artikel, Bericht oder Dokumenttext"
        },
        translate: {
            modelType: "standard",
            model: null,
            prompt: "Du bist ein professioneller Übersetzer. Übersetze den folgenden Text präzise nach {language}. Achte auf Kontext, Stil und kulturelle Nuancen.",
            placeholder: "Geben Sie hier den Text ein, den Sie übersetzen möchten...",
            example: "Beispiel: 'Hello, how are you today?'",
            languages: ["Deutsch", "English", "Français", "Español", "Italiano", "Nederlands"]
        },
        email: {
            modelType: "standard",
            model: null,
            prompt: "Du bist ein Experte für professionelle Kommunikation. Verfasse basierend auf den folgenden Stichpunkten eine höfliche, professionelle E-Mail mit Betreff, Anrede, strukturiertem Hauptteil und angemessenem Schluss.",
            placeholder: "Beschreiben Sie, was die E-Mail enthalten soll:\n\nBeispiel:\n- Meeting nächste Woche vereinbaren\n- Agenda: Budget und Planung\n- Teilnehmer: alle Abteilungsleiter",
            example: "Stichpunkte für E-Mail-Inhalt"
        },
        analyze: {
            modelType: "reasoning",
            model: null,
            prompt: "Du bist ein Datenanalyst. Analysiere die bereitgestellten Informationen strukturiert. Erstelle eine Analyse mit: 1) Wichtigste Erkenntnisse, 2) Trends/Muster, 3) Konkrete Handlungsempfehlungen.",
            placeholder: "Fügen Sie hier Ihre Daten ein:\n\nBeispiel:\nVerkaufszahlen 2024:\nQ1: 150.000€\nQ2: 180.000€\nQ3: 165.000€\nQ4: 195.000€",
            example: "Zahlen, Statistiken oder Informationen zur Analyse"
        },
        research: {
            modelType: "reasoning",
            model: null,
            prompt: "Du bist ein Research-Experte. Führe eine strukturierte Analyse zum Thema durch. Gliedere deine Antwort: 1) Überblick, 2) Wichtigste Aspekte, 3) Aktuelle Entwicklungen, 4) Fazit/Ausblick.",
            placeholder: "Geben Sie das Thema an:\n\nBeispiel: 'Künstliche Intelligenz in der Medizin' oder 'Nachhaltigkeit in der Automobilindustrie'",
            example: "Thema für Research"
        },
        code: {
            modelType: "code",
            model: null,
            prompt: "Du bist ein erfahrener {language}-Entwickler. Schreibe sauberen, effizienten und gut dokumentierten Code. Erkläre kurz, was der Code macht.",
            placeholder: "Beschreiben Sie, welchen Code Sie benötigen:\n\nBeispiel:\n- Eine Funktion, die CSV-Dateien einliest\n- Ein Programm zum Sortieren von Listen\n- Eine einfache Webseite mit Formular",
            example: "Beschreibung der Code-Anforderungen",
            languages: ["Python", "JavaScript", "Java", "C++", "PHP", "Go", "Rust"]
        }
    }
};

/**
 * Holt verfügbare Modelle von der API
 */
async function fetchAvailableModels() {
    Logger.info('📋 Hole verfügbare Modelle von der API...');

    // Prüfe ob API-Key vorhanden
    if (!APP_STATE.apiKey) {
        Logger.error('❌ Kein API-Key vorhanden - kann Modelle nicht laden');
        Logger.warning('⚠️ Verwende Fallback-Modelle');
        useFallbackModels();
        return false;
    }

    // Prüfe ob wir über HTTP/HTTPS laufen
    if (window.location.protocol === 'file:') {
        Logger.warning('⚠️ App läuft als lokale Datei - CORS-Problem möglich');
        Logger.warning('💡 Tipp: Nutzen Sie einen lokalen Webserver (z.B. Live Server in VSCode)');
    }

    try {
        const headers = {
            'Authorization': `Bearer ${APP_STATE.apiKey}`
        };
        Logger.debug('API-Request mit Authorization-Header');

        const modelsUrl = `${APP_STATE.apiBaseUrl}/models`;

        Logger.debug('Fetch-Request Details', {
            url: modelsUrl,
            method: 'GET',
            hasAuth: !!APP_STATE.apiKey
        });

        const response = await fetch(modelsUrl, {
            method: 'GET',
            headers: headers,
            mode: 'cors',
            credentials: 'omit'
        });

        Logger.debug('Response erhalten', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
            const errorText = await response.text();
            Logger.error('API-Fehler Response', null, {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`API-Fehler: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        APP_STATE.availableModels = data.data || data;

        Logger.success('✅ Verfügbare Modelle geladen', {
            count: APP_STATE.availableModels.length,
            models: APP_STATE.availableModels.map(m => m.id || m.name)
        });

        categorizeModels();
        assignModelsToAgents();

        return true;
    } catch (error) {
        Logger.error('❌ Fehler beim Laden der Modelle', error, {
            errorName: error.name,
            errorMessage: error.message,
            protocol: window.location.protocol,
            origin: window.location.origin
        });

        // Spezifische Fehlerbehandlung
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            Logger.error('🚫 CORS/Netzwerk-Fehler erkannt', null, {
                problem: 'Die API-Anfrage wurde blockiert',
                möglicheUrsachen: [
                    'App läuft als lokale Datei (file://)',
                    'CORS-Policy der API',
                    'Kein Internet',
                    'API nicht erreichbar'
                ],
                lösung: 'Nutzen Sie einen lokalen Webserver (z.B. Live Server, Python HTTP Server)'
            });

            showAlert('⚠️ API nicht erreichbar. Bitte starten Sie die App über einen Webserver. Verwende Fallback-Modelle.', 'warning');
        }

        // Fallback auf Standard-Modelle
        Logger.warning('⚠️ Verwende Fallback-Modelle');
        useFallbackModels();
        return false;
    }
}

/**
 * Extrahiert Modellgröße aus dem Namen (z.B. "235B" → 235)
 */
function extractModelSize(modelName) {
    const match = modelName.match(/(\d+\.?\d*)[bB]/i);
    return match ? parseFloat(match[1]) : 0;
}

/**
 * Kategorisiert Modelle nach Typ - Intelligente, flexible Logik
 */
function categorizeModels() {
    Logger.debug('Kategorisiere Modelle...');

    const models = APP_STATE.availableModels;

    if (!models || models.length === 0) {
        Logger.error('Keine Modelle verfügbar');
        return;
    }

    // Analysiere jedes Modell
    const analyzedModels = models.map(model => {
        const id = (model.id || model.name || '').toLowerCase();
        const size = extractModelSize(id);

        return {
            original: model,
            id: id,
            size: size,
            isCode: id.includes('coder') || id.includes('code') || id.includes('coding'),
            isThinking: id.includes('thinking') || id.includes('reasoning'),
            isVision: id.includes('vl') || id.includes('vision') || id.includes('visual'),
            isGPT: id.includes('gpt'),
            isQwen: id.includes('qwen'),
            // Score für Sortierung
            score: size
        };
    });

    Logger.debug('Modelle analysiert', {
        total: analyzedModels.length,
        details: analyzedModels.map(m => ({
            id: m.id,
            size: m.size,
            isCode: m.isCode,
            isThinking: m.isThinking,
            isVision: m.isVision
        }))
    });

    // 1. CODE-MODELLE: Spezialisiert auf Programmierung
    const codeModels = analyzedModels.filter(m => m.isCode);
    APP_STATE.modelCategories.code = codeModels.length > 0
        ? codeModels.sort((a, b) => b.size - a.size)[0].original // Größtes Code-Modell
        : analyzedModels.sort((a, b) => b.size - a.size)[0].original; // Fallback: Größtes Modell

    // 2. REASONING-MODELLE: Thinking/große Modelle für komplexe Analysen
    const thinkingModels = analyzedModels.filter(m => m.isThinking);
    if (thinkingModels.length > 0) {
        APP_STATE.modelCategories.reasoning = thinkingModels.sort((a, b) => b.size - a.size)[0].original;
    } else {
        // Fallback: Größtes verfügbares Modell (außer Code-Modelle)
        const nonCodeModels = analyzedModels.filter(m => !m.isCode);
        APP_STATE.modelCategories.reasoning = nonCodeModels.length > 0
            ? nonCodeModels.sort((a, b) => b.size - a.size)[0].original
            : analyzedModels.sort((a, b) => b.size - a.size)[0].original;
    }

    // 3. VISION-MODELLE: Für Bildverarbeitung
    const visionModels = analyzedModels.filter(m => m.isVision);
    if (visionModels.length > 0) {
        APP_STATE.modelCategories.vision = visionModels.sort((a, b) => b.size - a.size)[0].original;
    } else {
        // Fallback: Qwen-Modell mit VL-Support oder größtes Modell
        const qwenModels = analyzedModels.filter(m => m.isQwen && !m.isCode);
        APP_STATE.modelCategories.vision = qwenModels.length > 0
            ? qwenModels.sort((a, b) => b.size - a.size)[0].original
            : analyzedModels.sort((a, b) => b.size - a.size)[0].original;
    }

    // 4. STANDARD-MODELLE: Für allgemeine Aufgaben (effizientestes großes Modell)
    // Bevorzuge GPT OSS oder größte nicht-spezialisierte Modelle
    const standardCandidates = analyzedModels.filter(m => !m.isCode && !m.isThinking);
    if (standardCandidates.length > 0) {
        // Priorisiere GPT OSS (effizient) oder größtes Modell
        const gptModels = standardCandidates.filter(m => m.isGPT);
        if (gptModels.length > 0) {
            APP_STATE.modelCategories.standard = gptModels.sort((a, b) => b.size - a.size)[0].original;
        } else {
            APP_STATE.modelCategories.standard = standardCandidates.sort((a, b) => b.size - a.size)[0].original;
        }
    } else {
        // Fallback: Größtes verfügbares Modell
        APP_STATE.modelCategories.standard = analyzedModels.sort((a, b) => b.size - a.size)[0].original;
    }

    Logger.success('Modelle kategorisiert', {
        standard: APP_STATE.modelCategories.standard?.id || APP_STATE.modelCategories.standard?.name,
        reasoning: APP_STATE.modelCategories.reasoning?.id || APP_STATE.modelCategories.reasoning?.name,
        code: APP_STATE.modelCategories.code?.id || APP_STATE.modelCategories.code?.name,
        vision: APP_STATE.modelCategories.vision?.id || APP_STATE.modelCategories.vision?.name
    });
}

/**
 * Weist Agenten die passenden Modelle zu
 */
function assignModelsToAgents() {
    Logger.debug('Weise Agenten Modelle zu...');

    Object.keys(APP_STATE.agents).forEach(agentKey => {
        const agent = APP_STATE.agents[agentKey];
        const modelType = agent.modelType || 'standard';
        const selectedModel = APP_STATE.modelCategories[modelType];

        if (selectedModel) {
            agent.model = selectedModel.id || selectedModel.name;
            Logger.debug(`Agent "${agentKey}" verwendet Modell`, {
                modelType: modelType,
                model: agent.model
            });
        } else {
            Logger.warning(`Kein Modell für Agent "${agentKey}" gefunden`);
        }
    });

    Logger.success('Alle Agenten haben Modelle zugewiesen');
}

/**
 * Fallback-Modelle wenn API nicht erreichbar
 * Basierend auf aktuellen JGU-Modellen (Stand 2026)
 */
function useFallbackModels() {
    Logger.info('Verwende Fallback-Modelle');

    // Aktuelle JGU-Modelle als Fallback
    const fallbackModels = {
        standard: 'gpt-oss-120b',          // GPT OSS für allgemeine Aufgaben
        reasoning: 'qwen3-235b-thinking',  // Qwen3 Thinking für komplexe Analysen
        code: 'qwen3-coder-30b',           // Qwen3 Coder für Programmierung
        vision: 'qwen3-235b-vl'            // Qwen3 VL für Bildverarbeitung
    };

    APP_STATE.modelCategories = {
        standard: { id: fallbackModels.standard, name: fallbackModels.standard },
        reasoning: { id: fallbackModels.reasoning, name: fallbackModels.reasoning },
        code: { id: fallbackModels.code, name: fallbackModels.code },
        vision: { id: fallbackModels.vision, name: fallbackModels.vision }
    };

    Object.keys(APP_STATE.agents).forEach(agentKey => {
        const agent = APP_STATE.agents[agentKey];
        const modelType = agent.modelType || 'standard';
        agent.model = fallbackModels[modelType];
    });

    Logger.warning('Fallback-Modelle zugewiesen (JGU Standard 2026)', fallbackModels);
}

// Initialize App
window.onload = async function() {
    Logger.info('🚀 Anwendung wird initialisiert...');
    try {
        loadApiKey();
        setupLogoErrorHandler();

        // Lade verfügbare Modelle NUR wenn API-Key vorhanden
        if (APP_STATE.apiKey) {
            Logger.info('API-Key vorhanden - lade Modelle');
            await fetchAvailableModels();
        } else {
            Logger.warning('Kein API-Key - überspringe Modell-Laden');
            Logger.info('Modelle werden nach API-Key-Eingabe geladen');
            // Verwende Fallback-Modelle bis API-Key eingegeben wird
            useFallbackModels();
        }

        Logger.success('✅ Anwendung erfolgreich initialisiert');
        Logger.debug('APP_STATE initialisiert', {
            agentCount: Object.keys(APP_STATE.agents).length,
            apiKeyPresent: !!APP_STATE.apiKey,
            modelsLoaded: !!APP_STATE.availableModels,
            modelCount: APP_STATE.availableModels?.length || 0
        });
    } catch (error) {
        Logger.error('❌ Fehler bei der Initialisierung', error);
    }
};

function loadApiKey() {
    Logger.debug('Lade API-Key aus LocalStorage...');
    const storedKey = localStorage.getItem('jgu_api_key');
    if (storedKey) {
        APP_STATE.apiKey = storedKey;
        Logger.success('API-Key aus LocalStorage geladen');
        Logger.debug('API-Key Details', {
            keyLength: storedKey.length,
            keyPrefix: storedKey.substring(0, 8) + '...'
        });
    } else {
        Logger.warning('Kein API-Key gefunden - Modal wird angezeigt');
        showModal('apiKeyModal');
    }
}

async function saveApiKey() {
    Logger.info('Speichere API-Key...');
    const input = document.getElementById('apiKeyInput');
    const key = input.value.trim();

    if (!key) {
        Logger.warning('API-Key ist leer');
        showAlert('Bitte geben Sie einen API-Key ein!', 'error');
        return;
    }

    try {
        APP_STATE.apiKey = key;
        localStorage.setItem('jgu_api_key', key);
        closeModal('apiKeyModal');

        Logger.success('API-Key erfolgreich gespeichert', {
            keyLength: key.length,
            keyPrefix: key.substring(0, 8) + '...'
        });

        // Lade Modelle neu mit neuem API-Key
        showAlert('API-Key gespeichert. Lade Modelle...', 'success');
        await fetchAvailableModels();
        showAlert('API-Key wurde erfolgreich gespeichert!', 'success');

    } catch (error) {
        Logger.error('Fehler beim Speichern des API-Keys', error);
        showAlert('Fehler beim Speichern des API-Keys!', 'error');
    }
}

function changeApiKey() {
    Logger.info('Benutzer möchte API-Key ändern');
    closeModal('settingsModal');
    document.getElementById('apiKeyInput').value = '';
    showModal('apiKeyModal');
}

function closeApp() {
    Logger.info('Benutzer möchte Anwendung beenden');
    if (confirm('Möchten Sie die Anwendung wirklich beenden?')) {
        Logger.info('Anwendung wird geschlossen');
        window.close();
    } else {
        Logger.debug('Beenden abgebrochen');
    }
}

function onAgentChange() {
    const select = document.getElementById('agentSelect');
    const agentKey = select.value;

    Logger.info('Agent-Auswahl geändert', {
        previousAgent: APP_STATE.currentAgent,
        newAgent: agentKey
    });

    APP_STATE.currentAgent = agentKey;

    if (!agentKey) {
        Logger.debug('Keine Agent-Auswahl');
        return;
    }

    const agent = APP_STATE.agents[agentKey];
    const inputArea = document.getElementById('inputArea');

    Logger.debug('Aktualisiere Agent-UI', {
        agent: agentKey,
        model: agent.model,
        hasLanguages: !!agent.languages
    });

    // Update placeholder
    inputArea.value = agent.placeholder;
    inputArea.classList.add('placeholder');

    // Setup agent options
    setupAgentOptions(agentKey);

    Logger.success('Agent erfolgreich gewechselt', { agent: agentKey });
}

function setupAgentOptions(agentKey) {
    Logger.debug('Setup Agent-Optionen', { agent: agentKey });

    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';
    container.classList.remove('active');

    const agent = APP_STATE.agents[agentKey];

    if (agent.languages) {
        Logger.debug('Agent hat Sprach-Optionen', {
            languages: agent.languages,
            count: agent.languages.length
        });

        container.classList.add('active');

        const label = document.createElement('span');
        label.className = 'option-label';
        label.textContent = agentKey === 'translate' ? '🌍 Zielsprache:' : '💻 Programmiersprache:';

        const select = document.createElement('select');
        select.className = 'option-select';
        select.id = 'optionSelect';

        agent.languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang;
            select.appendChild(option);
        });

        container.appendChild(label);
        container.appendChild(select);

        Logger.success('Agent-Optionen erfolgreich erstellt');
    }
}

function removePlaceholder() {
    const inputArea = document.getElementById('inputArea');
    if (inputArea.classList.contains('placeholder')) {
        Logger.debug('Placeholder wird entfernt');
        inputArea.value = '';
        inputArea.classList.remove('placeholder');
    }
}

function addPlaceholder() {
    const inputArea = document.getElementById('inputArea');
    if (!inputArea.value.trim() && APP_STATE.currentAgent) {
        Logger.debug('Placeholder wird hinzugefügt');
        const agent = APP_STATE.agents[APP_STATE.currentAgent];
        inputArea.value = agent.placeholder;
        inputArea.classList.add('placeholder');
    }
}

function showExample() {
    const agentKey = APP_STATE.currentAgent;

    Logger.info('Beispiel angefordert', { agent: agentKey });

    if (!agentKey) {
        Logger.warning('Kein Agent ausgewählt');
        showAlert('Bitte wählen Sie zuerst eine Aufgabe aus!', 'warning');
        return;
    }

    const agent = APP_STATE.agents[agentKey];
    const agentName = document.getElementById('agentSelect').selectedOptions[0].text;
    alert(`💡 Beispiel für '${agentName}':\n\n${agent.example}`);
    Logger.debug('Beispiel angezeigt');
}

/**
 * Extrahiert Text aus einer PDF-Datei mit PDF.js
 */
async function extractPdfText(file) {
    if (typeof pdfjsLib === 'undefined') {
        throw new Error('PDF.js nicht geladen. Bitte prüfen Sie die Internetverbindung.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    Logger.debug('PDF geladen', { pages: pdf.numPages, fileName: file.name });

    const pageTexts = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        pageTexts.push(`[Seite ${i}]\n${pageText}`);
    }

    return pageTexts.join('\n\n');
}

function uploadFile() {
    Logger.info('Datei-Upload gestartet', {
        currentFiles: APP_STATE.uploadedFiles.length
    });

    if (APP_STATE.uploadedFiles.length >= 3) {
        Logger.warning('Maximale Dateianzahl erreicht', { count: 3 });
        showAlert('Sie können maximal 3 Dateien hochladen. Löschen Sie erst eine Datei.', 'warning');
        return;
    }

    document.getElementById('fileInput').click();
    Logger.debug('Datei-Dialog geöffnet');
}

function handleFileUpload(event) {
    const files = Array.from(event.target.files);

    Logger.info('Datei(en) ausgewählt', {
        fileCount: files.length,
        fileNames: files.map(f => f.name)
    });

    files.forEach((file, index) => {
        if (APP_STATE.uploadedFiles.length >= 3) {
            Logger.warning('Maximale Dateianzahl erreicht, Datei übersprungen', {
                fileName: file.name
            });
            showAlert('Maximale Anzahl von 3 Dateien erreicht!', 'warning');
            return;
        }

        Logger.debug(`Verarbeite Datei ${index + 1}/${files.length}`, {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        });

        const reader = new FileReader();

        reader.onerror = function(error) {
            Logger.error('Fehler beim Lesen der Datei', error, { fileName: file.name });
        };

        reader.onload = function(e) {
            const content = e.target.result;

            Logger.debug('Datei erfolgreich gelesen', {
                fileName: file.name,
                contentLength: content.length
            });

            APP_STATE.uploadedFiles.push({
                name: file.name,
                content: content,
                type: file.type
            });

            updateFileDisplay();
            showAlert(`Datei '${file.name}' wurde erfolgreich geladen! (${APP_STATE.uploadedFiles.length}/3)`, 'success');

            Logger.success('Datei hinzugefügt', {
                fileName: file.name,
                totalFiles: APP_STATE.uploadedFiles.length
            });
        };

        if (file.name.endsWith('.txt') || file.type === 'text/plain') {
            Logger.debug('Lese als Textdatei', { fileName: file.name });
            reader.readAsText(file);
        } else if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
            Logger.debug('Lese PDF mit PDF.js', { fileName: file.name });
            extractPdfText(file).then(content => {
                Logger.debug('PDF erfolgreich extrahiert', {
                    fileName: file.name,
                    contentLength: content.length
                });
                APP_STATE.uploadedFiles.push({ name: file.name, content: content, type: file.type });
                updateFileDisplay();
                showAlert(`Datei '${file.name}' wurde erfolgreich geladen! (${APP_STATE.uploadedFiles.length}/3)`, 'success');
                Logger.success('PDF hinzugefügt', { fileName: file.name, totalFiles: APP_STATE.uploadedFiles.length });
            }).catch(error => {
                Logger.error('PDF-Extraktion fehlgeschlagen', error, { fileName: file.name });
                showAlert(`❌ Fehler beim Lesen von '${file.name}'. Bitte als .txt-Datei exportieren.`, 'error');
            });
            return; // reader.readAsText nicht aufrufen für PDFs
        } else {
            Logger.warning('Nicht-Text-Datei erkannt', {
                fileName: file.name,
                type: file.type
            });
            showAlert(`Hinweis: ${file.name} - Nur .txt und .pdf Dateien werden unterstützt.`, 'warning');
            reader.readAsText(file);
        }
    });

    event.target.value = '';
}

function updateFileDisplay() {
    Logger.debug('Aktualisiere Datei-Anzeige', {
        fileCount: APP_STATE.uploadedFiles.length
    });

    const container = document.getElementById('fileDisplay');
    container.innerHTML = '';

    APP_STATE.uploadedFiles.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <span>📁 ${file.name}</span>
            <span class="file-remove" onclick="removeFile(${index})">❌</span>
        `;
        container.appendChild(div);
    });
}

function removeFile(index) {
    const file = APP_STATE.uploadedFiles[index];

    Logger.info('Datei-Entfernung angefordert', {
        fileName: file.name,
        index: index
    });

    if (confirm(`Möchten Sie die Datei '${file.name}' entfernen?`)) {
        APP_STATE.uploadedFiles.splice(index, 1);
        updateFileDisplay();
        Logger.success('Datei entfernt', {
            fileName: file.name,
            remainingFiles: APP_STATE.uploadedFiles.length
        });
    } else {
        Logger.debug('Datei-Entfernung abgebrochen');
    }
}

async function processText() {
    Logger.info('📤 Text-Verarbeitung gestartet');
    Logger.startTimer('api-request');

    // Validierung: API-Key
    if (!APP_STATE.apiKey) {
        Logger.error('Kein API-Key vorhanden');
        showAlert('Bitte geben Sie zuerst einen API-Key ein!', 'error');
        showModal('apiKeyModal');
        return;
    }

    // Validierung: Agent-Auswahl
    if (!APP_STATE.currentAgent) {
        Logger.error('Kein Agent ausgewählt');
        showAlert('Bitte wählen Sie zuerst eine Aufgabe aus!', 'error');
        return;
    }

    const inputArea = document.getElementById('inputArea');
    let userInput = inputArea.value.trim();
    const agent = APP_STATE.agents[APP_STATE.currentAgent];

    Logger.debug('Eingabe-Validierung', {
        agent: APP_STATE.currentAgent,
        model: agent.model,
        hasInput: !!userInput,
        fileCount: APP_STATE.uploadedFiles.length,
        isPlaceholder: inputArea.classList.contains('placeholder')
    });

    // Check if input is placeholder
    if (inputArea.classList.contains('placeholder')) {
        userInput = '';
        Logger.debug('Placeholder erkannt - Input geleert');
    }

    // Validierung: Input oder Dateien
    if (!userInput && APP_STATE.uploadedFiles.length === 0) {
        Logger.warning('Weder Text noch Dateien vorhanden');
        showAlert('Bitte geben Sie einen Text ein oder laden Sie eine Datei hoch!', 'error');
        return;
    }

    // Default instruction if only files
    if (!userInput && APP_STATE.uploadedFiles.length > 0) {
        const defaultInstructions = {
            summary: "Bitte fassen Sie den Inhalt der Datei zusammen.",
            translate: "Bitte übersetzen Sie den Inhalt der Datei.",
            email: "Bitte verfassen Sie eine E-Mail basierend auf dem Inhalt der Datei.",
            analyze: "Bitte analysieren Sie die Daten aus der Datei.",
            research: "Bitte erstellen Sie eine Analyse basierend auf dem Dateiinhalt.",
            code: "Bitte erstellen Sie Code basierend auf den Anforderungen in der Datei."
        };
        userInput = defaultInstructions[APP_STATE.currentAgent];
        Logger.debug('Standard-Anweisung für Datei-Only verwendet', { instruction: userInput });
    }

    // Add file contents (mit Größenbegrenzung wegen Kontext-Limit des Modells)
    // ~8.000 Zeichen ≈ 2.000 Tokens – konservativ, lässt Raum für System-Prompt und Antwort
    const MAX_FILE_CHARS = 8000;

    if (APP_STATE.uploadedFiles.length > 0) {
        Logger.debug('Füge Datei-Inhalte hinzu', {
            fileCount: APP_STATE.uploadedFiles.length
        });

        userInput += "\n\n--- Inhalte der hochgeladenen Dateien ---\n";
        APP_STATE.uploadedFiles.forEach((file, index) => {
            let content = file.content;
            let truncated = false;

            if (content.length > MAX_FILE_CHARS) {
                content = content.slice(0, MAX_FILE_CHARS);
                // Am letzten Satzende abschneiden, damit kein halber Satz bleibt
                const lastPeriod = Math.max(
                    content.lastIndexOf('. '),
                    content.lastIndexOf('.\n')
                );
                if (lastPeriod > MAX_FILE_CHARS * 0.8) {
                    content = content.slice(0, lastPeriod + 1);
                }
                truncated = true;
            }

            userInput += `\n=== Datei ${index + 1}: ${file.name} ===\n`;
            userInput += content;
            if (truncated) {
                userInput += `\n\n[⚠️ Dokument wurde auf ${MAX_FILE_CHARS} Zeichen gekürzt – ` +
                    `nur der erste Teil wurde verarbeitet. Für vollständige Analyse das Dokument aufteilen.]`;
                Logger.warning('Datei-Inhalt gekürzt', {
                    fileName: file.name,
                    originalLength: file.content.length,
                    truncatedLength: content.length
                });
                showAlert(`⚠️ '${file.name}' ist zu groß und wurde auf die ersten ${MAX_FILE_CHARS} Zeichen gekürzt.`, 'warning');
            }
            userInput += "\n" + "=".repeat(50) + "\n";

            Logger.debug(`Datei ${index + 1} hinzugefügt`, {
                fileName: file.name,
                contentLength: content.length,
                truncated: truncated
            });
        });
    }

    // Prepare prompt
    let systemPrompt = agent.prompt;

    // Replace placeholders
    if (APP_STATE.currentAgent === 'translate') {
        const select = document.getElementById('optionSelect');
        const language = select ? select.value : 'Deutsch';
        systemPrompt = systemPrompt.replace('{language}', language);
        Logger.debug('Übersetzungs-Zielsprache', { language: language });
    } else if (APP_STATE.currentAgent === 'code') {
        const select = document.getElementById('optionSelect');
        const language = select ? select.value : 'Python';
        systemPrompt = systemPrompt.replace('{language}', language);
        Logger.debug('Code-Sprache', { language: language });
    }

    // Harte Gesamtbegrenzung: ~3.000 Tokens ≈ 12.000 Zeichen
    // Schützt vor Kontext-Überschreitung unabhängig von der Eingabequelle
    const MAX_TOTAL_CHARS = 12000;
    if (userInput.length > MAX_TOTAL_CHARS) {
        const truncAt = userInput.lastIndexOf('\n', MAX_TOTAL_CHARS) || MAX_TOTAL_CHARS;
        userInput = userInput.slice(0, truncAt) +
            '\n\n[⚠️ Eingabe auf 12.000 Zeichen begrenzt – nur erster Teil wird verarbeitet]';
        Logger.warning('Gesamteingabe gekürzt', {
            originalLength: userInput.length,
            truncatedTo: truncAt
        });
        showAlert('⚠️ Text zu lang – auf 12.000 Zeichen gekürzt. Nur der erste Teil wird verarbeitet.', 'warning');
    }

    // Update UI
    setProcessing(true);
    document.getElementById('resultArea').value = '🔄 KI arbeitet für Sie...\nDas kann 10-30 Sekunden dauern.';

    const requestPayload = {
        model: agent.model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userInput }
        ],
        temperature: 0.7,
        max_tokens: 4096
    };

    const chatUrl = `${APP_STATE.apiBaseUrl}/chat/completions`;

    Logger.info('📡 Sende API-Request', {
        endpoint: chatUrl,
        model: agent.model,
        agent: APP_STATE.currentAgent,
        inputLength: userInput.length,
        systemPromptLength: systemPrompt.length,
        temperature: 0.7,
        maxTokens: 4096
    });

    try {
        const response = await fetch(chatUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${APP_STATE.apiKey}`,
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify(requestPayload)
        });

        Logger.debug('API-Response erhalten', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            const errorText = await response.text();
            Logger.error('API-Fehler', null, {
                status: response.status,
                statusText: response.statusText,
                responseBody: errorText
            });

            // Zeige API-Fehlerdetails direkt im Ergebnisfeld
            let apiErrorDetail = errorText;
            try {
                const parsed = JSON.parse(errorText);
                apiErrorDetail = parsed?.error?.message || parsed?.message || errorText;
            } catch (_) {}
            document.getElementById('resultArea').value =
                `❌ API-Fehler ${response.status}\n\n${apiErrorDetail}\n\n` +
                `(Weitere Details in der 🐛 Debug-Konsole)`;

            // Spezifische Fehlermeldungen
            if (response.status === 401) {
                showAlert('❌ API-Key ungültig oder abgelaufen. Bitte prüfen Sie Ihren API-Key.', 'error');
            } else if (response.status === 429) {
                showAlert('⚠️ Rate-Limit erreicht. Bitte warten Sie kurz und versuchen Sie es erneut.', 'warning');
            } else if (response.status === 400) {
                showAlert('❌ Ungültige Anfrage (400). Fehlermeldung im Ergebnisfeld sichtbar.', 'error');
            }

            throw new Error(`API-Fehler: ${response.status} - ${apiErrorDetail}`);
        }

        const data = await response.json();

        Logger.debug('API-Response geparst', {
            hasChoices: !!data.choices,
            choicesCount: data.choices?.length || 0,
            model: data.model,
            usage: data.usage
        });

        if (data.choices && data.choices.length > 0) {
            const result = data.choices[0].message.content;

            Logger.endTimer('api-request');
            Logger.success('✅ API-Request erfolgreich', {
                resultLength: result.length,
                finishReason: data.choices[0].finish_reason,
                usage: data.usage
            });

            document.getElementById('resultArea').value = result;
            saveToHistory(result);
        } else {
            Logger.error('Keine Choices in API-Response', null, { response: data });
            throw new Error('Keine Antwort von der KI erhalten');
        }

    } catch (error) {
        Logger.endTimer('api-request');
        Logger.error('❌ API-Request fehlgeschlagen', error, {
            errorType: error.name,
            errorMessage: error.message,
            agent: APP_STATE.currentAgent,
            model: agent.model,
            protocol: window.location.protocol
        });

        console.error('Error:', error);

        // Detaillierte Fehlermeldung
        let errorDetails = `❌ Fehler: ${error.message}\n\n`;

        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            errorDetails += `🚫 CORS/Netzwerk-Problem erkannt!\n\n`;
            errorDetails += `Mögliche Ursachen:\n`;
            errorDetails += `1. Die App läuft als lokale Datei (file://)\n`;
            errorDetails += `2. Kein Internet / API nicht erreichbar\n`;
            errorDetails += `3. API-Key fehlt oder ist ungültig\n\n`;
            errorDetails += `Lösung:\n`;
            errorDetails += `- Öffnen Sie die App über einen Webserver\n`;
            errorDetails += `- z.B. Live Server in VSCode\n`;
            errorDetails += `- Oder: python -m http.server 8000\n\n`;
            errorDetails += `Aktuelles Protokoll: ${window.location.protocol}\n`;
            errorDetails += `Benötigt: http:// oder https://`;

            showAlert('🚫 CORS-Problem: Bitte nutzen Sie einen Webserver!', 'error');
        } else {
            errorDetails += `Bitte überprüfen Sie:\n`;
            errorDetails += `- Ihren API-Key\n`;
            errorDetails += `- Ihre Internetverbindung\n`;
            errorDetails += `- Die API-Limits (max. 2 parallele Anfragen)\n`;
            errorDetails += `- Ob die API erreichbar ist`;
        }

        document.getElementById('resultArea').value = errorDetails;

        if (!showAlert.called) {
            showAlert('Fehler bei der API-Anfrage. Details siehe Ergebnis-Bereich.', 'error');
        }
    } finally {
        setProcessing(false);
        Logger.debug('UI-Processing beendet');
    }
}

function saveToHistory(result) {
    Logger.debug('Speichere in Historie');

    try {
        const history = JSON.parse(localStorage.getItem('jgu_history') || '[]');
        const entry = {
            timestamp: new Date().toISOString(),
            agent: APP_STATE.currentAgent,
            input: document.getElementById('inputArea').value.substring(0, 100) + '...',
            output: result
        };

        history.unshift(entry);
        history.splice(50); // Keep only last 50

        localStorage.setItem('jgu_history', JSON.stringify(history));

        Logger.success('In Historie gespeichert', {
            historySize: history.length,
            agent: APP_STATE.currentAgent
        });
    } catch (e) {
        Logger.error('Fehler beim Speichern der Historie', e);
        console.error('Error saving history:', e);
    }
}

function setProcessing(isProcessing) {
    Logger.debug(`UI-Processing: ${isProcessing ? 'START' : 'STOP'}`);

    const btn = document.getElementById('processBtn');
    const progress = document.getElementById('progressContainer');

    btn.disabled = isProcessing;
    progress.style.display = isProcessing ? 'block' : 'none';
}

function clearAll() {
    Logger.info('Lösche alle Eingaben und Dateien');

    const state = {
        previousAgent: APP_STATE.currentAgent,
        previousFileCount: APP_STATE.uploadedFiles.length
    };

    document.getElementById('inputArea').value = '';
    document.getElementById('resultArea').value = '';
    document.getElementById('agentSelect').value = '';
    APP_STATE.currentAgent = null;
    APP_STATE.uploadedFiles = [];
    updateFileDisplay();
    document.getElementById('optionsContainer').classList.remove('active');
    document.getElementById('optionsContainer').innerHTML = '';

    Logger.success('Alle Eingaben gelöscht', state);
}

function saveResult() {
    Logger.info('Speichere Ergebnis');

    const result = document.getElementById('resultArea').value.trim();
    if (!result) {
        Logger.warning('Kein Ergebnis vorhanden');
        showAlert('Kein Ergebnis zum Speichern vorhanden!', 'warning');
        return;
    }

    try {
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const filename = `KI-Assistent_${timestamp}.txt`;
        const agentName = APP_STATE.currentAgent ?
            document.getElementById('agentSelect').selectedOptions[0].text : 'Unbekannt';

        const content = `KI-Assistent Ergebnis
Zeitpunkt: ${new Date().toLocaleString('de-DE')}
Aufgabe: ${agentName}
${'='.repeat(50)}

${result}`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        showAlert(`Ergebnis wurde gespeichert: ${filename}`, 'success');

        Logger.success('Ergebnis gespeichert', {
            filename: filename,
            agent: agentName,
            resultLength: result.length
        });
    } catch (error) {
        Logger.error('Fehler beim Speichern', error);
        showAlert('Fehler beim Speichern!', 'error');
    }
}

function copyResult() {
    Logger.info('Kopiere Ergebnis');

    const result = document.getElementById('resultArea').value.trim();
    if (!result) {
        Logger.warning('Kein Ergebnis zum Kopieren');
        showAlert('Kein Ergebnis zum Kopieren vorhanden!', 'warning');
        return;
    }

    navigator.clipboard.writeText(result).then(() => {
        showAlert('Ergebnis wurde in die Zwischenablage kopiert!', 'success');
        Logger.success('Ergebnis kopiert', { resultLength: result.length });
    }).catch(err => {
        showAlert('Fehler beim Kopieren: ' + err, 'error');
        Logger.error('Fehler beim Kopieren', err);
    });
}

function showSettingsMenu() {
    Logger.debug('Öffne Einstellungsmenü');
    showModal('settingsModal');
}

function showInfo() {
    Logger.info('Zeige Anwendungsinformationen');

    closeModal('settingsModal');

    const status = Logger.getStatus();
    Logger.debug('Logger-Status abgerufen', status);

    const modelInfo = APP_STATE.availableModels
        ? `\n\nVerfügbare Modelle: ${APP_STATE.availableModels.length}
Aktuell verwendete Modelle:
- Standard: ${APP_STATE.modelCategories.standard?.id || 'N/A'}
- Reasoning: ${APP_STATE.modelCategories.reasoning?.id || 'N/A'}
- Code: ${APP_STATE.modelCategories.code?.id || 'N/A'}`
        : '\n\nModelle: Noch nicht geladen';

    alert(`KI-Assistent für Uni Mainz

Version: 2.1 (Web mit dynamischer Modell-Auswahl)
Entwickelt für die einfache Nutzung der KI-Services

API-Status: ${APP_STATE.apiKey ? '✅ Konfiguriert' : '❌ Nicht konfiguriert'}
Hochgeladene Dateien: ${APP_STATE.uploadedFiles.length}/3${modelInfo}

Basiert auf der offiziellen ZDV-Dokumentation:
- ki-chat.uni-mainz.de/api
- OpenAI-kompatible API`);
}

function showModal(modalId) {
    Logger.debug('Zeige Modal', { modalId: modalId });
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    Logger.debug('Schließe Modal', { modalId: modalId });
    document.getElementById(modalId).classList.remove('active');
}

function showAlert(message, type) {
    Logger.debug('Zeige Alert', { type: type, message: message });

    const alertArea = document.getElementById('alertArea');
    alertArea.className = `alert alert-${type} active`;
    alertArea.textContent = message;

    setTimeout(() => {
        alertArea.classList.remove('active');
    }, 5000);
}

function setupLogoErrorHandler() {
    const logo = document.getElementById('logoImg');
    if (logo) {
        logo.onerror = function() {
            Logger.warning('Logo konnte nicht geladen werden');
            this.style.display = 'none';
        };
        Logger.debug('Logo Error-Handler eingerichtet');
    }
}
