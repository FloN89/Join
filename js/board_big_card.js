/**
 * Renders assignees as HTML for task overlay
 * @param {Array} assignees - Array of assignee objects
 * @returns {string} HTML string for assignees
 */
function renderAssignees(assignees) {
  if (!assignees || assignees.length === 0) return "";
  return assignees.map((person) => generateTaskOverlayAssignee(person)).join("");
}

/**
 * Gets template markup from DOM by template ID
 * @param {string} templateId - ID of template element
 * @returns {string} Template HTML content
 */
function getTemplateMarkup(templateId) {
  const template = document.getElementById(templateId);
  return template ? template.innerHTML.trim() : "";
}

/**
 * Renders subtasks as HTML for task overlay
 * @param {Array} subtasks - Array of subtasks
 * @param {string} id - Task ID
 * @returns {string} HTML string for subtasks
 */
function renderSubtasks(subtasks, id) {
  if (!subtasks || subtasks.length === 0) return "";
  return subtasks
    .map((subtask, index) => generateTaskOverlaySubtask(subtask, index, id))
    .join("");
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
 * Returns the edit overlay root element.
 * @returns {HTMLElement|null}
 */
function getEditOverlayRoot() {
  return document.getElementById("edit_task_overlay");
}

/**
 * Finds one element inside the edit overlay.
 * @param {string} selector
 * @returns {HTMLElement|null}
 */
function getEditOverlayElement(selector) {
  const root = getEditOverlayRoot();
  return root ? root.querySelector(selector) : null;
}

/**
 * Finds all matching elements inside the edit overlay.
 * @param {string} selector
 * @returns {Array<HTMLElement>}
 */
function getEditOverlayElements(selector) {
  const root = getEditOverlayRoot();
  if (!root) return [];
  return Array.from(root.querySelectorAll(selector));
}

/**
 * Shows task overlay and background
 */
function setTaskOverlayVisible() {
  document.getElementById("task_overlay").style.display = "flex";
  document.getElementById("big-card-background").style.display = "block";
}

/**
 * Builds HTML for large task overlay
 * @param {Object} taskItem - Task data object
 * @param {string} id - Task ID
 * @param {string} priorityColor - Priority color
 * @returns {string} HTML for task overlay
 */
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
 * @param {string} priorityColor - Priority color
 */
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
 * @returns {Array} Updated subtasks array
 */
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
 * @param {string} id - Task ID
 */
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
 * @param {number} subtaskIndex - Index of subtask
 */
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
 * Shows edit overlay and hides details overlay
 */
function showEditOverlay() {
  const editOverlay = document.getElementById("edit_task_overlay");
  const taskOverlay = document.getElementById("task_overlay");
  const background = document.getElementById("big-card-background");

  if (!editOverlay || !taskOverlay || !background) return;

  editOverlay.classList.add("active");
  taskOverlay.style.display = "none";
  background.style.display = "block";
}

/**
 * Renders edit overlay HTML content
 * @param {string} id - Task ID
 */
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

/**
 * Prevent selecting past dates in edit overlay
 */
function setMinimumEditDateToToday() {
  const dateInputElement = getEditOverlayElement("#edit-due-date");
  if (!dateInputElement) return;
  dateInputElement.min = new Date().toISOString().split("T")[0];
}

/**
 * Initializes edit form fields with task data
 * @param {string} id - Task ID
 */
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
 * @param {string} id - Task ID
 */
async function openEditTaskOverlay(id) {
  showEditOverlay();
  renderEditOverlayContent(id);
  await initializeEditOverlayFields(id);
}

/**
 * Initializes priority icon handling for edit overlay.
 */
function initializeEditPriorityIconHandlers() {
  const root = getEditOverlayRoot();
  if (!root) return;

  root.querySelectorAll('input[name="edit-priority"]').forEach((radioElement) => {
    radioElement.addEventListener("change", updateEditPriorityIcons);
  });

  updateEditPriorityIcons();
}

/**
 * Updates all priority icons inside the edit overlay.
 */
function updateEditPriorityIcons() {
  applyEditPriorityIcon(
    "edit-icon-urgent",
    "edit-priority-urgent",
    "urgent_white",
    "urgent_red"
  );
  applyEditPriorityIcon(
    "edit-icon-medium",
    "edit-priority-medium",
    "medium_white",
    "medium_yellow"
  );
  applyEditPriorityIcon(
    "edit-icon-low",
    "edit-priority-low",
    "low_white",
    "low_green"
  );
}

/**
 * Applies one edit priority icon state.
 * @param {string} iconId
 * @param {string} radioId
 * @param {string} checkedName
 * @param {string} uncheckedName
 */
function applyEditPriorityIcon(iconId, radioId, checkedName, uncheckedName) {
  const iconElement = getEditOverlayElement(`#${iconId}`);
  const radioElement = getEditOverlayElement(`#${radioId}`);

  if (!iconElement || !radioElement) return;

  iconElement.src = radioElement.checked
    ? `../assets/icons/${checkedName}.svg`
    : `../assets/icons/${uncheckedName}.svg`;
}

/**
 * Registers edit overlay subtask input events.
 */
function bindEditSubtaskInputEvents() {
  const inputElement = getEditOverlayElement("#edit-subtask");
  const clearButtonElement = getEditOverlayElement("#edit-subtask-clear-button");
  const addButtonElement = getEditOverlayElement("#edit-subtask-add-button");

  if (inputElement) {
    inputElement.addEventListener("keydown", handleEditSubtaskKeydown);
  }

  if (clearButtonElement) {
    clearButtonElement.addEventListener("click", clearEditSubtaskInput);
  }

  if (addButtonElement) {
    addButtonElement.addEventListener("click", addEditSubtask);
  }
}

/**
 * Handles Enter key inside edit subtask input.
 * @param {KeyboardEvent} keyboardEvent
 */
function handleEditSubtaskKeydown(keyboardEvent) {
  if (keyboardEvent.key !== "Enter") return;
  keyboardEvent.preventDefault();
  addEditSubtask();
}

/**
 * Clears the edit subtask input.
 */
function clearEditSubtaskInput() {
  const inputElement = getEditOverlayElement("#edit-subtask");
  if (!inputElement) return;
  inputElement.value = "";
}

/**
 * Gets current task from guest or regular tasks
 * @param {string} id - Task ID
 * @returns {Object|null} Task object
 */
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
 * @returns {Object} Form values object
 */
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
 * @param {string} id - Task ID
 */
async function saveChanges(id) {
  const currentTask = getCurrentTask(id);
  if (!currentTask) return;

  const payload = { ...currentTask, ...getEditFormValues() };
  await saveData(getTaskPath(id), payload);
  await fetchTasks();
  closeTaskOverlay();
}

/**
 * Creates editable subtask list item element
 * @param {string} title - Subtask title
 * @returns {HTMLElement} List item element
 */
function createEditableSubtaskItem(title) {
  const li = document.createElement("li");
  li.className = "subtask-item";
  li.innerHTML =
    generateEditSubtaskItem(title) +
    getTemplateMarkup("subtask-actions-default-template");
  return li;
}

/**
 * Binds edit and delete event listeners to subtask row
 * @param {HTMLElement} li - List item element
 */
function bindSubtaskRowEvents(li) {
  const editBtn = li.querySelector(".edit-subtask-btn");
  const deleteBtn = li.querySelector(".delete-subtask-btn");

  if (editBtn) {
    editBtn.addEventListener("click", () => enableSubtaskEdit(li));
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => li.remove());
  }
}

