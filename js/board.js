let task = {};
let taskId = [];

async function fetchTasks() {
  let userId = sessionStorage.getItem("userId");

  if (userId === "guest") {
    await seedGuestTasks();
    task = (await loadData("guest-tasks/")) || {};
  } else {
    task = (await loadData("task/")) || {};
  }

  taskId = Object.keys(task);

  clearBoard();
  dataToCard();
}

let currentDraggedElement;
let currentTouchElement = null;
let touchClone = null;
let touchOffsetX = 0;
let touchOffsetY = 0;
let autoScrollInterval = null;
let touchStartX = 0;
let touchStartY = 0;
let isDragging = false;

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

  if (!currentDraggedElement) return;

  const taskList = dropEvent.currentTarget;
  taskList.appendChild(currentDraggedElement);

  updateEmptyStates();
  updateTaskStatus(currentDraggedElement, taskList.id);
}

function removeDragOver(dragEvent) {
  dragEvent.currentTarget.classList.remove("drag-over");
}

// === Mobile Touch Drag & Drop ===

function handleTouchStart(touchEvent) {
  currentTouchElement = touchEvent.currentTarget;
  currentDraggedElement = currentTouchElement;

  const touch = touchEvent.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  isDragging = false;

  const cardPosition = currentTouchElement.getBoundingClientRect();
  touchOffsetX = touch.clientX - cardPosition.left;
  touchOffsetY = touch.clientY - cardPosition.top;
}

function handleTouchMove(touchEvent) {
  if (!currentTouchElement) return;

  const touch = touchEvent.touches[0];
  const fingerX = touch.clientX;
  const fingerY = touch.clientY;

  const deltaX = Math.abs(fingerX - touchStartX);
  const deltaY = Math.abs(fingerY - touchStartY);

  // Wenn noch nicht im Drag-Modus, pruefe ob Bewegung starten soll
  if (!isDragging) {
    // Schwellenwert: 10px Bewegung
    if (deltaX < 10 && deltaY < 10) return;

    // Wenn mehr horizontal als vertikal: normales Scrollen (kein Drag)
    if (deltaX > deltaY) {
      return;
    }

    // Vertikale Bewegung: starte Drag
    isDragging = true;
    currentTouchElement.classList.add("dragging");

    // Erstelle jetzt die Kopie
    touchClone = currentTouchElement.cloneNode(true);
    touchClone.classList.add("touch-clone");
    touchClone.classList.remove("dragging");
    document.body.appendChild(touchClone);

    touchClone.style.left = fingerX - touchOffsetX + "px";
    touchClone.style.top = fingerY - touchOffsetY + "px";
  }

  if (!isDragging || !touchClone) return;

  touchEvent.preventDefault();

  touchClone.style.left = fingerX - touchOffsetX + "px";
  touchClone.style.top = fingerY - touchOffsetY + "px";

  const scrollZone = 100;
  const scrollSpeed = 10;
  const windowHeight = window.innerHeight;

  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }

  if (fingerY < scrollZone) {
    autoScrollInterval = setInterval(function () {
      window.scrollBy(0, -scrollSpeed);
    }, 20);
  } else if (fingerY > windowHeight - scrollZone) {
    autoScrollInterval = setInterval(function () {
      window.scrollBy(0, scrollSpeed);
    }, 20);
  }

  // Kopie kurz verstecken, um Element darunter zu finden
  touchClone.style.display = "none";
  const elementUnderFinger = document.elementFromPoint(fingerX, fingerY);
  touchClone.style.display = "block";

  const allTaskLists = document.querySelectorAll(".task-list");
  allTaskLists.forEach(function (list) {
    list.classList.remove("drag-over");
  });

  if (elementUnderFinger) {
    const taskListUnderFinger = elementUnderFinger.closest(".task-list");
    if (taskListUnderFinger) {
      taskListUnderFinger.classList.add("drag-over");
    }
  }
}

