let task = {};
let taskId = [];

// Speichert, welche Karte gerade gezogen wird
let currentDraggedElement;

// Wird aufgerufen, wenn eine Karte zu ziehen beginnt
function startDragging(dragEvent) {
  currentDraggedElement = dragEvent.target; // Speichere die Karte, die gezogen wird
  dragEvent.target.classList.add("dragging"); // Füge CSS-Klasse hinzu (macht Karte transparent)
}

// Wird aufgerufen, wenn das Ziehen beendet wird
function endDragging(dragEvent) {
  dragEvent.target.classList.remove("dragging"); // Entferne CSS-Klasse wieder
}

// Erlaubt das Ablegen einer Karte
function allowDrop(dragEvent) {
  dragEvent.preventDefault(); // Wichtig! Ohne diese Zeile funktioniert Drag & Drop nicht
  dragEvent.currentTarget.classList.add("drag-over"); // Zeige blauen Rahmen an
}

// Wird aufgerufen, wenn eine Karte abgelegt wird
function drop(dropEvent) {
  dropEvent.preventDefault(); // Verhindere Standard-Verhalten des Browsers
  dropEvent.currentTarget.classList.remove("drag-over"); // Entferne blauen Rahmen

  // Füge die gezogene Karte in die neue Spalte ein
  const taskList = dropEvent.currentTarget; // Die Spalte, wo die Karte abgelegt wird
  taskList.appendChild(currentDraggedElement); // Verschiebe die Karte in die Spalte

  // Status der Karte in der Datenbank updaten
  // z.B. updateTaskStatus(currentDraggedElement.id, taskList.id);
}

// Entfernt das "drag-over" Styling, wenn die Karte die Spalte verlässt
function removeDragOver(dragEvent) {
  dragEvent.currentTarget.classList.remove("drag-over"); // Entferne blauen Rahmen
}

// Erstellt eine Beispiel-Karte

function createTaskCard(title, description, category) {
  const card = document.createElement("div");
  card.className = "task-card";
  card.draggable = true; // Mache die Karte ziehbar

  // Verbinde die Drag & Drop Funktionen mit der Karte
  card.ondragstart = startDragging;
  card.ondragend = endDragging;

  card.innerHTML = `
    <div class="task-category ${category
      .toLowerCase()
      .replace(" ", "-")}">${category}</div>
    <h3 class="task-title">${title}</h3>
    <p class="task-description">${description}</p>
  `;

  return card;
}

function loadExampleTasks() {
  const todoList = document.getElementById("todo");
  todoList.appendChild(
    createTaskCard(
      "Kochwelt Page & Recipe Recommender",
      "Build start page with recipe recommendation...",
      "User Story"
    )
  );

  const inProgressList = document.getElementById("in-progress");
  inProgressList.appendChild(
    createTaskCard(
      "HTML Base Template Creation",
      "Create reusable HTML base templates...",
      "Technical Task"
    )
  );

  const awaitFeedbackList = document.getElementById("await-feedback");
  awaitFeedbackList.appendChild(
    createTaskCard(
      "Daily Kochwelt Recipe",
      "Implement daily recipe and portion calculator...",
      "User Story"
    )
  );

  const doneList = document.getElementById("done");
  doneList.appendChild(
    createTaskCard(
      "CSS Architecture Planning",
      "Define CSS naming conventions and structure...",
      "Technical Task"
    )
  );
}

// Lade Beispiel-Karten, wenn die Seite fertig geladen ist
document.addEventListener("DOMContentLoaded", loadExampleTasks);

async function openAddTaskOverlay() {
  const overlay = document.getElementById("add-task-overlay");
  const content = document.getElementById("add-task-content");

  if (!content.innerHTML.trim()) {
    const response = await fetch("add_task_overlay.html");
    content.innerHTML = await response.text();
  }

  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
}

function closeAddTaskOverlay() {
  const overlay = document.getElementById("add-task-overlay");
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overlay-open");
}