/**
 * Appends new subtask row to list
 * @param {HTMLElement} list - Subtask list element
 * @param {string} title - Subtask title
 */
function appendSubtaskRow(list, title) {
  const li = createEditableSubtaskItem(title);
  list.appendChild(li);
  bindSubtaskRowEvents(li);
}

/**
 * Renders editable subtasks in edit overlay
 * @param {Array} subtasks - Array of subtask objects
 */
function renderEditSubtasks(subtasks = []) {
  const list = getEditOverlayElement("#edit-subtask-list");
  if (!list) return;

  list.innerHTML = "";
  subtasks.forEach((subtask) => appendSubtaskRow(list, subtask.title));
}

/**
 * Adds new editable subtask from input field
 */
function addEditSubtask() {
  const inputElement = getEditOverlayElement("#edit-subtask");
  const listElement = getEditOverlayElement("#edit-subtask-list");

  if (!inputElement || !listElement) return;

  const textValue = inputElement.value.trim();
  if (!textValue) return;

  appendSubtaskRow(listElement, textValue);
  inputElement.value = "";
}

/**
 * Converts subtask row element to data object
 * @param {HTMLElement} li - List item element
 * @returns {Object|null} Subtask object or null
 */
function getSubtaskFromRow(li) {
  const titleElement = li.querySelector(".subtask-title");
  const title = titleElement ? titleElement.textContent.trim() : "";
  return title !== "" ? { title, done: false } : null;
}

