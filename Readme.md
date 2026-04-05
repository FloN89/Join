# Join

Join ist eine browserbasierte Task- und Projektmanagement-App im Kanban-Stil.  
Die Anwendung bietet Benutzerregistrierung, Login und Gastzugang, ein Summary-Dashboard, ein Board mit Drag-and-drop, eine Add-Task-Strecke sowie ein Kontaktmanagement.

## Features

- Benutzerregistrierung und Login
- Gastzugang zum Testen der Anwendung
- Summary-Dashboard mit Kennzahlen und Begrüßung
- Kanban-Board mit den Spalten **To do**, **In progress**, **Await feedback** und **Done**
- Task-Suche direkt auf dem Board
- Drag-and-drop zum Verschieben von Aufgaben
- Aufgaben anlegen mit:
  - Titel
  - Beschreibung
  - Fälligkeitsdatum
  - Priorität
  - Kategorie
  - zugewiesenen Kontakten
  - Subtasks
- Aufgaben im Overlay anzeigen, bearbeiten und löschen
- Kontaktverwaltung mit Erstellen, Bearbeiten und Löschen
- Wiederverwendbare Sidebar- und Topbar-Templates
- Firebase-basierte Datenspeicherung

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Firebase Realtime Database

## Projektstruktur

```text
Join/
├── assets/                 # Icons, Bilder und weitere statische Dateien
├── html/                   # Hauptseiten der Anwendung
│   ├── add_task.html
│   ├── add_task_overlay.html
│   ├── board.html
│   ├── contacts_default.html
│   ├── help.html
│   ├── legal-notice.html
│   ├── log_in.html
│   ├── privacy.html
│   ├── sign-up.html
│   └── summary.html
├── js/                     # JavaScript-Logik nach Features aufgeteilt
│   ├── add_task*.js
│   ├── board*.js
│   ├── contacts_default.js
│   ├── firebase.js
│   ├── guest-data.js
│   ├── log_in.js
│   ├── sidebar-loader.js
│   ├── sign-up.js
│   ├── start_page.js
│   ├── summary.js
│   └── topbar-loader.js
├── styles/                 # Globale, komponentenbezogene und responsive Styles
├── templates/              # HTML-Templates für Layout-Komponenten
├── index.html              # Splash-/Startseite
├── script.js               # Gemeinsame Hilfsfunktionen
└── style.css               # Styles der Startseite