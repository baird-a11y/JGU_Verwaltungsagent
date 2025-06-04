#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
KI-Assistent Desktop App - Uni Mainz
Einfache Desktop-Anwendung für OpenWebUI
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox, filedialog
from tkinter import simpledialog
import requests
import json
import threading
from datetime import datetime
import os
import PyPDF2
from docx import Document

class APIKeyManager:
    """Einfache Verwaltung für API-Key-Speicherung"""
    
    def __init__(self):
        self.config_file = "api_key.txt"
    
    def save_api_key(self, api_key):
        """API-Key in Datei speichern"""
        try:
            with open(self.config_file, "w", encoding="utf-8") as f:
                f.write(api_key.strip())
            return True
        except Exception as e:
            print(f"Fehler beim Speichern: {e}")
            return False
    
    def load_api_key(self):
        """API-Key aus Datei laden"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, "r", encoding="utf-8") as f:
                    return f.read().strip()
            return None
        except Exception as e:
            print(f"Fehler beim Laden: {e}")
            return None

class KIAssistentApp:
    def __init__(self, root):
        self.root = root
        self.api_key_manager = APIKeyManager()
        self.setup_window()
        self.setup_config()
        self.uploaded_files = [] # Liste für bis zu 3 Dateien: [{"name": "...", "content": "..."}, ...]
       
        
        # API-Key laden oder abfragen
        self.api_key = self.api_key_manager.load_api_key()
        if not self.api_key:
            self.api_key = self.request_api_key()
            if not self.api_key:
                messagebox.showerror("Fehler", "Ohne API-Key kann die Anwendung nicht gestartet werden.")
                root.destroy()
                return
            # API-Key speichern für nächstes Mal
            self.api_key_manager.save_api_key(self.api_key)
        
        self.setup_ui()
        self.current_task = None
        
    def setup_window(self):
        """Fenster konfigurieren"""
        self.root.title("KI-Assistent - Uni Mainz")
        self.root.geometry("1000x700")
        self.root.configure(bg='#f0f0f0')
        
        # Icon setzen 
        try:
            # Für .png Dateien müssen wir PIL verwenden
            from PIL import Image, ImageTk
            
            # PNG laden und zu PhotoImage konvertieren
            image = Image.open('Gehin_ganz_logo.png')  # Ihr PNG-Dateiname hier
            image = image.resize((32, 32))  # Größe für Titelleiste
            icon = ImageTk.PhotoImage(image)
            self.root.iconphoto(True, icon)
        except Exception as e:
            print(f"Logo konnte nicht geladen werden: {e}")
    
    def request_api_key(self):
        """API-Key vom Benutzer abfragen"""
        dialog_text = """Willkommen beim KI-Assistenten!

    Für die Nutzung benötigen Sie einen API-Key von ki-chat.uni-mainz.de

    So erhalten Sie Ihren API-Key:
    1. Öffnen Sie https://ki-chat.uni-mainz.de
    2. Melden Sie sich mit Ihren Uni-Zugangsdaten an
    3. Gehen Sie zu den Einstellungen/API-Keys
    4. Erstellen Sie einen neuen API-Key
    5. Kopieren Sie den Key

    Geben Sie Ihren API-Key ein:"""
        
        api_key = simpledialog.askstring(
            "API-Key eingeben", 
            dialog_text,
            show='*'  # Versteckt die Eingabe wie bei einem Passwort
        )
        
        if api_key:
            return api_key.strip()
        return None

    def setup_config(self):
        """API-Konfiguration"""
        self.api_url = "https://ki-chat.uni-mainz.de"
        
        
        # Verfügbare Modelle
        self.models = {
            "Standard": "Nemotron Ultra 253B",
            "Reasoning": "Nemotron Ultra 253B (Reasoning)",
            "Vision": "Gemma3 27B", 
            "Code": "Qwen2.5 Coder 32B"
        }
        
        # Agent-Konfigurationen
        self.agents = {
            "📝 Text zusammenfassen": {
                "model": "Standard",
                "prompt": "Du bist ein Experte für Textzusammenfassungen. Erstelle eine präzise, strukturierte Zusammenfassung des folgenden Textes. Verwende Bullet Points und hebe die wichtigsten Aspekte hervor.",
                "placeholder": "Geben Sie hier den Text ein, den Sie zusammenfassen möchten...",
                "example": "Beispiel: Langer Artikel, Bericht oder Dokumenttext"
            },
            "🌍 Text übersetzen": {
                "model": "Standard", 
                "prompt": "Du bist ein professioneller Übersetzer. Übersetze den folgenden Text präzise nach {language}. Achte auf Kontext, Stil und kulturelle Nuancen.",
                "placeholder": "Geben Sie hier den Text ein, den Sie übersetzen möchten...",
                "example": "Beispiel: 'Hello, how are you today?'",
                "languages": ["Deutsch", "English", "Français", "Español", "Italiano", "Nederlands"]
            },
            "✉️ E-Mail schreiben": {
                "model": "Standard",
                "prompt": "Du bist ein Experte für professionelle Kommunikation. Verfasse basierend auf den folgenden Stichpunkten eine höfliche, professionelle E-Mail mit Betreff, Anrede, strukturiertem Hauptteil und angemessenem Schluss.",
                "placeholder": "Beschreiben Sie, was die E-Mail enthalten soll:\n\nBeispiel:\n- Meeting nächste Woche vereinbaren\n- Agenda: Budget und Planung\n- Teilnehmer: alle Abteilungsleiter",
                "example": "Stichpunkte für E-Mail-Inhalt"
            },
            "📊 Daten analysieren": {
                "model": "Reasoning",
                "prompt": "Du bist ein Datenanalyst. Analysiere die bereitgestellten Informationen strukturiert. Erstelle eine Analyse mit: 1) Wichtigste Erkenntnisse, 2) Trends/Muster, 3) Konkrete Handlungsempfehlungen.",
                "placeholder": "Fügen Sie hier Ihre Daten ein:\n\nBeispiel:\nVerkaufszahlen 2024:\nQ1: 150.000€\nQ2: 180.000€\nQ3: 165.000€\nQ4: 195.000€",
                "example": "Zahlen, Statistiken oder Informationen zur Analyse"
            },
            "🔍 Thema erforschen": {
                "model": "Reasoning",
                "prompt": "Du bist ein Research-Experte. Führe eine strukturierte Analyse zum Thema durch. Gliedere deine Antwort: 1) Überblick, 2) Wichtigste Aspekte, 3) Aktuelle Entwicklungen, 4) Fazit/Ausblick.",
                "placeholder": "Geben Sie das Thema an:\n\nBeispiel: 'Künstliche Intelligenz in der Medizin' oder 'Nachhaltigkeit in der Automobilindustrie'",
                "example": "Thema für Research"
            },
            "💻 Code erstellen": {
                "model": "Code",
                "prompt": "Du bist ein erfahrener {language}-Entwickler. Schreibe sauberen, effizienten und gut dokumentierten Code. Erkläre kurz, was der Code macht.",
                "placeholder": "Beschreiben Sie, welchen Code Sie benötigen:\n\nBeispiel:\n- Eine Funktion, die CSV-Dateien einliest\n- Ein Programm zum Sortieren von Listen\n- Eine einfache Webseite mit Formular",
                "example": "Beschreibung der Code-Anforderungen",
                "languages": ["Python", "JavaScript", "Java", "C++", "PHP", "Go", "Rust"]
            }
        }

    def upload_file(self):
        """Datei hochladen und Inhalt extrahieren"""
        # Prüfen ob bereits 3 Dateinen hochgeladen wurden
        if len(self.uploaded_files) >= 3:
            messagebox.showwarning("Limit erreicht", "Sie können maximal 3 Dateien hochladen.\nLöschen Sie erst eine Datei oder leeren Sie alles.")
            return
        # Datei-Dialog öffnen
        file_path = filedialog.askopenfilename(
            title="Datei auswählen",
            filetypes=[
                ("Text-Dateien", "*.txt"),
                ("PDF-Dateien", "*.pdf"),
                ("Word-Dokumente", "*.docx"),
                ("Alle Dateien", "*.*")
            ]
        )
        
        if file_path:
            try:
                content = self.extract_file_content(file_path)
                if content:
                    # Datei zur Liste hinzufügen
                    filename = os.path.basename(file_path)
                    self.uploaded_files.append({
                        "name": filename,
                        "content": content
                    })
                    
                    # UI aktualisieren
                    self.update_file_display()
                    
                    messagebox.showinfo("✅ Erfolg", f"Datei '{filename}' wurde erfolgreich geladen!\n\n{len(self.uploaded_files)}/3 Dateien hochgeladen.")
                else:
                    messagebox.showerror("Fehler", "Dateiinhalt konnte nicht extrahiert werden!")
            except Exception as e:
                messagebox.showerror("Fehler", f"Fehler beim Laden der Datei:\n{str(e)}")

    def show_settings(self):
        """Einstellungsmenü anzeigen"""
        # Einfaches Popup-Menü
        menu = tk.Menu(self.root, tearoff=0)
        menu.add_command(label="🔑 API-Key ändern", command=self.change_api_key)
        menu.add_separator()
        menu.add_command(label="ℹ️ Info", command=self.show_info)
        
        # Menü an der Button-Position anzeigen
        try:
            menu.tk_popup(self.root.winfo_pointerx(), self.root.winfo_pointery())
        finally:
            menu.grab_release()

    def change_api_key(self):
        """API-Key ändern"""
        new_key = self.request_api_key()
        if new_key:
            self.api_key = new_key
            self.api_key_manager.save_api_key(new_key)
            messagebox.showinfo("✅ Erfolg", "API-Key wurde erfolgreich geändert!")

    def show_info(self):
        """Info-Dialog anzeigen"""
        info_text = """KI-Assistent für Uni Mainz

        Version: 1.1
        Entwickelt für die einfache Nutzung der KI-Services

        API-Key Status: ✅ Konfiguriert"""
        
        messagebox.showinfo("ℹ️ Information", info_text) 

    def setup_ui(self):
        """Benutzeroberfläche erstellen"""
        # Hauptframe
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Grid-Konfiguration
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        
        # Titel
        title_frame = ttk.Frame(main_frame)
        title_frame.grid(row=0, column=0, columnspan=2, pady=(0, 20), sticky=(tk.W, tk.E))
        title_frame.columnconfigure(0, weight=1)

        # Titel links
        title_left = ttk.Frame(title_frame)
        title_left.grid(row=0, column=0, sticky=(tk.W, tk.E))

        # Logo und Titel nebeneinander
        title_content = ttk.Frame(title_left)
        title_content.pack()

        # Logo laden
        try:
            from PIL import Image, ImageTk
            image = Image.open('Gehin_ganz_logo.png')  # Ihr PNG-Dateiname hier
            image = image.resize((48, 48))  # Größe für Titel-Bereich
            self.logo_image = ImageTk.PhotoImage(image)
            
            logo_label = ttk.Label(title_content, image=self.logo_image)
            logo_label.pack(side=tk.LEFT, padx=(0, 10))
        except Exception as e:
            print(f"Logo konnte nicht geladen werden: {e}")

        title_label = ttk.Label(title_content, text="KI-Assistent", font=('Arial', 24, 'bold'))
        title_label.pack(side=tk.LEFT)

        # Untertitel
        subtitle_label = ttk.Label(title_left, text="Uni Mainz - Einfach und schnell", font=('Arial', 12))
        subtitle_label.pack()

        # Einstellungen-Button rechts
        settings_btn = ttk.Button(title_frame, text="Hilfe", command=self.show_settings)
        settings_btn.grid(row=0, column=1, sticky=tk.E)
        
        # Agent-Auswahl
        agent_frame = ttk.LabelFrame(main_frame, text="🎯 Was soll die KI für Sie tun?", padding="15")
        agent_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 15))
        agent_frame.columnconfigure(0, weight=1)
        
        self.agent_var = tk.StringVar()
        self.agent_combo = ttk.Combobox(agent_frame, textvariable=self.agent_var, 
                                       values=list(self.agents.keys()), 
                                       state="readonly", font=('Arial', 12))
        self.agent_combo.grid(row=0, column=0, sticky=(tk.W, tk.E), padx=(0, 10))
        self.agent_combo.bind('<<ComboboxSelected>>', self.on_agent_change)
        
        # Beispiel-Button
        self.example_btn = ttk.Button(agent_frame, text="💡 Beispiel", command=self.show_example)
        self.example_btn.grid(row=0, column=1)
        
        # Zusätzliche Optionen Frame
        self.options_frame = ttk.Frame(main_frame)
        self.options_frame.grid(row=2, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 15))
        self.options_frame.columnconfigure(0, weight=1)
        self.options_frame.columnconfigure(1, weight=1)
        
        # Eingabe-Bereich
        input_frame = ttk.LabelFrame(main_frame, text="💬 Ihr Text", padding="15")
        input_frame.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 15))
        input_frame.columnconfigure(0, weight=1)
        input_frame.rowconfigure(1, weight=1)

        # Frame für Datei-Informationen
        self.files_frame = ttk.Frame(input_frame)
        self.files_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 5))
        self.files_frame.columnconfigure(0, weight=1)

        # Labels für hochgeladene Dateien (bis zu 3)
        self.file_labels = []
        for i in range(3):
            label = ttk.Label(self.files_frame, text="", font=('Arial', 9), foreground="blue")
            label.grid(row=i, column=0, sticky=(tk.W), pady=1)
            self.file_labels.append(label)

        self.input_text = scrolledtext.ScrolledText(input_frame, wrap=tk.WORD, 
                                                height=8, font=('Arial', 11))
        self.input_text.grid(row=1, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Button-Frame
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=4, column=0, columnspan=2, pady=(0, 15))
        
        # Buttons
        self.process_btn = ttk.Button(button_frame, text="🚀 Starten", 
                                     command=self.process_text, style='Accent.TButton')
        self.process_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        self.clear_btn = ttk.Button(button_frame, text="🗑️ Leeren", command=self.clear_all)
        self.clear_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        self.upload_btn = ttk.Button(button_frame, text="📁 Datei laden", command=self.upload_file)
        self.upload_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        self.save_btn = ttk.Button(button_frame, text="💾 Speichern", command=self.save_result)
        self.save_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        self.copy_btn = ttk.Button(button_frame, text="📋 Kopieren", command=self.copy_result)
        self.copy_btn.pack(side=tk.LEFT)
        
        # Fortschrittsbalken
        self.progress = ttk.Progressbar(main_frame, mode='indeterminate')
        self.progress.grid(row=5, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 15))
        
        # Ergebnis-Bereich
        result_frame = ttk.LabelFrame(main_frame, text="📋 Ergebnis", padding="15")
        result_frame.grid(row=6, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S))
        result_frame.columnconfigure(0, weight=1)
        result_frame.rowconfigure(0, weight=1)
        
        self.result_text = scrolledtext.ScrolledText(result_frame, wrap=tk.WORD, 
                                                    height=10, font=('Arial', 11))
        self.result_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Grid-Gewichte setzen
        main_frame.rowconfigure(3, weight=1)
        main_frame.rowconfigure(6, weight=2)
        
        # Initialer Zustand
        self.update_ui_state(False)
        
    def on_agent_change(self, event=None):
        """Agent-Auswahl geändert"""
        agent = self.agent_var.get()
        if agent in self.agents:
            # Placeholder aktualisieren
            placeholder = self.agents[agent]["placeholder"]
            self.input_text.delete(1.0, tk.END)
            self.input_text.insert(1.0, placeholder)
            self.input_text.configure(fg='gray')
            
            # Zusätzliche Optionen anzeigen
            self.setup_agent_options(agent)
            
            # Event Binding für Placeholder
            self.input_text.bind('<FocusIn>', self.on_entry_focus_in)
            self.input_text.bind('<FocusOut>', self.on_entry_focus_out)
            
    def setup_agent_options(self, agent):
        """Zusätzliche Optionen für spezielle Agenten"""
        # Alte Widgets entfernen
        for widget in self.options_frame.winfo_children():
            widget.destroy()
            
        agent_config = self.agents[agent]
        
        # Sprachauswahl für Übersetzer
        if "languages" in agent_config:
            lang_label = ttk.Label(self.options_frame, text="🌍 Zielsprache:")
            lang_label.grid(row=0, column=0, sticky=tk.W, padx=(0, 10))
            
            self.language_var = tk.StringVar(value="Deutsch")
            lang_combo = ttk.Combobox(self.options_frame, textvariable=self.language_var,
                                     values=agent_config["languages"], state="readonly")
            lang_combo.grid(row=0, column=1, sticky=(tk.W, tk.E))
            
        # Programmiersprache für Code-Agent
        elif agent == "💻 Code erstellen":
            lang_label = ttk.Label(self.options_frame, text="💻 Programmiersprache:")
            lang_label.grid(row=0, column=0, sticky=tk.W, padx=(0, 10))
            
            self.code_language_var = tk.StringVar(value="Python")
            lang_combo = ttk.Combobox(self.options_frame, textvariable=self.code_language_var,
                                     values=agent_config["languages"], state="readonly")
            lang_combo.grid(row=0, column=1, sticky=(tk.W, tk.E))
            
    def on_entry_focus_in(self, event):
        """Placeholder entfernen bei Fokus"""
        if self.input_text.get(1.0, tk.END).strip() == self.agents[self.agent_var.get()]["placeholder"]:
            self.input_text.delete(1.0, tk.END)
            self.input_text.configure(fg='black')
            
    def on_entry_focus_out(self, event):
        """Placeholder wieder hinzufügen wenn leer"""
        if not self.input_text.get(1.0, tk.END).strip():
            placeholder = self.agents[self.agent_var.get()]["placeholder"]
            self.input_text.insert(1.0, placeholder)
            self.input_text.configure(fg='gray')
            
    def show_example(self):
        """Beispiel anzeigen"""
        agent = self.agent_var.get()
        if agent in self.agents:
            example = self.agents[agent]["example"]
            messagebox.showinfo("💡 Beispiel", f"Beispiel für '{agent}':\n\n{example}")
            
    def process_text(self):
        """Text verarbeiten"""
        agent = self.agent_var.get()
        if not agent:
            messagebox.showerror("Fehler", "Bitte wählen Sie zuerst eine Aufgabe aus!")
            return
            
        user_input = self.input_text.get(1.0, tk.END).strip()
        placeholder = self.agents[agent]["placeholder"]

        # Prüfen ob Text leer oder nur Placeholder
        if not user_input or user_input == placeholder:
            user_input = ""  # Leeren Input setzen

        # Prüfen ob weder Text noch Datei vorhanden
        if not user_input and not self.uploaded_files:
            messagebox.showerror("Fehler", "Bitte geben Sie einen Text ein oder laden Sie eine Datei hoch!")
            return

        # Wenn nur Datei aber kein Text: Standard-Anweisung verwenden
        if not user_input and self.uploaded_files:
            # Je nach Agent eine passende Standard-Anweisung
            default_instructions = {
                "📝 Text zusammenfassen": "Bitte fassen Sie den Inhalt der Datei zusammen.",
                "🌍 Text übersetzen": "Bitte übersetzen Sie den Inhalt der Datei.",
                "✉️ E-Mail schreiben": "Bitte verfassen Sie eine E-Mail basierend auf dem Inhalt der Datei.",
                "📊 Daten analysieren": "Bitte analysieren Sie die Daten aus der Datei.",
                "🔍 Thema erforschen": "Bitte erstellen Sie eine Analyse basierend auf dem Dateiinhalt.",
                "💻 Code erstellen": "Bitte erstellen Sie Code basierend auf den Anforderungen in der Datei."
            }
            user_input = default_instructions.get(agent, "Bitte bearbeiten Sie den Inhalt der Datei entsprechend der gewählten Aufgabe.")
            
        # UI aktualisieren
        self.update_ui_state(True)
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(1.0, "🔄 KI arbeitet für Sie...\nDas kann 10-30 Sekunden dauern.")
        
        # In separatem Thread verarbeiten
        self.current_task = threading.Thread(target=self.call_api, args=(agent, user_input))
        self.current_task.daemon = True
        self.current_task.start()
        
    def call_api(self, agent, user_input):
        """API-Aufruf in separatem Thread"""
        try:
            agent_config = self.agents[agent]
            model = self.models[agent_config["model"]]
            system_prompt = agent_config["prompt"]
            
            # Spezielle Behandlung für verschiedene Agenten
            if agent == "🌍 Text übersetzen" and hasattr(self, 'language_var'):
                target_lang = self.language_var.get()
                system_prompt = system_prompt.format(language=target_lang)
            elif agent == "💻 Code erstellen" and hasattr(self, 'code_language_var'):
                code_lang = self.code_language_var.get()
                system_prompt = system_prompt.format(language=code_lang)

            # Benutzer-Input mit Dateiinhalt kombinieren falls vorhanden
            final_user_input = user_input
            if self.uploaded_files:
                final_user_input += "\n\n--- Inhalte der hochgeladenen Dateien ---\n"
                for i, file_info in enumerate(self.uploaded_files, 1):
                    final_user_input += f"\n=== Datei {i}: {file_info['name']} ===\n"
                    final_user_input += file_info['content']
                    final_user_input += "\n" + "="*50 + "\n"

            # API-Request
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": final_user_input}
                ],
                "temperature": 0.7,
                "max_tokens": 1500
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{self.api_url}/api/chat/completions",
                headers=headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("choices") and len(data["choices"]) > 0:
                    result = data["choices"][0]["message"]["content"]
                    
                    # UI in Hauptthread aktualisieren
                    self.root.after(0, self.display_result, result)
                else:
                    self.root.after(0, self.display_error, "Keine Antwort von der KI erhalten")
            else:
                error_msg = f"API-Fehler: {response.status_code}\n{response.text}"
                self.root.after(0, self.display_error, error_msg)
                
        except requests.exceptions.Timeout:
            self.root.after(0, self.display_error, "Zeitüberschreitung - bitte erneut versuchen")
        except requests.exceptions.ConnectionError:
            self.root.after(0, self.display_error, "Verbindungsfehler - prüfen Sie Ihre Internetverbindung")
        except Exception as e:
            self.root.after(0, self.display_error, f"Unerwarteter Fehler: {str(e)}")
            
    def display_result(self, result):
        """Ergebnis anzeigen"""
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(1.0, result)
        self.update_ui_state(False)
        
        # Ergebnis-Historie speichern
        self.save_to_history(result)
        
    def display_error(self, error):
        """Fehler anzeigen"""
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(1.0, f"❌ Fehler:\n\n{error}")
        self.update_ui_state(False)
        
    def save_to_history(self, result):
        """Ergebnis in Historie speichern"""
        try:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            agent = self.agent_var.get()
            user_input = self.input_text.get(1.0, tk.END).strip()
            
            history_entry = {
                "timestamp": timestamp,
                "agent": agent,
                "input": user_input[:100] + "..." if len(user_input) > 100 else user_input,
                "output": result
            }
            
            # In Datei speichern
            if not os.path.exists("ki_historie.json"):
                with open("ki_historie.json", "w", encoding="utf-8") as f:
                    json.dump([], f)
                    
            with open("ki_historie.json", "r", encoding="utf-8") as f:
                history = json.load(f)
                
            history.insert(0, history_entry)
            history = history[:50]  # Nur letzten 50 Einträge behalten
            
            with open("ki_historie.json", "w", encoding="utf-8") as f:
                json.dump(history, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            print(f"Fehler beim Speichern der Historie: {e}")
            
    def update_ui_state(self, processing):
        """UI-Zustand aktualisieren"""
        if processing:
            self.progress.start()
            self.process_btn.configure(state='disabled')
        else:
            self.progress.stop()
            self.process_btn.configure(state='normal')

    def extract_file_content(self, file_path):
        """Dateiinhalt je nach Typ extrahieren"""
        file_extension = os.path.splitext(file_path)[1].lower()
        
        try:
            if file_extension == '.txt':
                # Textdatei
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            
            elif file_extension == '.pdf':
                # PDF-Datei (erst mal einfache Implementierung)
                try:
                    
                    with open(file_path, 'rb') as f:
                        reader = PyPDF2.PdfReader(f)
                        text = ""
                        for page in reader.pages:
                            text += page.extract_text() + "\n"
                            # DEBUG: Text-Länge anzeigen
                            # print(f"DEBUG: PDF hat {len(text)} Zeichen")
                            # print(f"DEBUG: Erste 200 Zeichen: {text[:200]}")
                            
                        # if len(text.strip()) < 10:
                            # return "❌ PDF scheint leer zu sein oder ist ein gescanntes Dokument (kein Text erkennbar)"
                            
                        return text
                except ImportError:
                    return "❌ PyPDF2 nicht installiert. Bitte installieren Sie: pip install PyPDF2"
            
            elif file_extension == '.docx':
                # Word-Dokument
                try:
                    doc = Document(file_path)
                    text = ""
                    for paragraph in doc.paragraphs:
                        text += paragraph.text + "\n"
                    
                    # DEBUG: Text-Länge anzeigen
                    print(f"DEBUG: Word-Dokument hat {len(text)} Zeichen")
                    
                    if len(text.strip()) < 5:
                        return "❌ Word-Dokument scheint leer zu sein"
                    
                    return text
                except ImportError:
                    return "❌ python-docx nicht installiert. Bitte installieren Sie: pip install python-docx"
                except Exception as e:
                    return f"❌ Fehler beim Lesen des Word-Dokuments: {str(e)}"
            
            else:
                # Versuche als Textdatei zu lesen
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
                    
        except Exception as e:
            raise Exception(f"Fehler beim Lesen der Datei: {str(e)}")

    def get_current_placeholder(self):
        """Aktuellen Placeholder-Text zurückgeben"""
        agent = self.agent_var.get()
        if agent in self.agents:
            return self.agents[agent]["placeholder"]
        return ""

    def clear_all(self):
        """Alles leeren"""
        self.input_text.delete(1.0, tk.END)
        self.result_text.delete(1.0, tk.END)
        self.agent_var.set("")
        
        # Datei-Info leeren
        self.uploaded_file_content = [] 
        self.update_file_display()

        # Optionen leeren
        for widget in self.options_frame.winfo_children():
            widget.destroy()
            
    def copy_result(self):
        """Ergebnis kopieren"""
        result = self.result_text.get(1.0, tk.END).strip()
        if result:
            self.root.clipboard_clear()
            self.root.clipboard_append(result)
            messagebox.showinfo("✅ Kopiert", "Ergebnis wurde in die Zwischenablage kopiert!")
        else:
            messagebox.showwarning("Warnung", "Kein Ergebnis zum Kopieren vorhanden!")
    
    def update_file_display(self):
        """Datei-Anzeige aktualisieren"""
        # Alle Labels leeren
        for label in self.file_labels:
            label.config(text="")
        
        # Hochgeladene Dateien anzeigen
        for i, file_info in enumerate(self.uploaded_files):
            if i < 3:  # Sicherheitscheck
                self.file_labels[i].config(text=f"📁 {file_info['name']} ❌", cursor="hand2")
                # Click-Event zum Löschen hinzufügen
                self.file_labels[i].bind("<Button-1>", lambda e, idx=i: self.remove_file(idx))

    def remove_file(self, index):
        """Einzelne Datei entfernen"""
        if 0 <= index < len(self.uploaded_files):
            filename = self.uploaded_files[index]['name']
            result = messagebox.askyesno("Datei entfernen", f"Möchten Sie die Datei '{filename}' entfernen?")
            if result:
                self.uploaded_files.pop(index)
                self.update_file_display()       
    def save_result(self):
        """Ergebnis speichern"""
        result = self.result_text.get(1.0, tk.END).strip()
        if not result:
            messagebox.showwarning("Warnung", "Kein Ergebnis zum Speichern vorhanden!")
            return
            
        filename = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Textdateien", "*.txt"), ("Alle Dateien", "*.*")],
            title="Ergebnis speichern"
        )
        
        if filename:
            try:
                with open(filename, "w", encoding="utf-8") as f:
                    f.write(f"KI-Assistent Ergebnis\n")
                    f.write(f"Zeitpunkt: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                    f.write(f"Aufgabe: {self.agent_var.get()}\n")
                    f.write("="*50 + "\n\n")
                    f.write(result)
                    
                messagebox.showinfo("✅ Gespeichert", f"Ergebnis wurde gespeichert:\n{filename}")
            except Exception as e:
                messagebox.showerror("Fehler", f"Fehler beim Speichern:\n{str(e)}")

def main():
    """Hauptfunktion"""
    # Tkinter-Root erstellen
    root = tk.Tk()
    
    # Style konfigurieren
    style = ttk.Style()
    style.theme_use('clam')
    
    # App erstellen
    app = KIAssistentApp(root)
    
    # Event Handler für Fenster schließen
    def on_closing():
        if messagebox.askokcancel("Beenden", "Möchten Sie die Anwendung wirklich beenden?"):
            root.destroy()
            
    root.protocol("WM_DELETE_WINDOW", on_closing)
    
    # App starten
    root.mainloop()

if __name__ == "__main__":
    main()