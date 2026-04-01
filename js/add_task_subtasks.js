let subtaskCollection = [];
let editingSubtaskIndex = null;

/**
 * Registers all subtask events.
 */
function registerSubtaskEvents() {
  registerSubtaskInputKeydown();
  registerSubtaskButtons();
}

/**
 * Registers the enter key for the subtask input.
 */
function registerSubtaskInputKeydown() {
  const subtaskInputElement = getElement("subtask");
  if (!subtaskInputElement) return;
  subtaskInputElement.addEventListener("keydown", handleSubtaskInputKeydown);
}

/**
 * Handles the subtask input keydown.
 * @param {KeyboardEvent} keyboardEvent - Keyboard event.
 */
function handleSubtaskInputKeydown(keyboardEvent) {
  if (keyboardEvent.key !== "Enter") return;
  keyboardEvent.preventDefault();
  addSubtask();
}

/**
 * Registers subtask buttons.
 */
function registerSubtaskButtons() {
  bindClick("subtask-clear-button", clearSubtaskInput);
  bindClick("subtask-add-button", addSubtask);
}

/**
 * Clears the subtask input field.
 */
function clearSubtaskInput() {
  const subtaskInputElement = getElement("subtask");
  if (!subtaskInputElement) return;
  subtaskInputElement.value = "";
}

/**
 * Adds one new subtask.
 */
function addSubtask() {
  const subtaskTitle = readSubtaskTitleFromInput();
  if (!subtaskTitle) return;
  subtaskCollection.push(createSubtaskObject(subtaskTitle));
  renderSubtaskList();
  clearSubtaskInput();
}

/**
 * Reads the trimmed subtask title.
 * @returns {string} Subtask title.
 */
function readSubtaskTitleFromInput() {
  const subtaskInputElement = getElement("subtask");
  if (!subtaskInputElement) return "";
  return getTrimmedValue(subtaskInputElement.value);
}

/**
 * Builds one subtask object.
 * @param {string} subtaskTitle - Subtask title.
 * @returns {Object} Subtask object.
 */
function createSubtaskObject(subtaskTitle) {
  return { title: subtaskTitle, completed: false };
}

/**
 * Renders the subtask list.
 */
function renderSubtaskList() {
  const subtaskListElement = getElement("subtask-list");
  if (!subtaskListElement) return;
  subtaskListElement.innerHTML = buildSubtaskListMarkup();
  registerSubtaskListEvents(subtaskListElement);
  focusEditingSubtaskInput();
}

/**
 * Registers delegated subtask list events.
 * @param {HTMLElement} subtaskListElement - List element.
 */
function registerSubtaskListEvents(subtaskListElement) {
  subtaskListElement.onclick = handleSubtaskListClick;
  subtaskListElement.onkeydown = handleSubtaskListKeydown;
  subtaskListElement.onfocusout = handleSubtaskListFocusOut;
}

/**
 * Builds the complete subtask markup.
 * @returns {string} List markup.
 */
function buildSubtaskListMarkup() {
  return subtaskCollection.map((subtaskObject, subtaskIndex) => buildSingleSubtaskMarkup(subtaskObject, subtaskIndex)).join("");
}

/**
 * Builds one subtask item.
 * @param {Object} subtaskObject - Subtask object.
 * @param {number} subtaskIndex - Subtask index.
 * @returns {string} Item markup.
 */
function buildSingleSubtaskMarkup(subtaskObject, subtaskIndex) {
  if (editingSubtaskIndex === subtaskIndex) return buildEditableSubtaskMarkup(subtaskObject, subtaskIndex);
  return buildReadonlySubtaskMarkup(subtaskObject, subtaskIndex);
}

/**
 * Builds the readonly subtask layout.
 * @param {Object} subtaskObject - Subtask object.
 * @param {number} subtaskIndex - Subtask index.
 * @returns {string} Item markup.
 */
function buildReadonlySubtaskMarkup(subtaskObject, subtaskIndex) {
  const safeTitle = escapeHtmlText(subtaskObject.title);
  return `
    <li class="subtask-item" data-subtask-index="${subtaskIndex}">
      <div class="subtask-left">${buildReadonlySubtaskContent(safeTitle)}</div>
      <div class="subtask-actions">${buildReadonlySubtaskActions()}</div>
    </li>
  `;
}

/**
 * Builds the readonly subtask content.
 * @param {string} safeTitle - Safe title.
 * @returns {string} Content markup.
 */
function buildReadonlySubtaskContent(safeTitle) {
  return `<span class="subtask-bullet">•</span><span class="subtask-title">${safeTitle}</span>`;
}

/**
 * Builds readonly action buttons.
 * @returns {string} Action markup.
 */
