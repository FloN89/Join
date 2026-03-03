# Join-Projekt Prüfbericht

## Zusammenfassung

Das Projekt ist funktionsfähig mit guter Grundstruktur. Es gibt jedoch mehrere konkrete Punkte, die vor der Abgabe behoben werden müssen.

---

## Kategorie 1: Allgemein & GitHub

| Status | Punkt |
|--------|-------|
| ✅ | MPA-Architektur (Multi-Page-Application) umgesetzt |
| ✅ | Repository muss public gestellt werden (vor Abgabe prüfen) |
| ✅ | Aussagekräftige Dateinamen vorhanden |
| ❌ | **`.gitignore` fehlt komplett** – muss erstellt werden |
| ❌ | **Mindestens 5 Tasks und 10 Kontakte vor Abgabe** in Firebase befüllen |
| ⚠️ | Nach Abschluss sollte jedes Mitglied das Projekt forken |

---

## Kategorie 2: JavaScript / Clean Code

| Status | Punkt | Details |
|--------|-------|---------|
| ❌ | **`board.js` hat 794 Zeilen** | Max. 400 erlaubt – Datei aufteilen |
| ❌ | **`add_task.js` hat 664 Zeilen** | Max. 400 erlaubt – Datei aufteilen |
| ❌ | **`add_task_overlay.js` hat 553 Zeilen** | Max. 400 erlaubt – Datei aufteilen |
| ❌ | **`handleTouchMove()` in `board.js` hat ~77 Zeilen** | Max. 14 (ohne HTML) erlaubt |
| ❌ | **`handleTouchEnd()` in `board.js` hat ~41 Zeilen** | Max. 14 erlaubt |
| ❌ | **`board.js` hat nur 6 JSDoc-Blöcke bei 794 Zeilen** | Alle Funktionen dokumentieren |
| ❌ | **`console.log` in `topbar-loader.js`** (Zeilen 16, 21, 27) | Vor Abgabe entfernen |
| ⚠️ | `summary_guest.js` ist leer | Entfernen oder befüllen |
| ✅ | camelCase für alle Funktionen und Variablen |
| ✅ | `add_task_overlay.js` hat sehr gute JSDoc-Dokumentation (63 Blöcke) |
| ✅ | `add_task.js` hat gute JSDoc-Dokumentation (17 Blöcke) |
| ✅ | Erster Buchstabe von Funktionen/Variablen klein geschrieben |

**Konkrete TODOs:**

```
- board.js aufteilen: z.B. board-drag.js, board-search.js, board-render.js
- add_task.js aufteilen: z.B. add_task-form.js, add_task-submit.js
- handleTouchMove() in board.js in kleinere Funktionen aufteilen
- JSDoc für alle Funktionen in board.js ergänzen
- console.log/error Aufrufe aus topbar-loader.js entfernen
- summary_guest.js entfernen oder befüllen
```

---

## Kategorie 3: Design & CSS

| Status | Punkt |
|--------|-------|
| ✅ | `cursor: pointer` konsequent bei allen Buttons (51 Vorkommen) |
| ✅ | `border: unset` / `border: none` bei Inputs und Buttons |
| ✅ | Transitions implementiert (75ms, 100ms, 125ms vorhanden) |
| ✅ | `max-width` für grosse Monitore definiert (1400px via CSS-Variable) |
| ⚠️ | Manche Transitions sind 300–400ms – Checkliste sagt 75–125ms |

---

## Kategorie 4: Responsiveness

| Status | Punkt | Details |
|--------|-------|---------|
| ❌ | **320px Support unvollständig** | Nur `sign-up.css` und `start_page.css` haben 320px Media Queries – alle anderen Seiten prüfen |
| ❌ | **Landscape-Mode auf Mobile nicht deaktiviert** | CSS `@media (orientation: landscape) and (max-width: 480px)` fehlt für alle Seiten |
| ✅ | Horizontale Scrollbalken verhindert (`overflow-x: hidden`) |
| ✅ | Desktop und Mobile-Layouts vorhanden |
| ✅ | Vertikale Anordnung der Kanban-Spalten auf Mobile |

**Konkrete TODOs:**

