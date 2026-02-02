/**
 * Logger-System für Debugging und Fehleranalyse
 * Unterstützt verschiedene Log-Levels und visuelle Debug-Konsole
 */

const Logger = (function() {
    // Log-Levels
    const LogLevel = {
        DEBUG: { name: 'DEBUG', color: '#6c757d', priority: 0 },
        INFO: { name: 'INFO', color: '#0dcaf0', priority: 1 },
        SUCCESS: { name: 'SUCCESS', color: '#198754', priority: 2 },
        WARNING: { name: 'WARNING', color: '#ffc107', priority: 3 },
        ERROR: { name: 'ERROR', color: '#dc3545', priority: 4 }
    };

    // Interne Log-Speicherung
    let logs = [];
    let isEnabled = true;
    let currentLogLevel = LogLevel.DEBUG;
    let maxLogEntries = 500;
    let consoleElement = null;
    let isVisible = false;

    /**
     * Formatiert Timestamp
     */
    function formatTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
        });
    }

    /**
     * Erstellt Log-Entry Objekt
     */
    function createLogEntry(level, message, data = null, error = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            displayTime: formatTimestamp(),
            level: level.name,
            message: message,
            data: data,
            error: error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : null
        };

        return entry;
    }

    /**
     * Speichert Log und gibt in Browser-Konsole aus
     */
    function writeLog(level, message, data = null, error = null) {
        if (!isEnabled || level.priority < currentLogLevel.priority) {
            return;
        }

        const entry = createLogEntry(level, message, data, error);
        logs.push(entry);

        // Limit beachten
        if (logs.length > maxLogEntries) {
            logs.shift();
        }

        // In Browser-Konsole ausgeben
        const consoleMethod = level.name === 'ERROR' ? 'error' :
                             level.name === 'WARNING' ? 'warn' :
                             level.name === 'SUCCESS' ? 'log' :
                             level.name === 'INFO' ? 'info' : 'debug';

        const consoleMessage = `[${entry.displayTime}] ${level.name}: ${message}`;

        if (data || error) {
            console[consoleMethod](consoleMessage, data || error);
        } else {
            console[consoleMethod](consoleMessage);
        }

        // Visuelles Update
        if (consoleElement && isVisible) {
            appendLogToConsole(entry, level);
        }

        // LocalStorage persistieren (optional)
        if (level.priority >= LogLevel.ERROR.priority) {
            persistCriticalLog(entry);
        }
    }

    /**
     * Fügt Log zur visuellen Konsole hinzu
     */
    function appendLogToConsole(entry, level) {
        if (!consoleElement) return;

        const logContainer = consoleElement.querySelector('.debug-log-entries');
        if (!logContainer) return;

        const logElement = document.createElement('div');
        logElement.className = 'debug-log-entry';
        logElement.style.borderLeft = `3px solid ${level.color}`;

        let content = `
            <div class="debug-log-header">
                <span class="debug-log-time">${entry.displayTime}</span>
                <span class="debug-log-level" style="color: ${level.color}">[${entry.level}]</span>
            </div>
            <div class="debug-log-message">${escapeHtml(entry.message)}</div>
        `;

        if (entry.data) {
            content += `
                <div class="debug-log-data">
                    <strong>Daten:</strong>
                    <pre>${escapeHtml(JSON.stringify(entry.data, null, 2))}</pre>
                </div>
            `;
        }

        if (entry.error) {
            content += `
                <div class="debug-log-error">
                    <strong>Fehler:</strong> ${escapeHtml(entry.error.message)}
                    <details style="margin-top: 5px;">
                        <summary style="cursor: pointer; color: #6c757d;">Stack Trace</summary>
                        <pre style="font-size: 11px; margin-top: 5px;">${escapeHtml(entry.error.stack)}</pre>
                    </details>
                </div>
            `;
        }

        logElement.innerHTML = content;
        logContainer.appendChild(logElement);

        // Auto-scroll nach unten
        logContainer.scrollTop = logContainer.scrollHeight;

        // Limit UI-Einträge (Performance)
        const entries = logContainer.children;
        if (entries.length > 100) {
            logContainer.removeChild(entries[0]);
        }
    }

    /**
     * Escaped HTML für sichere Anzeige
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Speichert kritische Logs in LocalStorage
     */
    function persistCriticalLog(entry) {
        try {
            const criticalLogs = JSON.parse(localStorage.getItem('jgu_critical_logs') || '[]');
            criticalLogs.push(entry);

            // Nur letzten 50 kritischen Logs behalten
            if (criticalLogs.length > 50) {
                criticalLogs.shift();
            }

            localStorage.setItem('jgu_critical_logs', JSON.stringify(criticalLogs));
        } catch (e) {
            console.error('Konnte kritischen Log nicht speichern:', e);
        }
    }

    /**
     * Erstellt visuelle Debug-Konsole
     */
    function createDebugConsole() {
        if (document.getElementById('debugConsole')) {
            return;
        }

        const consoleHtml = `
            <div id="debugConsole" class="debug-console" style="display: none;">
                <div class="debug-console-header">
                    <div class="debug-console-title">
                        🐛 Debug-Konsole
                        <span class="debug-console-badge" id="debugLogCount">0</span>
                    </div>
                    <div class="debug-console-controls">
                        <select id="debugLogLevel" class="debug-select">
                            <option value="0">DEBUG</option>
                            <option value="1">INFO</option>
                            <option value="2">SUCCESS</option>
                            <option value="3">WARNING</option>
                            <option value="4">ERROR</option>
                        </select>
                        <button class="debug-btn" onclick="Logger.exportLogs()">💾 Export</button>
                        <button class="debug-btn" onclick="Logger.clearLogs()">🗑️ Clear</button>
                        <button class="debug-btn debug-btn-close" onclick="Logger.hideConsole()">✖</button>
                    </div>
                </div>
                <div class="debug-log-entries"></div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', consoleHtml);
        consoleElement = document.getElementById('debugConsole');

        // Toggle-Button hinzufügen
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'debugToggleBtn';
        toggleBtn.className = 'debug-toggle-btn';
        toggleBtn.innerHTML = '🐛';
        toggleBtn.title = 'Debug-Konsole öffnen';
        toggleBtn.onclick = () => Logger.toggleConsole();
        document.body.appendChild(toggleBtn);

        // Event-Listener für Log-Level änderung
        const logLevelSelect = document.getElementById('debugLogLevel');
        if (logLevelSelect) {
            logLevelSelect.addEventListener('change', (e) => {
                const priority = parseInt(e.target.value);
                const levels = Object.values(LogLevel);
                currentLogLevel = levels.find(l => l.priority === priority) || LogLevel.DEBUG;
                Logger.info('Log-Level geändert', { level: currentLogLevel.name });
            });
        }

        // Lade existierende Logs
        refreshConsole();
    }

    /**
     * Aktualisiert die Konsolen-Anzeige
     */
    function refreshConsole() {
        if (!consoleElement) return;

        const logContainer = consoleElement.querySelector('.debug-log-entries');
        if (logContainer) {
            logContainer.innerHTML = '';
            logs.forEach(entry => {
                const level = LogLevel[entry.level];
                if (level) {
                    appendLogToConsole(entry, level);
                }
            });
        }

        // Counter aktualisieren
        const counter = document.getElementById('debugLogCount');
        if (counter) {
            counter.textContent = logs.length;
        }
    }

    /**
     * Performance-Messung starten
     */
    function startTimer(label) {
        const timers = window._loggerTimers || {};
        timers[label] = performance.now();
        window._loggerTimers = timers;
        Logger.debug(`⏱️ Timer gestartet: ${label}`);
    }

    /**
     * Performance-Messung beenden
     */
    function endTimer(label) {
        const timers = window._loggerTimers || {};
        if (timers[label]) {
            const duration = performance.now() - timers[label];
            Logger.info(`⏱️ Timer beendet: ${label}`, { dauer: `${duration.toFixed(2)}ms` });
            delete timers[label];
        } else {
            Logger.warning(`Timer "${label}" wurde nicht gefunden`);
        }
    }

    // Öffentliche API
    return {
        // Log-Methoden
        debug: (message, data = null) => writeLog(LogLevel.DEBUG, message, data),
        info: (message, data = null) => writeLog(LogLevel.INFO, message, data),
        success: (message, data = null) => writeLog(LogLevel.SUCCESS, message, data),
        warning: (message, data = null) => writeLog(LogLevel.WARNING, message, data),
        error: (message, error = null, data = null) => writeLog(LogLevel.ERROR, message, data, error),

        // Performance-Tracking
        startTimer: startTimer,
        endTimer: endTimer,

        // Konsolen-Verwaltung
        initConsole: createDebugConsole,

        showConsole: function() {
            if (consoleElement) {
                consoleElement.style.display = 'flex';
                isVisible = true;
                refreshConsole();
            }
        },

        hideConsole: function() {
            if (consoleElement) {
                consoleElement.style.display = 'none';
                isVisible = false;
            }
        },

        toggleConsole: function() {
            if (isVisible) {
                this.hideConsole();
            } else {
                this.showConsole();
            }
        },

        // Log-Verwaltung
        clearLogs: function() {
            if (confirm('Alle Logs löschen?')) {
                logs = [];
                if (consoleElement) {
                    const logContainer = consoleElement.querySelector('.debug-log-entries');
                    if (logContainer) {
                        logContainer.innerHTML = '';
                    }
                }
                this.info('Logs gelöscht');
            }
        },

        exportLogs: function() {
            const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
            const filename = `debug-logs_${timestamp}.json`;

            const exportData = {
                exportDate: new Date().toISOString(),
                application: 'KI-Assistent JGU Mainz',
                logCount: logs.length,
                logs: logs
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            this.success('Logs exportiert', { filename });
        },

        getLogs: function() {
            return [...logs];
        },

        getErrorLogs: function() {
            return logs.filter(log => log.level === 'ERROR');
        },

        // Konfiguration
        setEnabled: function(enabled) {
            isEnabled = enabled;
            this.info(`Logging ${enabled ? 'aktiviert' : 'deaktiviert'}`);
        },

        setLogLevel: function(level) {
            currentLogLevel = level;
            this.info('Log-Level geändert', { level: level.name });
        },

        // Status
        getStatus: function() {
            return {
                enabled: isEnabled,
                logCount: logs.length,
                errorCount: logs.filter(l => l.level === 'ERROR').length,
                warningCount: logs.filter(l => l.level === 'WARNING').length,
                currentLevel: currentLogLevel.name
            };
        }
    };
})();

// Globale Fehlerbehandlung
window.addEventListener('error', function(event) {
    Logger.error('Uncaught Error', event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

window.addEventListener('unhandledrejection', function(event) {
    Logger.error('Unhandled Promise Rejection', event.reason, {
        promise: 'Promise Rejection'
    });
});

// Auto-Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    Logger.initConsole();
    Logger.info('Logger-System initialisiert');
    Logger.debug('Debug-Modus aktiv');
});