function buildReadonlySubtaskActions() {
  return createSubtaskButtonMarkup("edit", "Edit subtask", "edit") + createSubtaskButtonMarkup("delete", "Delete subtask", "delete");
}

/**
 * Builds the editable subtask layout.
 * @param {Object} subtaskObject - Subtask object.
 * @param {number} subtaskIndex - Subtask index.
 * @returns {string} Item markup.
 */
function buildEditableSubtaskMarkup(subtaskObject, subtaskIndex) {
  const safeTitle = escapeHtmlText(subtaskObject.title);
  return `
    <li class="subtask-item is-editing" data-subtask-index="${subtaskIndex}">
      <div class="subtask-left">${buildEditableSubtaskContent(safeTitle)}</div>
      <div class="subtask-actions">${buildEditableSubtaskActions()}</div>
    </li>
  `;
}

/**
 * Builds the editable subtask content.
 * @param {string} safeTitle - Safe title.
 * @returns {string} Content markup.
 */
function buildEditableSubtaskContent(safeTitle) {
  return `
    <span class="subtask-bullet">•</span>
    <input type="text" class="subtask-title-input" value="${safeTitle}" data-role="subtask-edit-input" aria-label="Edit subtask title">
  `;
}

/**
 * Builds editable action buttons.
 * @returns {string} Action markup.
 */
function buildEditableSubtaskActions() {
  return createSubtaskButtonMarkup("delete", "Delete subtask", "delete") + createSubtaskButtonMarkup("save", "Save subtask", "check");
}

/**
 * Builds one subtask action button.
 * @param {string} actionName - Data action value.
 * @param {string} labelText - Accessible label.
 * @param {string} iconName - Icon filename.
 * @returns {string} Button markup.
 */
function createSubtaskButtonMarkup(actionName, labelText, iconName) {
  return `<button type="button" data-action="${actionName}" aria-label="${labelText}"><img src="../assets/icons/${iconName}.svg" alt="${labelText}"></button>`;
}

/**
 * Handles clicks inside the subtask list.
 * @param {MouseEvent} mouseEvent - Click event.
 */
function handleSubtaskListClick(mouseEvent) {
  const actionButtonElement = mouseEvent.target.closest("button[data-action]");
  if (!actionButtonElement) return;
  mouseEvent.preventDefault();
  runSubtaskAction(readActionName(actionButtonElement), readSubtaskIndexFromButton(actionButtonElement), actionButtonElement.closest("li[data-subtask-index]"));
}

/**
 * Reads one action name from a button.
 * @param {HTMLElement} actionButtonElement - Action button.
 * @returns {string} Action name.
 */
function readActionName(actionButtonElement) {
  return actionButtonElement?.dataset.action || "";
}

/**
 * Reads the subtask index from a button.
 * @param {HTMLElement} actionButtonElement - Action button.
 * @returns {number} Subtask index.
 */
function readSubtaskIndexFromButton(actionButtonElement) {
  const listItemElement = actionButtonElement.closest("li[data-subtask-index]");
  return Number(listItemElement?.dataset.subtaskIndex);
}

/**
 * Runs one delegated subtask action.
 * @param {string} actionName - Action name.
 * @param {number} subtaskIndex - Subtask index.
 * @param {HTMLElement|null} listItemElement - Item element.
 */
function runSubtaskAction(actionName, subtaskIndex, listItemElement) {
  if (!isValidSubtaskIndex(subtaskIndex)) return;
  if (actionName === "delete") deleteSubtask(subtaskIndex);
  if (actionName === "edit") editSubtask(subtaskIndex);
  if (actionName === "save") saveSubtaskEdit(subtaskIndex, readEditedSubtaskValue(listItemElement));
  if (actionName === "cancel") cancelSubtaskEdit();
}

/**
 * Handles key actions inside the subtask list.
 * @param {KeyboardEvent} keyboardEvent - Keyboard event.
 */
function handleSubtaskListKeydown(keyboardEvent) {
  const inputElement = keyboardEvent.target.closest(".subtask-title-input");
  if (!inputElement) return;
  if (keyboardEvent.key === "Enter") return saveSubtaskFromKeyboard(keyboardEvent, inputElement);
  if (keyboardEvent.key === "Escape") return cancelSubtaskFromKeyboard(keyboardEvent);
}

/**
 * Saves the current subtask from the keyboard.
 * @param {KeyboardEvent} keyboardEvent - Keyboard event.
 * @param {HTMLElement} inputElement - Input element.
 */
function saveSubtaskFromKeyboard(keyboardEvent, inputElement) {
  keyboardEvent.preventDefault();
  saveSubtaskEdit(readSubtaskIndexFromInput(inputElement), inputElement.value);
}