function handleTouchEnd(touchEvent) {
  if (!currentTouchElement) return;

  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }

  // Nur wenn tatsaechlich ein Drag stattgefunden hat
  if (isDragging) {
    currentTouchElement.classList.remove("dragging");

    const touch = touchEvent.changedTouches[0];
    const fingerX = touch.clientX;
    const fingerY = touch.clientY;

    if (touchClone) {
      touchClone.style.display = "none";
      const elementAtDropPosition = document.elementFromPoint(fingerX, fingerY);
      touchClone.remove();
      touchClone = null;

      const allTaskLists = document.querySelectorAll(".task-list");
      allTaskLists.forEach(function (list) {
        list.classList.remove("drag-over");
      });

      if (elementAtDropPosition) {
        const targetTaskList = elementAtDropPosition.closest(".task-list");
        if (targetTaskList && currentDraggedElement) {
          targetTaskList.appendChild(currentDraggedElement);
          updateEmptyStates();
          updateTaskStatus(currentDraggedElement, targetTaskList.id);
        }
      }
    }
  }

  currentTouchElement = null;
  currentDraggedElement = null;
  isDragging = false;
}

async function updateTaskStatus(taskElement, newStatus) {
  const id = taskElement.dataset.taskId;
  if (!id || !task[id]) return;

  task[id].status = newStatus;

  const userId = sessionStorage.getItem("userId");
  const path = userId === "guest" ? "guest-tasks/" + id : "task/" + id;
  await saveData(path, task[id]);
}

function dataToCard() {
  for (let i = 0; i < taskId.length; i++) {
    let id = taskId[i];
    let taskData = task[id];
    if (!taskData) continue;
    let status = taskData.status || "todo";
    createTaskCard(taskData.category, taskData.title, taskData.description, taskData.assignedTo, taskData.priority, taskData.subtasks, id, status);
  }
  updateEmptyStates();
}

function updateEmptyStates() {
  const categories = [
    { id: "todo", name: "To do" },
    { id: "in-progress", name: "In progress" },
    { id: "await-feedback", name: "Await feedback" },
    { id: "done", name: "Done" }
  ];

  categories.forEach(function (category) {
    const taskList = document.getElementById(category.id);
    if (!taskList) return;
    const existingPlaceholder = taskList.querySelector(".empty-state");

    if (existingPlaceholder) {
      existingPlaceholder.remove();
    }

    const taskCards = taskList.querySelectorAll(".task-card");
    if (taskCards.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "empty-state";
      placeholder.textContent = "No tasks " + category.name;
      taskList.appendChild(placeholder);
    }
  });
}

function createTaskCard(category, title, description, assignedTo, priority, subtasks, id, status) {
  let columnId = status || "todo";
  let column = document.getElementById(columnId);
  if (!column) {
    column = document.getElementById("todo");
  }
  let card = column.appendChild(document.createElement("div"));

  card.className = "task-card";
  card.draggable = true;
  card.dataset.taskId = id;

  // Desktop Drag & Drop
  card.ondragstart = startDragging;
  card.ondragend = endDragging;

  // Mobile Touch Events
  card.addEventListener("touchstart", handleTouchStart, { passive: false });
  card.addEventListener("touchmove", handleTouchMove, { passive: false });
  card.addEventListener("touchend", handleTouchEnd, { passive: false });

  const subtasksHTML = createSubtasksHTML(subtasks);
  const usersHTML = createUsersHTML(assignedTo);
  const priorityColor = getPriorityColor(priority);

  card.innerHTML = `
    <div onclick="openTaskOverlay('${id}', '${priorityColor}')" class="task-card-content">
        <div class="task-category ${category}">${category}</div>
        <h3 class="task-title">${title}</h3>
        <p class="task-description">${description}</p>
      ${subtasksHTML}
      <div class="task-footer">
        <div class="assigned-users">${usersHTML}</div>
        <img src="../assets/icons/${priority}_${priorityColor}.svg" class="priority-icon" alt="${priority}">
      </div>
    </div>
  `;
}

