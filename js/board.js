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

  // Wenn noch nicht im Drag-Modus, prüfe ob Bewegung starten soll
  if (!isDragging) {
    // Schwellenwert: 10px Bewegung
    if (deltaX < 10 && deltaY < 10) return;

    // Wenn mehr horizontal als vertikal: normales Scrollen (kein Drag)
    if (deltaX > deltaY) {
      return; // Erlaube horizontales Scrollen
    }

    // Vertikale Bewegung: starte Drag
    isDragging = true;
    currentTouchElement.classList.add("dragging");

    // Erstelle jetzt die Kopie
    touchClone = currentTouchElement.cloneNode(true);
    touchClone.classList.add("touch-clone");
    touchClone.classList.remove("dragging");
    document.body.appendChild(touchClone);

    touchClone.style.left = (fingerX - touchOffsetX) + 'px';
    touchClone.style.top = (fingerY - touchOffsetY) + 'px';
  }

  if (!isDragging || !touchClone) return;

  touchEvent.preventDefault();

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
    autoScrollInterval = setInterval(function () {
      window.scrollBy(0, -scrollSpeed);
    }, 20);
  } else if (fingerY > windowHeight - scrollZone) {
    autoScrollInterval = setInterval(function () {
      window.scrollBy(0, scrollSpeed);
    }, 20);
  }

  // Kopie kurz verstecken, um Element darunter zu finden
  touchClone.style.display = 'none';
  const elementUnderFinger = document.elementFromPoint(fingerX, fingerY);
  touchClone.style.display = 'block';

  const allTaskLists = document.querySelectorAll('.task-list');
  allTaskLists.forEach(function (list) {
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

  // Nur wenn tatsächlich ein Drag stattgefunden hat
  if (isDragging) {
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
      allTaskLists.forEach(function (list) {
        list.classList.remove('drag-over');
      });

      if (elementAtDropPosition) {
        const targetTaskList = elementAtDropPosition.closest('.task-list');
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
    let status = taskData.status || "todo";
    createTaskCard(taskData.category, taskData.title, taskData.description, taskData.assignedTo, taskData.priority, taskData.subtasks, id, status);
  }
  updateEmptyStates();
}

function updateEmptyStates() {
  const categories = [
    { id: 'todo', name: 'To do' },
    { id: 'in-progress', name: 'In progress' },
    { id: 'await-feedback', name: 'Await feedback' },
    { id: 'done', name: 'Done' }
  ];

  categories.forEach(function (category) {
    const taskList = document.getElementById(category.id);
    const existingPlaceholder = taskList.querySelector('.empty-state');

    if (existingPlaceholder) {
      existingPlaceholder.remove();
    }

    const taskCards = taskList.querySelectorAll('.task-card');
    if (taskCards.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'empty-state';
      placeholder.textContent = 'No tasks ' + category.name;
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
  card.addEventListener('touchstart', handleTouchStart, { passive: false });
  card.addEventListener('touchmove', handleTouchMove, { passive: false });
  card.addEventListener('touchend', handleTouchEnd, { passive: false });

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
    return '';
  }

  const completedCount = subtasks.filter(function (subtask) {
    return subtask.completed === true;
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
    return '';
  }

  return assignedTo.map(function (user) {
    const initials = getInitials(user.name);
    const backgroundColor = user.color || '#CCCCCC';
    return `<div class="user-badge" style="background-color: ${backgroundColor}">${initials}</div>`;
  }).join('');
}

function getInitials(name) {
  const nameParts = name.split(' ');
  if (nameParts.length >= 2) {
    return nameParts[0][0] + nameParts[1][0];
  }
  return nameParts[0][0];
}

function createUserBadge(user) {
  const initials = getInitials(user.name);
  const backgroundColor = user.color || '#CCCCCC';
  return `<div class="user-badge" style="background-color: ${backgroundColor}">${initials}</div>`;
}

function getPriorityColor(priority) {
  if (priority === 'low') {
    return 'green';
  } else if (priority === 'medium') {
    return 'yellow';
  } else if (priority === 'high') {
    return 'red';
  } else if (priority === 'urgent') {
    return 'red';
  }
  return 'red';
}

// Lade Karten, wenn die Seite fertig geladen ist
document.addEventListener("DOMContentLoaded", fetchTasks);

async function openAddTaskOverlay() {
  const overlay = document.getElementById("add-task-overlay");
  const content = document.getElementById("add-task-content");

  if (!content.innerHTML.trim()) {
    const response = await fetch("add_task_overlay.html");
    content.innerHTML = await response.text();

    // NACH dem Inject initialisieren:
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

function openTaskOverlay(id, priorityColor) {
  const overlay = document.getElementById("task_overlay");
  const background = document.getElementById("big-card-background")
  overlay.style.display = "flex";

  overlay.innerHTML = "";
  overlay.innerHTML = generateTaskOverlay(task[id].category, task[id].title, task[id].description,
    task[id].dueDate, task[id].priority, priorityColor, task[id].assignedTo, task[id].subtasks, id);

  overlay.classList.add("active");
  background.style.display = "block";
}

function renderAssignees(assignees) {
  if (assignees && assignees.length > 0) {
    return assignees.map(person =>
      `<div class="task-overlay-assignee">
        ${createUserBadge(person)}
        ${person.name}
       </div>
       `
    ).join("");
  }
  return "";
}

function renderSubtasks(subtasks, id) {
  if (subtasks && subtasks.length > 0) {
    return subtasks.map((subtask, index) =>
      `<li class="subtask-list">
        <input class="subtaskCheckbox" 
          id="subtaskCheckbox-${index}" 
          type="checkbox" ${subtask.done ? "checked" : ""}
          onchange="toggleSubtaskCompletion('${id}', ${index})"> 
        <label for="subtaskCheckbox-${index}">${subtask.title}</label>
      </li>`
    ).join("");
  }
  return "";
}

async function toggleSubtaskCompletion(id, subtaskIndex) {
  const subtasks = task[id].subtasks || []; //aktuelle Subtasks holen
  subtasks[subtaskIndex].done = !subtasks[subtaskIndex].done; //Boolean umkehren
  await saveData("task/" + id, {
    ...task[id], //alle anderen Task-Daten beibehalten
    subtasks: subtasks //aktualisierte Subtasks speichern
  });
  openTaskOverlay(id, getPriorityColor(task[id].priority));
}

function openEditTaskOverlay(id) {
  const editOverlay = document.getElementById("edit_task_overlay");
  const taskOverlay = document.getElementById("task_overlay");
  const background = document.getElementById("big-card-background")

  editOverlay.classList.add("active");
  taskOverlay.style.display = "none";
  background.style.display = "block";

  editOverlay.innerHTML = "";
  editOverlay.innerHTML = generateEditTaskOverlay(task[id].title, task[id].description, task[id].dueDate, id);

  renderAssigneeOptions(task[id].assignedTo || []);
  renderEditSubtasks(task[id].subtasks || []);

  document
    .querySelector(`input[name="priority"][value="${task[id].priority}"]`)
    ?.setAttribute("checked", "true");
  initPriorityIconHandlers();
  renderEditAssignees(task[id].assignedTo || []);
}

async function saveChanges(id) {
  const title = document.getElementById("edit-title").value;
  const description = document.getElementById("edit-description").value;
  const dueDate = document.getElementById("edit-due-date").value;

  const priority = document.querySelector('input[name="priority"]:checked')?.value;

  const assignees = getSelectedAssignees();
  const subtasks = getEditedSubtasks();

  await saveData("task/" + id, {
    ...task[id],
    title: title,
    description: description,
    dueDate: dueDate,
    priority: priority,
    assignedTo: assignees,
    subtasks: subtasks
  });

  await fetchTasks();
  closeTaskOverlay();
}

function renderEditSubtasks(subtasks = []) {
  const list = document.getElementById("edit-subtask-list");
  if (!list) return;

  list.innerHTML = "";

  subtasks.forEach(subtask => {
    const li = document.createElement("li");
    li.className = "subtask-item";

    li.innerHTML = `
      <div class="subtask-item-content">
        <span class="subtask-bullet">•</span>
        <span class="subtask-title" contenteditable="false">${subtask.title}</span>
      </div>
      <div class="subtask-actions">
        <img src="../assets/icons/edit.svg" class="edit-subtask-btn" title="Edit">
        <img class="divider" src="../assets/icons/vector_3.svg" alt="Divider">
        <img src="../assets/icons/delete.svg" class="delete-subtask-btn" title="Delete">
      </div>
    `;

    list.appendChild(li);

    const editBtn = li.querySelector(".edit-subtask-btn");
    const deleteBtn = li.querySelector(".delete-subtask-btn");

    editBtn.addEventListener("click", () => enableSubtaskEdit(li));
    deleteBtn.addEventListener("click", () => li.remove());
  });
}

function addEditSubtask() {
  const input = document.getElementById("subtask");
  const text = input.value.trim();
  if (!text) return;

  const list = document.getElementById("edit-subtask-list");

  const li = document.createElement("li");
  li.className = "subtask-item";

  li.innerHTML = `
    <div class="subtask-item-content">
      <span class="subtask-bullet">•</span>
      <span class="subtask-title" contenteditable="false">${text}</span>
    </div>
    <div class="subtask-actions">
      <img src="../assets/icons/edit.svg" class="edit-subtask-btn" title="Edit">
      <img class="divider" src="../assets/icons/vector_3.svg" alt="Divider">
      <img src="../assets/icons/delete.svg" class="delete-subtask-btn" title="Delete">
    </div>
  `;

  list.appendChild(li);

  const editBtn = li.querySelector(".edit-subtask-btn");
  const deleteBtn = li.querySelector(".delete-subtask-btn");

  editBtn.addEventListener("click", () => enableSubtaskEdit(li));
  deleteBtn.addEventListener("click", () => li.remove());

  input.value = "";
}

function getEditedSubtasks() {
  const subtasks = [];

  document.querySelectorAll("#edit-subtask-list li").forEach(li => {
    const titleElement = li.querySelector(".subtask-title");
    const title = titleElement.textContent.trim();

    if (title !== "") {
      subtasks.push({
        title: title,
        done: false
      });
    }
  });

  return subtasks;
}

function renderEditAssignees(taskAssignees = []) {
  const assigneeDropdown = document.getElementById("assignee-dropdown");
  if (!assigneeDropdown) return;

  assigneeDropdown.innerHTML = "";

  contacts.forEach(contact => {
    const assigneeLabel = createAssigneeLabel(contact);
    const checkbox = assigneeLabel.querySelector("input");

    if (taskAssignees.includes(contact)) {
      checkbox.checked = true;
    }

    assigneeDropdown.appendChild(assigneeLabel);
  });

  updateAssigneeDisplay();
}

async function deleteTask(taskId) {
  await deleteData("task/" + taskId);
  closeTaskOverlay();
  await fetchTasks();
}

function closeTaskOverlay() {
  const taskOverlay = document.getElementById("task_overlay");
  const background = document.getElementById("big-card-background");
  const editOverlay = document.getElementById("edit_task_overlay");

  taskOverlay.classList.remove("active");
  taskOverlay.style.display = "none";  

  background.style.display = "none";
  editOverlay.innerHTML = "";
}

function clearBoard() {
  document.querySelectorAll('.task-list').forEach(list => {
    list.innerHTML = '';
  });
}

document.addEventListener("click", function (e) {

  // Delete
  if (e.target.classList.contains("delete-subtask-btn")) {
    const li = e.target.closest("li");
    if (li) li.remove();
  }

  // Edit
  if (e.target.classList.contains("edit-subtask-btn")) {
    const li = e.target.closest("li");
    if (!li) return;

    const title = li.querySelector(".subtask-title");

    const isEditing = title.getAttribute("contenteditable") === "true";

    if (isEditing) {
      title.setAttribute("contenteditable", "false");
      title.blur();
    } else {
      title.setAttribute("contenteditable", "true");
      title.focus();
    }
  }

});

function enableSubtaskEdit(li) {
  const titleSpan = li.querySelector(".subtask-title");
  const actionsDiv = li.querySelector(".subtask-actions");

  // Text editierbar machen
  titleSpan.setAttribute("contenteditable", "true");
  titleSpan.focus();

  // Icons wechseln: Edit -> Haken + Müllbecher
  actionsDiv.innerHTML = `
    <img src="../assets/icons/check.svg" class="save-subtask-btn" title="Save">
    <img class="divider" src="../assets/icons/vector_3.svg" alt="Divider">
    <img src="../assets/icons/delete.svg" class="delete-subtask-btn" title="Delete">
  `;

  const saveBtn = actionsDiv.querySelector(".save-subtask-btn");
  const deleteBtn = actionsDiv.querySelector(".delete-subtask-btn");

  saveBtn.addEventListener("click", () => {
    titleSpan.setAttribute("contenteditable", "false");
    // Icons zurücksetzen zu Edit + Delete
    actionsDiv.innerHTML = `
      <img src="../assets/icons/edit.svg" class="edit-subtask-btn" title="Edit">
      <img class="divider" src="../assets/icons/vector_3.svg" alt="Divider">
      <img src="../assets/icons/delete.svg" class="delete-subtask-btn" title="Delete">
    `;
    const newEditBtn = actionsDiv.querySelector(".edit-subtask-btn");
    const newDeleteBtn = actionsDiv.querySelector(".delete-subtask-btn");

    newEditBtn.addEventListener("click", () => enableSubtaskEdit(li));
    newDeleteBtn.addEventListener("click", () => li.remove());
  });

  deleteBtn.addEventListener("click", () => li.remove());
}

function saveSubtaskEdit(li) {
  const title = li.querySelector(".subtask-title");
  const actions = li.querySelector(".subtask-actions");

  title.setAttribute("contenteditable", "false");
  title.blur();

  actions.innerHTML = `
    <img src="../assets/icons/edit.svg" class="edit-subtask-btn" title="Edit">
    <img class="divider" src="../assets/icons/vector_3.svg" alt="Divider">
    <img src="../assets/icons/delete.svg" class="delete-subtask-btn" title="Delete">
  `;
}