```
- Media Query @media (max-width: 320px) für alle Seiten testen und ggf. ergänzen
- @media (orientation: landscape) and (max-width: 480px) mit Landscape-Deaktivierung
  oder Hinweis ("Bitte Gerät drehen") für alle Seiten ergänzen
```

---

## Kategorie 5: Formulare & Validierung

| Status | Punkt | Details |
|--------|-------|---------|
| ❌ | **Keine Validierung bei "Add Contact"** | `createContact()` speichert ohne Validierung – leere Felder werden akzeptiert |
| ❌ | **Keine Validierung bei "Edit Contact"** | Gleiches Problem |
| ❌ | **HTML5-Validierung verwendet** | `log_in.html` nutzt `type="email" required`, `sign-up.html` nutzt `required` – Checkliste verbietet HTML5-Standardvalidation |
| ❌ | **Submit-Button bei Add Task nicht deaktiviert** während Speicherung | Nur bei Sign-up implementiert |
| ✅ | Assigned-to Dropdown schließt sich bei Klick außerhalb (via `handleOutsideClick()`) |
| ✅ | Enter-Taste im Subtask-Feld löst `preventDefault()` aus – kein Form-Submit |
| ✅ | Custom JS-Validierung für Add Task (Titel, Due Date, Kategorie) |

**Konkrete TODOs:**

```
- contacts_default.js: Validierung für Name (Pflicht), E-Mail (Format),
  Telefon (Format) vor dem Speichern ergänzen
- log_in.html: required-Attribut entfernen, stattdessen JS-Validierung nutzen
- sign-up.html: required-Attribute entfernen, stattdessen JS-Validierung nutzen
- add_task_overlay.js: Submit-Button während dem fetch() deaktivieren und danach wieder aktivieren
```

---

## Kategorie 6: User Stories – Benutzeraccount

| Status | Anforderung |
|--------|-------------|
| ✅ | Registrierungsformular (Name, E-Mail, Passwort) vorhanden |
| ✅ | Datenschutz-Checkbox bei Registrierung |
| ✅ | "Registrieren"-Button deaktiviert bis alle Felder gefüllt und Checkbox gesetzt |
| ⚠️ | Fehlermeldung bei ungültiger E-Mail vorhanden, aber durch HTML5-`type="email"` |
| ✅ | Login-Formular mit E-Mail und Passwort |
| ✅ | Fehlermeldung bei falschem Passwort/E-Mail |
| ✅ | Gast-Login vorhanden und funktionsfähig |
| ✅ | Redirect auf Login bei geschützten Seiten |
| ✅ | Logout-Option in der UI |
| ✅ | Redirect auf Login nach Logout |
| ❌ | **Begrüssung auf Summary nicht Tageszeit-abhängig** | Nur "Good morning!" – es fehlen "Good afternoon!" und "Good evening!" |

**Konkrete TODOs:**

```
- summary.js: Begrüssung abhängig von Uhrzeit:
    - 6–12 Uhr:  "Good morning!"
    - 12–18 Uhr: "Good afternoon!"
    - 18–24 Uhr: "Good evening!"
```

---

## Kategorie 7: User Stories – Kanban Board

| Status | Anforderung |
|--------|-------------|
| ✅ | 4 Spalten: ToDo, In Progress, Awaiting Feedback, Done |
| ✅ | "Keine Tasks"-Hinweis bei leerer Spalte |
| ✅ | Jeder Task zeigt Kategorie, Titel, Beschreibung-Preview, Initialen, Priorität |
| ✅ | Detailansicht bei Klick auf Task |
| ✅ | "+" Icon in jeder Spalte (ausser Done) |
| ✅ | Fortschrittsbalken bei Subtasks (erledigte/gesamt) |
| ✅ | Suchfunktion (filtert nach Titel und Beschreibung, Echtzeit) |
| ✅ | "Keine Ergebnisse"-Meldung bei leerer Suche |
| ✅ | Task hinzufügen: alle Pflichtfelder (Titel, Due Date, Kategorie) |
| ✅ | Kategorien nur "Technical Task" und "User Story" |
| ✅ | Priority "Medium" standardmäßig vorausgewählt |
| ✅ | Drag & Drop Desktop |
| ✅ | Drag & Drop Mobile (Touch Events) |
| ✅ | Drag-Feedback (visuelle Rückmeldung beim Ziehen) |
| ✅ | Gestrichelte Box (highlight) beim Ziehen über Spalte |
| ✅ | Task bearbeiten (Edit-Ansicht mit allen Feldern) |
| ✅ | Task löschen (Papierkorb-Icon) |
| ⚠️ | Subtask-Hover: Stift und Mülleimer erscheinen – visuell prüfen ob korrekt |