function createSubtasksHTML(subtasks) {
  if (!subtasks || subtasks.length === 0) {
    return "";
  }

  const completedCount = subtasks.filter(function (subtask) {
    return subtask.done === true || subtask.completed === true;
  }).length;
  const totalCount = subtasks.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return `
    <div class="subtasks-container">
      <div class="subtask-progress-bar">
        <div class="subtask-progress-fill" style="width: ${progressPercentage}%"></div>
      </div>
      <span class="subtask-counter">${completedCount}/${totalCount} Subtasks</span>
    </div>
  `;
}

function createUsersHTML(assignedTo) {
  if (!assignedTo || assignedTo.length === 0) {
    return "";
  }

  return assignedTo.map(function (user) {
    const userName = typeof user === "string" ? user : user?.name || "";
    if (!userName) return "";
    const initials = getInitials(userName);
    const backgroundColor = (typeof user === "object" && user?.color) ? user.color : "#CCCCCC";
    return `<div class="user-badge" style="background-color: ${backgroundColor}">${initials}</div>`;
  }).join("");
}

function getInitials(name) {
  if (!name || typeof name !== "string") return "";
  const nameParts = name.split(" ");
  if (!nameParts[0]) return "";
  if (nameParts.length >= 2) {
    return nameParts[0][0] + nameParts[1][0];
  }
  return nameParts[0][0];
}

function createUserBadge(user) {
  const initials = getInitials(user.name);
  const backgroundColor = user.color || "#CCCCCC";
  return `<div class="user-badge" style="background-color: ${backgroundColor}">${initials}</div>`;
}

function getPriorityColor(priority) {
  if (priority === "low") {
    return "green";
  } else if (priority === "medium") {
    return "yellow";
  } else if (priority === "high") {
    return "red";
  } else if (priority === "urgent") {
    return "red";
  }
  return "red";
}

// Lade Karten, wenn die Seite fertig geladen ist
document.addEventListener("DOMContentLoaded", fetchTasks);

async function openAddTaskOverlay() {
  const overlay = document.getElementById("add-task-overlay");
  const content = document.getElementById("add-task-content");

  if (!content.innerHTML.trim()) {
    const response = await fetch("add_task_overlay.html");
    content.innerHTML = await response.text();

    if (typeof initializeAddTaskPage === "function") {
      initializeAddTaskPage();
    }
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

function clearBoard() {
  document.querySelectorAll(".task-list").forEach(list => {
    list.innerHTML = "";
  });
}

function onSearchInput() {
  // Wert aus dem Suchfeld holen
  const inputField = document.getElementById("searchInput");
  const searchValue = inputField.value.toLowerCase().trim();

  // Alle Task-Karten auf dem Board auswaehlen
  const taskCards = document.querySelectorAll(".task-card");
  // Referenz auf die Fehlermeldung unter dem Suchfeld
  const errorMessage = document.getElementById("search_error");

  let visibleCardCount = 0;

  // Wenn das Suchfeld leer ist:
  // - Alle Karten wieder anzeigen
  // - Fehlermeldung ausblenden
  // - Funktion beenden
  if (searchValue === "") {
    taskCards.forEach(function (card) {
      card.style.display = "block";
    });

    errorMessage.style.display = "none";
    return;
  }

  // Jede einzelne Task-Karte ueberpruefen
  taskCards.forEach(function (card) {
    // Titel und Beschreibung der Karte auslesen
    const titleElement = card.querySelector(".task-title");
    const descriptionElement = card.querySelector(".task-description");

    const titleText = titleElement ? titleElement.textContent.toLowerCase() : "";
    const descriptionText = descriptionElement ? descriptionElement.textContent.toLowerCase() : "";

    // Pruefen, ob Suchbegriff im Titel oder in der Beschreibung enthalten ist
    if (titleText.includes(searchValue) || descriptionText.includes(searchValue)) {
      // Karte anzeigen
      card.style.display = "block";
      visibleCardCount++;
    } else {
      // Karte ausblenden
      card.style.display = "none";
    }
  });

  // Wenn keine sichtbaren Karten vorhanden sind: Fehlermeldung anzeigen
  if (visibleCardCount === 0) {
    errorMessage.style.display = "block";
  } else {
    errorMessage.style.display = "none";
  }
}

function focusSearchInputField() {
  const inputField = document.getElementById("searchInput");
  inputField.focus();
}
