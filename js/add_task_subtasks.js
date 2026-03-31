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
 * Handle subtask list click
 * @param {Event} mouseEvent - Event object
 */
function handleSubtaskListClick(mouseEvent) {
  const actionButtonElement = mouseEvent.target.closest("button[data-action]");
  if (!actionButtonElement) return;

  mouseEvent.preventDefault();

  const actionName = actionButtonElement.dataset.action || "";
  const listItemElement = actionButtonElement.closest("li[data-subtask-index]");
  if (!listItemElement) return;

  const subtaskIndex = Number(listItemElement.dataset.subtaskIndex);
  if (!isValidSubtaskIndex(subtaskIndex)) return;

  if (actionName === "save") {
    saveSubtaskEdit(subtaskIndex, readEditedSubtaskValue(listItemElement));
    return;
  }

  if (actionName === "delete") {
    deleteSubtask(subtaskIndex);
    return;
  }

  if (actionName === "edit") {
    editSubtask(subtaskIndex);
    return;
  }

  if (actionName === "cancel") {
    cancelSubtaskEdit();
  }
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

  if (nextFocusedElement?.closest('button[data-action="save"]')) {
    return;
  }

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
  editingSubtaskIndex = null;

  if (!cleanedTitle) {
    renderSubtaskList();
    return;
  }

  subtaskCollection[subtaskIndex].title = cleanedTitle;
  renderSubtaskList();
}
/**
 * Cancel subtask edit
 */
function cancelSubtaskEdit() {
  editingSubtaskIndex = null;
  renderSubtaskList();
}

/*** Focus active subtask input*/
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

/*** Reset subtask*/
function resetSubtasks() {
  subtaskCollection = [];
  editingSubtaskIndex = null;
  renderSubtaskList();
}