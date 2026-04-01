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