/**
 * Gets all edited subtasks from edit form
 * @returns {Array} Array of subtask objects
 */
function getEditedSubtasks() {
  const subtasks = [];
  const rows = getEditOverlayElements("#edit-subtask-list li");

  rows.forEach((li) => {
    const subtask = getSubtaskFromRow(li);
    if (subtask) subtasks.push(subtask);
  });

  return subtasks;
}

/**
 * Deletes task from database
 * @async
 * @param {string} taskId - Task ID
 */
async function deleteTask(taskId) {
  await deleteData(getTaskPath(taskId));
  closeTaskOverlay();
  await fetchTasks();
}

/**
 * Closes task overlay and cleans up
 */
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
}

/**
 * Replaces subtask action buttons with template
 * @param {HTMLElement} li - List item element
 * @param {string} templateId - Template ID
 * @returns {HTMLElement|null} New actions div element
 */
function setSubtaskActions(li, templateId) {
  const actionsDiv = li.querySelector(".subtask-actions");
  if (!actionsDiv) return null;

  actionsDiv.outerHTML = getTemplateMarkup(templateId);
  return li.querySelector(".subtask-actions");
}

/**
 * Binds save and delete event listeners for subtask
 * @param {HTMLElement} li - List item element
 * @param {HTMLElement} titleSpan - Title span element
 * @param {HTMLElement} actionsDiv - Actions div element
 */
function bindSaveAndDeleteActions(li, titleSpan, actionsDiv) {
  if (!actionsDiv) return;

  const saveBtn = actionsDiv.querySelector(".save-subtask-btn");
  const deleteBtn = actionsDiv.querySelector(".delete-subtask-btn");

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      titleSpan.setAttribute("contenteditable", "false");
      titleSpan.blur();

      const nextActions = setSubtaskActions(li, "subtask-actions-default-template");
      if (!nextActions) return;

      const nextEditBtn = nextActions.querySelector(".edit-subtask-btn");
      const nextDeleteBtn = nextActions.querySelector(".delete-subtask-btn");

      if (nextEditBtn) {
        nextEditBtn.addEventListener("click", () => enableSubtaskEdit(li));
      }

      if (nextDeleteBtn) {
        nextDeleteBtn.addEventListener("click", () => li.remove());
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => li.remove());
  }
}

/**
 * Enables edit mode for subtask
 * @param {HTMLElement} li - List item element
 */
function enableSubtaskEdit(li) {
  const titleSpan = li.querySelector(".subtask-title");
  if (!titleSpan) return;

  titleSpan.setAttribute("contenteditable", "true");
  titleSpan.focus();

  const actionsDiv = setSubtaskActions(li, "subtask-actions-editable-template");
  bindSaveAndDeleteActions(li, titleSpan, actionsDiv);
}