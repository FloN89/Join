let addTaskOverlayEventsBound = false;

/**
 * Initialisiert die Board-Overlay-Events genau einmal.
 */
document.addEventListener("DOMContentLoaded", () => {
  bindBoardAddTaskOverlayEventsOnce();
});

/**
 * Öffnet das Add-Task-Overlay im Board.
 * Auf Mobile wird auf die normale Add-Task-Seite weitergeleitet.
 *
 * @async
 * @param {string} status - Die Board-Spalte, aus der geöffnet wurde
 */
async function openBoardAddTaskOverlay(status = "todo") {
  window.currentBoardAddTaskStatus = status;

  if (window.innerWidth <= 768) {
    const params = new URLSearchParams({
      from: "board",
      status,
    });

    window.location.href = `../html/add_task.html?${params.toString()}`;
    return;
  }

  const overlay = document.getElementById("add-task-overlay");
  const content = document.getElementById("add-task-content");

  if (!overlay || !content) {
    console.error("Add-task overlay container not found");
    return;
  }

  if (!content.innerHTML.trim()) {
    const response = await fetch("add_task_overlay.html", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to load add_task_overlay.html (${response.status})`);
    }

    content.innerHTML = await response.text();

    if (typeof initializeAddTaskOverlay === "function") {
      await initializeAddTaskOverlay();
    }
  }

  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
}
/**
 * Schließt das Board-Overlay.
 */
function closeBoardAddTaskOverlay() {
  const overlayElement = document.getElementById("add-task-overlay");
  if (!overlayElement) return;

  overlayElement.classList.remove("active");
  overlayElement.setAttribute("aria-hidden", "true");
  syncBoardOverlayScrollLock();
}

/**
 * Alias, damit alle bestehenden onclick-Aufrufe weiter funktionieren.
 */
function closeAddTaskOverlay() {
  closeBoardAddTaskOverlay();
}

/**
 * Bindet globale Events nur einmal.
 */
function bindBoardAddTaskOverlayEventsOnce() {
  if (addTaskOverlayEventsBound) return;

  bindTaskCreatedRefreshEvent();
  bindEscapeCloseEvent();

  addTaskOverlayEventsBound = true;
}

/**
 * Lädt das Board neu, sobald im Overlay eine Task erstellt wurde.
 */
function bindTaskCreatedRefreshEvent() {
  window.addEventListener("task-created", async () => {
    closeBoardAddTaskOverlay();

    if (typeof fetchTasks === "function") {
      await fetchTasks();
    }
  });
}

/**
 * Schließt das Overlay per ESC.
 */
function bindEscapeCloseEvent() {
  document.addEventListener("keydown", (keyboardEvent) => {
    if (keyboardEvent.key !== "Escape") return;

    const overlayElement = document.getElementById("add-task-overlay");
    if (!overlayElement || !overlayElement.classList.contains("active")) return;

    closeBoardAddTaskOverlay();
  });
}

/**
 * Builds database path based on user type (guest or regular)
 * @param {string} id - Task ID
 * @returns {string} Firebase database path
 */
function getTaskPath(id) {
  const isGuest = sessionStorage.getItem("userId") === "guest";
  return (isGuest ? "guest-tasks/" : "task/") + id;
}

/**
 * Synchronizes the body scroll lock with the active board overlays.*/
function syncBoardOverlayScrollLock() {
  const addTaskOverlayIsOpen = document.getElementById("add-task-overlay")?.classList.contains("active");
  const taskOverlayElement = document.getElementById("task_overlay");
  const editOverlayElement = document.getElementById("edit_task_overlay");

  const taskOverlayIsOpen =
    taskOverlayElement?.classList.contains("active") &&
    taskOverlayElement.style.display !== "none";

  const editOverlayIsOpen = editOverlayElement?.classList.contains("active");

  document.body.classList.toggle(
    "overlay-open",
    Boolean(addTaskOverlayIsOpen || taskOverlayIsOpen || editOverlayIsOpen)
  );
}

/*** Shows task overlay and background*/
function setTaskOverlayVisible() {
  document.getElementById("task_overlay").style.display = "flex";
  document.getElementById("big-card-background").style.display = "block";
  syncBoardOverlayScrollLock();
}

/**
 * Builds HTML for large task overlay
 * @param {Object} taskItem - Task data object
 * @param {string} id - Task ID
 * @param {string} priorityColor - Priority color
 * @returns {string} HTML for task overlay*/
function buildTaskOverlayHtml(taskItem, id, priorityColor) {
  return generateTaskOverlay(
    taskItem.category,
    taskItem.title,
    taskItem.description,
    taskItem.dueDate,
    taskItem.priority,
    priorityColor,
    taskItem.assignedTo,
    taskItem.subtasks,
    id
  );
}

/**
 * Opens task detail overlay
 * @param {string} id - Task ID
 * @param {string} priorityColor - Priority color*/
function openTaskOverlay(id, priorityColor) {
  const overlay = document.getElementById("task_overlay");
  const taskItem = task[id];
  if (!overlay || !taskItem) return;

  overlay.innerHTML = "";
  overlay.innerHTML = buildTaskOverlayHtml(taskItem, id, priorityColor);
  overlay.classList.add("active");
  setTaskOverlayVisible();
}

/**
 * Toggles done state of a subtask
 * @param {Array} subtasks - Array of subtasks
 * @param {number} index - Index of subtask to toggle
 * @returns {Array} Updated subtasks array*/
function toggleSubtaskValue(subtasks, index) {
  if (!Array.isArray(subtasks) || index < 0 || index >= subtasks.length) {
    return subtasks || [];
  }

  const currentValue = subtasks[index].done === true || subtasks[index].completed === true;
  subtasks[index].done = !currentValue;
  delete subtasks[index].completed;
  return subtasks;
}

/**
 * Updates the progress bar and counter on the small board card
 * @param {string} id - Task ID*/
function updateBoardCardProgress(id) {
  const card = document.querySelector(`.task-card[data-task-id="${id}"]`);
  if (!card || !task[id]) return;

  const subtasks = task[id].subtasks || [];
  const newHTML = createSubtasksHTML(subtasks);
  const existing = card.querySelector(".subtasks-container");

  if (existing) {
    existing.outerHTML = newHTML || "";
  } else if (newHTML) {
    const footer = card.querySelector(".task-footer");
    if (footer) footer.insertAdjacentHTML("beforebegin", newHTML);
  }
}

/**
 * Toggles subtask completion and saves to database
 * @async
 * @param {string} id - Task ID
 * @param {number} subtaskIndex - Index of subtask*/
async function toggleSubtaskCompletion(id, subtaskIndex) {
  if (!task[id]) return;

  const subtasks = toggleSubtaskValue(task[id].subtasks || [], subtaskIndex);
  const payload = { ...task[id], subtasks };

  await saveData(getTaskPath(id), payload);
  task[id] = payload;

  updateBoardCardProgress(id);
  openTaskOverlay(id, getPriorityColor(task[id].priority));
}

/**
 * Shows edit overlay and hides details overlay*/
function showEditOverlay() {
  const editOverlay = document.getElementById("edit_task_overlay");
  const taskOverlay = document.getElementById("task_overlay");
  const background = document.getElementById("big-card-background");

  if (!editOverlay || !taskOverlay || !background) return;

  editOverlay.classList.add("active");
  taskOverlay.style.display = "none";
  background.style.display = "block";
  syncBoardOverlayScrollLock();
}

/**
 * Renders edit overlay HTML content
 * @param {string} id - Task ID*/
function renderEditOverlayContent(id) {
  const editOverlay = document.getElementById("edit_task_overlay");
  const taskItem = task[id];
  if (!editOverlay || !taskItem) return;

  editOverlay.innerHTML = "";
  editOverlay.innerHTML = generateEditTaskOverlay(
    taskItem.title,
    taskItem.description,
    taskItem.dueDate,
    id
  );

  setMinimumEditDateToToday();
}

/*** Prevent selecting past dates in edit overlay*/
function setMinimumEditDateToToday() {
  const dateInputElement = getEditOverlayElement("#edit-due-date");
  if (!dateInputElement) return;
  dateInputElement.min = new Date().toISOString().split("T")[0];
}

/**
 * Initializes edit form fields with task data
 * @param {string} id - Task ID*/
async function initializeEditOverlayFields(id) {
  const taskItem = task[id];
  const editOverlay = getEditOverlayRoot();
  if (!taskItem || !editOverlay) return;

  await loadContacts();

  if (typeof renderEditAssignees === "function") {
    renderEditAssignees(taskItem.assignedTo || []);
  }

  renderEditSubtasks(taskItem.subtasks || []);

  const priorityInput = editOverlay.querySelector(
    `input[name="edit-priority"][value="${taskItem.priority}"]`
  );

  if (priorityInput) {
    priorityInput.checked = true;
  }

  initializeEditPriorityIconHandlers();
  bindEditSubtaskInputEvents();
}

/**
 * Opens edit task overlay
 * @param {string} id - Task ID*/
async function openEditTaskOverlay(id) {
  showEditOverlay();
  renderEditOverlayContent(id);
  await initializeEditOverlayFields(id);
}

/**
 * Gets current task from guest or regular tasks
 * @param {string} id - Task ID
 * @returns {Object|null} Task object*/
function getCurrentTask(id) {
  if (typeof guestTasks !== "undefined" && guestTasks && guestTasks[id]) {
    return guestTasks[id];
  }

  if (typeof task !== "undefined" && task && task[id]) {
    return task[id];
  }

  return null;
}

/**
 * Reads values from edit task form
 * @returns {Object} Form values object*/
function getEditFormValues() {
  const editOverlay = getEditOverlayRoot();

  return {
    title: getEditOverlayElement("#edit-title")?.value?.trim() || "",
    description: getEditOverlayElement("#edit-description")?.value?.trim() || "",
    dueDate: getEditOverlayElement("#edit-due-date")?.value || "",
    priority:
      editOverlay?.querySelector('input[name="edit-priority"]:checked')?.value || "medium",
    assignedTo:
      typeof getBoardEditSelectedAssignees === "function"
        ? getBoardEditSelectedAssignees()
        : [],
    subtasks: getEditedSubtasks(),
  };
}

/**
 * Saves task changes to database
 * @async
 * @param {string} id - Task ID*/
async function saveChanges(id) {
  const currentTask = getCurrentTask(id);
  if (!currentTask) return;

  const payload = { ...currentTask, ...getEditFormValues() };
  await saveData(getTaskPath(id), payload);
  await fetchTasks();
  closeTaskOverlay();
}

/**
 * Deletes task from database
 * @async
 * @param {string} taskId - Task ID*/
async function deleteTask(taskId) {
  await deleteData(getTaskPath(taskId));
  closeTaskOverlay();
  await fetchTasks();
}

/*** Closes task overlay and cleans up*/
function closeTaskOverlay() {
  const taskOverlay = document.getElementById("task_overlay");
  const background = document.getElementById("big-card-background");
  const editOverlay = document.getElementById("edit_task_overlay");

  if (taskOverlay) {
    taskOverlay.classList.remove("active");
    taskOverlay.style.display = "none";
    taskOverlay.innerHTML = "";
  }

  if (background) {
    background.style.display = "none";
  }

  if (editOverlay) {
    editOverlay.classList.remove("active");
    editOverlay.innerHTML = "";
  }

  syncBoardOverlayScrollLock();
}