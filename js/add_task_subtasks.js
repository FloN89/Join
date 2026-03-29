let subtaskCollection = [];
let editingSubtaskIndex = null;

/* =========================
   SUBTASKS
========================= */

/**
 * Register subtask events
 */
function registerSubtaskEvents() {
  registerSubtaskInputKeydown();
  registerSubtaskButtons();
}

/**
 * Register subtask input keydown
 */
function registerSubtaskInputKeydown() {
  const subtaskInputElement = document.getElementById("subtask");
  if (!subtaskInputElement) return;

  subtaskInputElement.addEventListener("keydown", (keyboardEvent) => {
    if (keyboardEvent.key !== "Enter") return;
    keyboardEvent.preventDefault();
    addSubtask();
  });
}

/**
 * Register subtask buttons
 */
function registerSubtaskButtons() {
  const clearButtonElement = document.getElementById("subtask-clear-button");
  const addButtonElement = document.getElementById("subtask-add-button");

  if (clearButtonElement) clearButtonElement.addEventListener("click", clearSubtaskInput);
  if (addButtonElement) addButtonElement.addEventListener("click", addSubtask);
}

/**
 * Clear subtask input
 */
function clearSubtaskInput() {
  const subtaskInputElement = document.getElementById("subtask");
  if (!subtaskInputElement) return;
  subtaskInputElement.value = "";
}

/**
 * Add subtask
 */
function addSubtask() {
  const subtaskTitle = readSubtaskTitleFromInput();
  if (!subtaskTitle) return;

  subtaskCollection.push(createSubtaskObject(subtaskTitle));
  renderSubtaskList();
  clearSubtaskInput();
}

/**
 * Read subtask title from input
 * @returns {string} Return value
 */
function readSubtaskTitleFromInput() {
  const subtaskInputElement = document.getElementById("subtask");
  if (!subtaskInputElement) return "";
  return getTrimmedValue(subtaskInputElement.value);
}

/**
 * Create subtask object
 * @param {string} subtaskTitle - Subtask title value
 * @returns {Object} Return value
 */
function createSubtaskObject(subtaskTitle) {
  return { title: subtaskTitle, completed: false };
}

/**
 * Get trimmed value
 * @param {string} textValue - Text value
 * @returns {string} Return value
 */
function getTrimmedValue(textValue) {
  if (typeof textValue !== "string") return "";
  return textValue.trim();
}

/**
 * Render subtask list
 */
function renderSubtaskList() {
  const subtaskListElement = document.getElementById("subtask-list");
  if (!subtaskListElement) return;

  subtaskListElement.innerHTML = buildSubtaskListMarkup();
  registerSubtaskListEvents(subtaskListElement);
  focusEditingSubtaskInput();
}

/**
 * Register subtask list events
 * @param {HTMLElement} subtaskListElement - DOM element
 */
function registerSubtaskListEvents(subtaskListElement) {
  subtaskListElement.onclick = (mouseEvent) => handleSubtaskListClick(mouseEvent);
  subtaskListElement.onkeydown = (keyboardEvent) => handleSubtaskListKeydown(keyboardEvent);
  subtaskListElement.onfocusout = (focusEvent) => handleSubtaskListFocusOut(focusEvent);
}

/**
 * Build subtask list markup
 * @returns {string} Return value
 */
function buildSubtaskListMarkup() {
  return subtaskCollection
    .map((subtaskObject, subtaskIndex) => buildSingleSubtaskMarkup(subtaskObject, subtaskIndex))
    .join("");
}

/**
 * Build single subtask markup
 * @param {Object} subtaskObject - Subtask object
 * @param {number} subtaskIndex - Subtask index
 * @returns {string} Return value
 */
function buildSingleSubtaskMarkup(subtaskObject, subtaskIndex) {
  if (editingSubtaskIndex === subtaskIndex) {
    return buildEditableSubtaskMarkup(subtaskObject, subtaskIndex);
  }

  return buildReadonlySubtaskMarkup(subtaskObject, subtaskIndex);
}

/**
 * Build readonly subtask markup
 * @param {Object} subtaskObject - Subtask object
 * @param {number} subtaskIndex - Subtask index
 * @returns {string} Return value
 */
function buildReadonlySubtaskMarkup(subtaskObject, subtaskIndex) {
  const safeTitle = escapeHtmlText(subtaskObject.title);

  return `
    <li class="subtask-item" data-subtask-index="${subtaskIndex}">
      <div class="subtask-left">
        <span class="subtask-bullet">•</span>
        <span class="subtask-title">${safeTitle}</span>
      </div>

      <div class="subtask-actions">
        <button type="button" data-action="edit" aria-label="Edit subtask">
          <img src="../assets/icons/edit.svg" alt="Edit">
        </button>

        <button type="button" data-action="delete" aria-label="Delete subtask">
          <img src="../assets/icons/delete.svg" alt="Delete">
        </button>
      </div>
    </li>
  `;
}