/**
 * Cancels the current subtask from the keyboard.
 * @param {KeyboardEvent} keyboardEvent - Keyboard event.
 */
function cancelSubtaskFromKeyboard(keyboardEvent) {
  keyboardEvent.preventDefault();
  cancelSubtaskEdit();
}

/**
 * Reads the subtask index from an input.
 * @param {HTMLElement} inputElement - Input element.
 * @returns {number} Subtask index.
 */
function readSubtaskIndexFromInput(inputElement) {
  const listItemElement = inputElement.closest("li[data-subtask-index]");
  return Number(listItemElement?.dataset.subtaskIndex);
}

/**
 * Handles subtask edit focus changes.
 * @param {FocusEvent} focusEvent - Focus event.
 */
function handleSubtaskListFocusOut(focusEvent) {
  const inputElement = focusEvent.target.closest(".subtask-title-input");
  if (!inputElement) return;
  if (shouldIgnoreSubtaskFocusOut(focusEvent, inputElement)) return;
  saveSubtaskEdit(readSubtaskIndexFromInput(inputElement), inputElement.value);
}

/**
 * Checks whether the focus out event should be ignored.
 * @param {FocusEvent} focusEvent - Focus event.
 * @param {HTMLElement} inputElement - Current input.
 * @returns {boolean} True when ignored.
 */
function shouldIgnoreSubtaskFocusOut(focusEvent, inputElement) {
  const nextFocusedElement = focusEvent.relatedTarget;
  const listItemElement = inputElement.closest("li[data-subtask-index]");
  if (nextFocusedElement?.closest('button[data-action="save"]')) return true;
  return Boolean(nextFocusedElement && listItemElement?.contains(nextFocusedElement));
}

/**
 * Reads the edited subtask value.
 * @param {HTMLElement|null} listItemElement - List item.
 * @returns {string} Input value.
 */
function readEditedSubtaskValue(listItemElement) {
  const inputElement = listItemElement?.querySelector(".subtask-title-input");
  if (!inputElement) return "";
  return inputElement.value;
}

/**
 * Deletes one subtask.
 * @param {number} subtaskIndex - Subtask index.
 */
function deleteSubtask(subtaskIndex) {
  if (!isValidSubtaskIndex(subtaskIndex)) return;
  subtaskCollection.splice(subtaskIndex, 1);
  updateEditingIndexAfterDelete(subtaskIndex);
  renderSubtaskList();
}

/**
 * Updates the editing index after a delete action.
 * @param {number} subtaskIndex - Deleted index.
 */
function updateEditingIndexAfterDelete(subtaskIndex) {
  if (editingSubtaskIndex === subtaskIndex) editingSubtaskIndex = null;
  if (editingSubtaskIndex !== null && subtaskIndex < editingSubtaskIndex) editingSubtaskIndex -= 1;
}

/**
 * Starts subtask editing.
 * @param {number} subtaskIndex - Subtask index.
 */
function editSubtask(subtaskIndex) {
  if (!isValidSubtaskIndex(subtaskIndex)) return;
  editingSubtaskIndex = subtaskIndex;
  renderSubtaskList();
}

/**
 * Saves the edited subtask title.
 * @param {number} subtaskIndex - Subtask index.
 * @param {string} newTitle - New title.
 */
function saveSubtaskEdit(subtaskIndex, newTitle) {
  if (!isValidSubtaskIndex(subtaskIndex)) return;

  const cleanedTitle = getTrimmedValue(newTitle ?? "");

  if (cleanedTitle) {
    subtaskCollection[subtaskIndex].title = cleanedTitle;
  }

  editingSubtaskIndex = null;
  renderSubtaskList();
}

/**
 * Cancels subtask editing.
 */
function cancelSubtaskEdit() {
  editingSubtaskIndex = null;
  renderSubtaskList();
}

/**
 * Focuses the active subtask input.
 */
function focusEditingSubtaskInput() {
  if (editingSubtaskIndex === null) return;
  const selector = `#subtask-list li[data-subtask-index="${editingSubtaskIndex}"] .subtask-title-input`;
  const inputElement = document.querySelector(selector);
  if (!inputElement) return;
  requestAnimationFrame(() => selectSubtaskInput(inputElement));
}

/**
 * Focuses and selects one subtask input.
 * @param {HTMLElement} inputElement - Input element.
 */
function selectSubtaskInput(inputElement) {
  inputElement.focus();
  inputElement.select();
}

/**
 * Resets the whole subtask state.
 */
function resetSubtasks() {
  subtaskCollection = [];
  editingSubtaskIndex = null;
  renderSubtaskList();
}