let task = {};
let taskId = [];

async function fetchTasks() {
  task = (await loadData("task/")) || {};
  taskId = Object.keys(task);

  dataToCard();
}

// Speichert, welche Karte gerade gezogen wird
let currentDraggedElement;
let currentTouchElement = null; // Die Karte, die mit dem Finger bewegt wird
let touchClone = null; // Eine Kopie der Karte, die dem Finger folgt
let touchOffsetX = 0; // Abstand zwischen Finger und Karte (horizontal)
let touchOffsetY = 0; // Abstand zwischen Finger und Karte (vertikal)
let autoScrollInterval = null; // Timer für automatisches Scrollen

// === Desktop Drag & Drop Funktionen ===

// Wird aufgerufen, wenn eine Karte zu ziehen beginnt (Desktop)
function startDragging(dragEvent) {
  currentDraggedElement = dragEvent.target; // Speichere die Karte, die gezogen wird
  dragEvent.target.classList.add("dragging"); // Füge CSS-Klasse hinzu (macht Karte transparent)
}

// Wird aufgerufen, wenn das Ziehen beendet wird (Desktop)
function endDragging(dragEvent) {
  dragEvent.target.classList.remove("dragging"); // Entferne CSS-Klasse wieder
}

// Erlaubt das Ablegen einer Karte (Desktop)
function allowDrop(dragEvent) {
  dragEvent.preventDefault(); // Wichtig! Ohne diese Zeile funktioniert Drag & Drop nicht
  dragEvent.currentTarget.classList.add("drag-over"); // Zeige blauen Rahmen an
}

// Wird aufgerufen, wenn eine Karte abgelegt wird (Desktop)
function drop(dropEvent) {
  dropEvent.preventDefault(); // Verhindere Standard-Verhalten des Browsers
  dropEvent.currentTarget.classList.remove("drag-over"); // Entferne blauen Rahmen

  // Füge die gezogene Karte in die neue Spalte ein
  const taskList = dropEvent.currentTarget; // Die Spalte, wo die Karte abgelegt wird
  taskList.appendChild(currentDraggedElement); // Verschiebe die Karte in die Spalte

  // Status der Karte in der Datenbank updaten
  // z.B. updateTaskStatus(currentDraggedElement.id, taskList.id);
}

// Entfernt das "drag-over" Styling, wenn die Karte die Spalte verlässt (Desktop)
function removeDragOver(dragEvent) {
  dragEvent.currentTarget.classList.remove("drag-over"); // Entferne blauen Rahmen
}

// === Mobile Touch Funktionen ===

// Wird aufgerufen, wenn der Benutzer eine Karte berührt (Mobile)
function handleTouchStart(touchEvent) {
  currentTouchElement = touchEvent.currentTarget; // Speichere die Karte, die berührt wird
  currentDraggedElement = currentTouchElement; // Setze auch currentDraggedElement
  currentTouchElement.classList.add("dragging"); // Mache originale Karte halbtransparent

  // Erstelle eine Kopie der Karte, die dem Finger folgt
  touchClone = currentTouchElement.cloneNode(true); // Kopiere die Karte komplett
  touchClone.classList.add("touch-clone"); // Füge spezielle CSS-Klasse hinzu
  touchClone.classList.remove("dragging"); // Die Kopie soll nicht transparent sein
  document.body.appendChild(touchClone); // Füge Kopie zum Body hinzu

  // Berechne den Abstand zwischen Finger und Karte
  const cardPosition = currentTouchElement.getBoundingClientRect();
  const touch = touchEvent.touches[0];
  touchOffsetX = touch.clientX - cardPosition.left;
  touchOffsetY = touch.clientY - cardPosition.top;

  // Positioniere die Kopie direkt unter dem Finger
  touchClone.style.left = (touch.clientX - touchOffsetX) + 'px';
  touchClone.style.top = (touch.clientY - touchOffsetY) + 'px';
}

