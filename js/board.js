let task = {};
let taskId = [];

async function fetchTasks() {
  task = (await loadData("task/")) || {};
  taskId = Object.keys(task);

  dataToCard();
}

let currentDraggedElement;
let currentTouchElement = null;
let touchClone = null;
let touchOffsetX = 0;
let touchOffsetY = 0;
let autoScrollInterval = null;

// === Desktop Drag & Drop ===

function startDragging(dragEvent) {
  currentDraggedElement = dragEvent.target;
  dragEvent.target.classList.add("dragging");
}

function endDragging(dragEvent) {
  dragEvent.target.classList.remove("dragging");
}

function allowDrop(dragEvent) {
  dragEvent.preventDefault();
  dragEvent.currentTarget.classList.add("drag-over");
}

function drop(dropEvent) {
  dropEvent.preventDefault();
  dropEvent.currentTarget.classList.remove("drag-over");

  const taskList = dropEvent.currentTarget;
  taskList.appendChild(currentDraggedElement);

  // TODO: Status in Datenbank updaten
  // updateTaskStatus(currentDraggedElement.id, taskList.id);
}

function removeDragOver(dragEvent) {
  dragEvent.currentTarget.classList.remove("drag-over");
}

// === Mobile Touch Drag & Drop ===

function handleTouchStart(touchEvent) {
  currentTouchElement = touchEvent.currentTarget;
  currentDraggedElement = currentTouchElement;
  currentTouchElement.classList.add("dragging");

  // Erstelle eine sichtbare Kopie der Karte, die dem Finger folgt
  touchClone = currentTouchElement.cloneNode(true);
  touchClone.classList.add("touch-clone");
  touchClone.classList.remove("dragging");
  document.body.appendChild(touchClone);

  const cardPosition = currentTouchElement.getBoundingClientRect();
  const touch = touchEvent.touches[0];
  touchOffsetX = touch.clientX - cardPosition.left;
  touchOffsetY = touch.clientY - cardPosition.top;

  touchClone.style.left = (touch.clientX - touchOffsetX) + 'px';
  touchClone.style.top = (touch.clientY - touchOffsetY) + 'px';
}

function handleTouchMove(touchEvent) {
  if (!currentTouchElement || !touchClone) return;

  touchEvent.preventDefault();

  const touch = touchEvent.touches[0];
  const fingerX = touch.clientX;
  const fingerY = touch.clientY;

  touchClone.style.left = (fingerX - touchOffsetX) + 'px';
  touchClone.style.top = (fingerY - touchOffsetY) + 'px';

  // Automatisches Scrollen wenn Finger am Bildschirmrand
  const scrollZone = 100;
  const scrollSpeed = 10;
  const windowHeight = window.innerHeight;

  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }

  if (fingerY < scrollZone) {
    autoScrollInterval = setInterval(function() {
      window.scrollBy(0, -scrollSpeed);
    }, 20);
  } else if (fingerY > windowHeight - scrollZone) {
    autoScrollInterval = setInterval(function() {
      window.scrollBy(0, scrollSpeed);
    }, 20);
  }

  // Kopie kurz verstecken, um Element darunter zu finden
  touchClone.style.display = 'none';
  const elementUnderFinger = document.elementFromPoint(fingerX, fingerY);
  touchClone.style.display = 'block';

  const allTaskLists = document.querySelectorAll('.task-list');
  allTaskLists.forEach(function(list) {
    list.classList.remove('drag-over');
  });

  if (elementUnderFinger) {
    const taskListUnderFinger = elementUnderFinger.closest('.task-list');
    if (taskListUnderFinger) {
      taskListUnderFinger.classList.add('drag-over');
    }
  }
}

function handleTouchEnd(touchEvent) {
  if (!currentTouchElement) return;

  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }

  currentTouchElement.classList.remove("dragging");

  const touch = touchEvent.changedTouches[0];
  const fingerX = touch.clientX;
  const fingerY = touch.clientY;

  if (touchClone) {
    touchClone.style.display = 'none';
    const elementAtDropPosition = document.elementFromPoint(fingerX, fingerY);
    touchClone.remove();
    touchClone = null;

    const allTaskLists = document.querySelectorAll('.task-list');
    allTaskLists.forEach(function(list) {
      list.classList.remove('drag-over');
    });

    if (elementAtDropPosition) {
      const targetTaskList = elementAtDropPosition.closest('.task-list');
      if (targetTaskList && currentDraggedElement) {
        targetTaskList.appendChild(currentDraggedElement);
        // TODO: Status in Datenbank updaten
      }
    }
  }

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
  card.draggable = true;

  // Desktop Drag & Drop
  card.ondragstart = startDragging;
  card.ondragend = endDragging;

  // Mobile Touch Events
  card.addEventListener('touchstart', handleTouchStart);
  card.addEventListener('touchmove', handleTouchMove);
  card.addEventListener('touchend', handleTouchEnd);

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