---

## Kategorie 8: User Stories – Kontakte

| Status | Anforderung |
|--------|-------------|
| ✅ | Kontakte alphabetisch sortiert |
| ✅ | Buchstaben-Abschnitte (Gruppierung nach erstem Buchstaben) |
| ✅ | E-Mail unterhalb des Namens angezeigt |
| ✅ | Detailansicht mit Name, E-Mail, Telefonnummer |
| ✅ | Kontakt hinzufügen (Formular vorhanden) |
| ✅ | Kontakt bearbeiten |
| ✅ | Kontakt löschen (endgültig) |
| ❌ | **Validierung bei Add/Edit Contact fehlt** | (siehe Kategorie 5) |
| ❌ | **Kontakt löschen entfernt ihn nicht aus Tasks** | Wenn ein Kontakt gelöscht wird, muss er aus allen zugewiesenen Tasks entfernt werden |
| ⚠️ | Eigener Account in der Kontaktliste sichtbar und bearbeitbar – bitte prüfen |

**Konkrete TODOs:**

```
- contacts_default.js: Beim Löschen eines Kontakts alle Tasks in Firebase durchgehen
  und den Kontakt aus der "assigned"-Liste der Tasks entfernen
```

---

## Kategorie 9: Sonstiges (Legal / Privacy)

| Status | Anforderung |
|--------|-------------|
| ✅ | Legal Notice Seite vorhanden (`/html/legal-notice.html`) |
| ✅ | Privacy Policy Seite vorhanden (`/html/privacy.html`) |
| ⚠️ | **Realitätsnahe Namen in Legal Notice prüfen** – kein Lorem Ipsum |

---

## Priorisierte Todo-Liste (nach Wichtigkeit)

### Kritisch – muss vor Abgabe behoben werden

- [ ] **`.gitignore` erstellen** – verhindert sensible Daten im Repository
- [ ] **Contact-Validierung** – `createContact()` und `updateContact()` validieren
- [ ] **Kontakt löschen → aus Tasks entfernen** – Anforderung aus User Story Kontakte 4
- [ ] **JS-Dateien aufteilen** – `board.js` (794), `add_task.js` (664), `add_task_overlay.js` (553) über 400 Zeilen
- [ ] **`handleTouchMove()` refaktorieren** – 77 Zeilen → in Hilfsfunktionen aufteilen
- [ ] **HTML5-Validierung entfernen** – `required`-Attribute und `type="email"` durch JS-Validierung ersetzen
- [ ] **`console.log` entfernen** – aus `topbar-loader.js` (Zeilen 16, 21, 27)

### Wichtig – sollte behoben werden

- [ ] **Tageszeit-Begrüssung** – Morning / Afternoon / Evening in `summary.js` umsetzen
- [ ] **Submit-Button deaktivieren** bei Add Task während dem Speichern
- [ ] **320px Media Queries** für alle Seiten testen und ergänzen
- [ ] **Landscape-Mode** auf Mobile deaktivieren (CSS `@media (orientation: landscape) and (max-width: 480px)`)
- [ ] **JSDoc für `board.js`** – alle Funktionen dokumentieren

### Vor Abgabe erledigen

- [ ] **5 Tasks und 10 Kontakte** in Firebase befüllen (realistisch, kein Lorem Ipsum)
- [ ] **Legal Notice** auf realitätsnahe Namen prüfen
- [ ] **Manuelle Tests** in Chrome, Firefox, Safari, Edge
- [ ] **Repository auf public** stellen
- [ ] **Eigenen Account in Kontaktliste** prüfen – sichtbar und bearbeitbar?
- [ ] **`summary_guest.js`** (leer) bereinigen oder entfernen
- [ ] **Transitions** auf 75–125ms beschränken (aktuell teils 300–400ms)
- [ ] Nach Abgabe: jedes Gruppenmitglied das Projekt forken