/**
 * Build editable subtask markup
 * @param {Object} subtaskObject - Subtask object
 * @param {number} subtaskIndex - Subtask index
 * @returns {string} Return value
 */
function buildEditableSubtaskMarkup(subtaskObject, subtaskIndex) {
  const safeTitle = escapeHtmlText(subtaskObject.title);

  return `
    <li class="subtask-item is-editing" data-subtask-index="${subtaskIndex}">
      <div class="subtask-left">
        <span class="subtask-bullet">•</span>
        <input
          type="text"
          class="subtask-title-input"
          value="${safeTitle}"
          data-role="subtask-edit-input"
          aria-label="Edit subtask title"
        >
      </div>

      <div class="subtask-actions">
        <button type="button" data-action="delete" aria-label="delete subtask">
          <img src="../assets/icons/delete.svg" alt="delete">
        </button>

        <button type="button" data-action="save" aria-label="save subtask">
          <img src="../assets/icons/check.svg" alt="save">
        </button>
      </div>
    </li>
  `;
}

/**
 * Escape html text
 * @param {string} unsafeText - Unsafe text value
 * @returns {string} Return value
 */
function escapeHtmlText(unsafeText) {
  return String(unsafeText)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Handle subtask list click
 * @param {Event} mouseEvent - Event object
 */
function handleSubtaskListClick(mouseEvent) {
  const actionName = readSubtaskAction(mouseEvent);
  if (!actionName) return;

  const subtaskIndex = readSubtaskIndex(mouseEvent);
  if (!isValidSubtaskIndex(subtaskIndex)) return;

  const listItemElement = mouseEvent.target.closest("li[data-subtask-index]");
  runSubtaskAction(actionName, subtaskIndex, listItemElement);
}

/**
 * Handle subtask list keydown
 * @param {KeyboardEvent} keyboardEvent - Event object
 */
function handleSubtaskListKeydown(keyboardEvent) {
  const inputElement = keyboardEvent.target.closest(".subtask-title-input");
  if (!inputElement) return;

  const listItemElement = inputElement.closest("li[data-subtask-index]");
  if (!listItemElement) return;

  const subtaskIndex = Number(listItemElement.dataset.subtaskIndex);
  if (!isValidSubtaskIndex(subtaskIndex)) return;

  if (keyboardEvent.key === "Enter") {
    keyboardEvent.preventDefault();
    saveSubtaskEdit(subtaskIndex, inputElement.value);
  }

  if (keyboardEvent.key === "Escape") {
    keyboardEvent.preventDefault();
    cancelSubtaskEdit();
  }
}

/**
 * Handle subtask list focus out
 * @param {FocusEvent} focusEvent - Event object
 */
function handleSubtaskListFocusOut(focusEvent) {
  const inputElement = focusEvent.target.closest(".subtask-title-input");
  if (!inputElement) return;

  const listItemElement = inputElement.closest("li[data-subtask-index]");
  if (!listItemElement) return;

  const nextFocusedElement = focusEvent.relatedTarget;
  if (nextFocusedElement && listItemElement.contains(nextFocusedElement)) return;

  const subtaskIndex = Number(listItemElement.dataset.subtaskIndex);
  if (!isValidSubtaskIndex(subtaskIndex)) return;

  saveSubtaskEdit(subtaskIndex, inputElement.value);
}

/**
 * Read subtask action
 * @param {Event} mouseEvent - Event object
 * @returns {string} Return value
 */
function readSubtaskAction(mouseEvent) {
  const actionButtonElement = mouseEvent.target.closest("button[data-action]");
  if (!actionButtonElement) return "";
  return actionButtonElement.dataset.action || "";
}

/**
 * Read subtask index
 * @param {Event} mouseEvent - Event object
 * @returns {number} Return value
 */
function readSubtaskIndex(mouseEvent) {
  const listItemElement = mouseEvent.target.closest("li[data-subtask-index]");
  if (!listItemElement) return -1;
  return Number(listItemElement.dataset.subtaskIndex);
}

/**
 * Run subtask action
 * @param {string} actionName - Action name value
 * @param {number} subtaskIndex - Subtask index value
 * @param {HTMLElement} listItemElement - List item DOM element
 */
function runSubtaskAction(actionName, subtaskIndex, listItemElement) {
  if (actionName === "delete") deleteSubtask(subtaskIndex);
  if (actionName === "edit") editSubtask(subtaskIndex);
  if (actionName === "save") saveSubtaskEdit(subtaskIndex, readEditedSubtaskValue(listItemElement));
  if (actionName === "cancel") cancelSubtaskEdit();
}

/**
 * Read edited subtask value
 * @param {HTMLElement} listItemElement - DOM element
 * @returns {string} Return value
 */
function readEditedSubtaskValue(listItemElement) {
  const inputElement = listItemElement?.querySelector(".subtask-title-input");
  if (!inputElement) return "";
  return inputElement.value;
}

/**
 * Delete subtask
 * @param {number} subtaskIndex - Subtask index value
 */
function deleteSubtask(subtaskIndex) {
  if (!isValidSubtaskIndex(subtaskIndex)) return;

  subtaskCollection.splice(subtaskIndex, 1);

  if (editingSubtaskIndex === subtaskIndex) editingSubtaskIndex = null;
  if (editingSubtaskIndex !== null && subtaskIndex < editingSubtaskIndex) editingSubtaskIndex -= 1;

  renderSubtaskList();
}

/**
 * Edit subtask inline
 * @param {number} subtaskIndex - Subtask index value
 */
function editSubtask(subtaskIndex) {
  if (!isValidSubtaskIndex(subtaskIndex)) return;
  editingSubtaskIndex = subtaskIndex;
  renderSubtaskList();
}

/**
 * Save edited subtask title
 * @param {number} subtaskIndex - Subtask index value
 * @param {string} newTitle - New title value
 */
function saveSubtaskEdit(subtaskIndex, newTitle) {
  if (!isValidSubtaskIndex(subtaskIndex)) return;

  const cleanedTitle = getTrimmedValue(newTitle ?? "");
  if (!cleanedTitle) {
    cancelSubtaskEdit();
    return;
  }

  subtaskCollection[subtaskIndex].title = cleanedTitle;
  editingSubtaskIndex = null;
  renderSubtaskList();
}

/**
 * Cancel subtask edit
 */
function cancelSubtaskEdit() {
  editingSubtaskIndex = null;
  renderSubtaskList();
}

/**
 * Focus active subtask input
 */
function focusEditingSubtaskInput() {
  if (editingSubtaskIndex === null) return;

  const inputElement = document.querySelector(
    `#subtask-list li[data-subtask-index="${editingSubtaskIndex}"] .subtask-title-input`
  );

  if (!inputElement) return;

  requestAnimationFrame(() => {
    inputElement.focus();
    inputElement.select();
  });
}

/**
 * Is valid subtask index
 * @param {number} subtaskIndex - Subtask index value
 * @returns {boolean} Return value
 */
function isValidSubtaskIndex(subtaskIndex) {
  return Number.isInteger(subtaskIndex) && subtaskIndex >= 0 && subtaskIndex < subtaskCollection.length;
}

/**
 * Reset subtasks
 */
function resetSubtasks() {
  subtaskCollection = [];
  editingSubtaskIndex = null;
  renderSubtaskList();
}

/* =========================
   PRIORITY ICONS
========================= */

/**
 * Initialize priority icon handlers
 */
function initializePriorityIconHandlers() {
  const radioNodeList = document.querySelectorAll('input[name="priority"]');
  radioNodeList.forEach((radioElement) => {
    radioElement.addEventListener("change", updatePriorityIcons);
  });
  updatePriorityIcons();
}

/**
 * Update priority icons
 */
function updatePriorityIcons() {
  const urgentRadio = document.getElementById("priority-urgent");
  const mediumRadio = document.getElementById("priority-medium");
  const lowRadio = document.getElementById("priority-low");

  applyPriorityIcon("icon-urgent", urgentRadio, "urgent_white", "urgent_red");
  applyPriorityIcon("icon-medium", mediumRadio, "medium_white", "medium_yellow");
  applyPriorityIcon("icon-low", lowRadio, "low_white", "low_green");
}

/**
 * Apply priority icon
 * @param {string} iconId - ID value
 * @param {HTMLElement} radioElement - DOM element
 * @param {string} checkedName - Checked name value
 * @param {string} uncheckedName - Unchecked name value
 */
function applyPriorityIcon(iconId, radioElement, checkedName, uncheckedName) {
  const iconElement = document.getElementById(iconId);
  if (!iconElement || !radioElement) return;

  iconElement.src = radioElement.checked
    ? `../assets/icons/${checkedName}.svg`
    : `../assets/icons/${uncheckedName}.svg`;
}

// Form-Reset, Data-Collection und Success-Toast wurden nach add_task_form.js ausgelagert