let task = {};
let taskId = [];

async function fetchTasks() {
  task = (await loadData("task/")) || {};
  taskId = Object.keys(task);

  dataToCard();
}

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

function dataToCard() {
  for (let i = 0; i < taskId.length; i++) {
    const id = taskId[i];
    const taskData = task[id];
    console.log("Task Data:", taskData);
    createTaskCard(taskData.category, taskData.title, taskData.description);
  }
}

function createTaskCard(category, title, description) {
  const card = document
    .getElementById("todo")
    .appendChild(document.createElement("div"));

  card.className = "task-card";
  card.draggable = true; // Mache die Karte ziehbar

  // Verbinde die Drag & Drop Funktionen mit der Karte
  card.ondragstart = startDragging;
  card.ondragend = endDragging;

  console.log("Creating card for task:", taskId.length);

  card.innerHTML += `
    <div>
    <div class="task-category">${category}</div>
    <h3 class="task-title">${title}</h3>
    <p class="task-description">${description}</p>
    </div>
  `;
}

// Lade Karten, wenn die Seite fertig geladen ist
document.addEventListener("DOMContentLoaded", fetchTasks);