// Wird aufgerufen, während der Benutzer den Finger bewegt (Mobile)
function handleTouchMove(touchEvent) {
  if (!currentTouchElement || !touchClone) return; // Wenn keine Karte ausgewählt ist, mache nichts

  touchEvent.preventDefault(); // Verhindere normales Scrollen, weil wir eine Karte ziehen

  // Hole die Position des Fingers
  const touch = touchEvent.touches[0];
  const fingerX = touch.clientX;
  const fingerY = touch.clientY;

  // Bewege die Kopie der Karte mit dem Finger mit
  touchClone.style.left = (fingerX - touchOffsetX) + 'px';
  touchClone.style.top = (fingerY - touchOffsetY) + 'px';

  // === Automatisches Scrollen am Rand des Bildschirms ===
  const scrollZone = 100; // Pixel vom Rand, wo Auto-Scroll startet
  const scrollSpeed = 10; // Wie schnell gescrollt wird
  const windowHeight = window.innerHeight; // Höhe des Bildschirms

  // Stoppe vorheriges Auto-Scroll
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }

  // Wenn Finger nahe am oberen Rand ist, scrolle nach oben
  if (fingerY < scrollZone) {
    autoScrollInterval = setInterval(function() {
      window.scrollBy(0, -scrollSpeed);
    }, 20);
  }
  // Wenn Finger nahe am unteren Rand ist, scrolle nach unten
  else if (fingerY > windowHeight - scrollZone) {
    autoScrollInterval = setInterval(function() {
      window.scrollBy(0, scrollSpeed);
    }, 20);
  }

  // Verstecke die Kopie kurz, um das Element darunter zu finden
  touchClone.style.display = 'none';
  const elementUnderFinger = document.elementFromPoint(fingerX, fingerY);
  touchClone.style.display = 'block'; // Zeige Kopie wieder an

  // Entferne alle blauen Rahmen von allen Spalten
  const allTaskLists = document.querySelectorAll('.task-list');
  allTaskLists.forEach(function(list) {
    list.classList.remove('drag-over');
  });

  // Wenn der Finger über einer task-list ist, zeige blauen Rahmen
  if (elementUnderFinger) {
    const taskListUnderFinger = elementUnderFinger.closest('.task-list');
    if (taskListUnderFinger) {
      taskListUnderFinger.classList.add('drag-over');
    }
  }
}

// Wird aufgerufen, wenn der Benutzer den Finger hebt (Mobile)
function handleTouchEnd(touchEvent) {
  if (!currentTouchElement) return; // Wenn keine Karte ausgewählt ist, mache nichts

  // Stoppe automatisches Scrollen
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }

  currentTouchElement.classList.remove("dragging"); // Entferne Transparenz von originaler Karte

  // Hole die Position, wo der Finger losgelassen wurde
  const touch = touchEvent.changedTouches[0];
  const fingerX = touch.clientX;
  const fingerY = touch.clientY;

  // Entferne die Kopie der Karte
  if (touchClone) {
    touchClone.style.display = 'none';
    const elementAtDropPosition = document.elementFromPoint(fingerX, fingerY);
    touchClone.remove(); // Lösche die Kopie komplett
    touchClone = null;

    // Entferne alle blauen Rahmen von allen Spalten
    const allTaskLists = document.querySelectorAll('.task-list');
    allTaskLists.forEach(function(list) {
      list.classList.remove('drag-over');
    });

    // Wenn eine task-list an dieser Position ist, verschiebe die originale Karte dorthin
    if (elementAtDropPosition) {
      const targetTaskList = elementAtDropPosition.closest('.task-list');
      if (targetTaskList && currentDraggedElement) {
        targetTaskList.appendChild(currentDraggedElement); // Verschiebe die Karte
        // Status der Karte in der Datenbank updaten
        // z.B. updateTaskStatus(currentDraggedElement.id, targetTaskList.id);
      }
    }
  }

  // Setze die Touch-Variablen zurück
  currentTouchElement = null;
  currentDraggedElement = null;
}

function dataToCard() {
  for (let i = 0; i < taskId.length; i++) {
    const id = taskId[i];
    const taskData = task[id];
    console.log("Task Data:", taskData);
    createTaskCard(taskData.category, taskData.title, taskData.description, taskData.assignedTo, taskData.priority, taskData.date, taskData.subtasks);
  }
}

function createTaskCard(category, title, description, assignedTo, priority, date, substasks) {
  const card = document
    .getElementById("todo")
    .appendChild(document.createElement("div"));

  card.className = "task-card";
  card.draggable = true; // Mache die Karte ziehbar

  // Verbinde die Drag & Drop Funktionen mit der Karte (für Desktop)
  card.ondragstart = startDragging;
  card.ondragend = endDragging;

  // Verbinde die Touch Funktionen mit der Karte (für Mobile)
  card.addEventListener('touchstart', handleTouchStart);
  card.addEventListener('touchmove', handleTouchMove);
  card.addEventListener('touchend', handleTouchEnd);

  console.log("Creating card for task:", taskId.length);

  card.innerHTML += `
    <div>
    <div class="task-category ${category}">${category}</div>
    <h3 class="task-title">${title}</h3>
    <p class="task-description">${description}</p>
    <div class="subTaskProgressbar"></div><p class="subTaskCounter"></p>
    <div class="assignedUser">${assignedTo}</div><img src="../assets/icons/${priority}_red.svg" class="priority">
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
