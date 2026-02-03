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
    // console.log("Task Data:", taskData);
    createTaskCard(taskData.category, taskData.title, taskData.description, id);
  }
}

function createTaskCard(category, title, description, id) {
  const card = document
    .getElementById("todo")
    .appendChild(document.createElement("div"));

  card.className = "task-card";
  card.draggable = true; // Mache die Karte ziehbar

  // Verbinde die Drag & Drop Funktionen mit der Karte
  card.ondragstart = startDragging;
  card.ondragend = endDragging;

  // console.log("Creating card for task:", taskId.length);

  //Osman: onclick hinzugefügt, damit große Karte öffnet -> in der Funktion muss id übergeben werden
  card.innerHTML += `
    <div onclick="openTaskOverlay('${id}')">
      <div class="task-category">${category}</div>
      <h3 class="task-title">${title}</h3>
      <p class="task-description">${description}</p>
    </div>
  `;
}

// Lade Karten, wenn die Seite fertig geladen ist
document.addEventListener("DOMContentLoaded", fetchTasks);

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

function openTaskOverlay(id) {
  const overlay = document.getElementById("task_overlay");
  overlay.innerHTML = "";
  overlay.innerHTML = generateTaskOverlay(task[id].category, task[id].title, task[id].description,
    task[id].dueDate, task[id].priority, task[id].assignees, task[id].subtasks, id);
  overlay.classList.add("active");
  // console.log(id);
  // console.log(task[id].subtasks);
  console.log(task[id].subtasks[0]);
}

function assignees(assignedTo) {
  if (assignedTo && assignedTo.length > 0) {
    return assignedTo.map(person => `<div>${person}</div>`).join("");
  }
  return "";
}

async function deleteTask(contactId) {
  await deleteData("task/" + contactId);
  closeTaskOverlay();
}

function closeTaskOverlay() {
  const overlay = document.getElementById("task_overlay");
  overlay.classList.remove("active");
}
