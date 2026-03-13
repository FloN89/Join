let subtaskCollection = [];

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
 * @returns {void} Return value
 */
function readSubtaskTitleFromInput() {
  const subtaskInputElement = document.getElementById("subtask");
  if (!subtaskInputElement) return "";
  return getTrimmedValue(subtaskInputElement.value);
}

/**
 * Create subtask object
 * @param {*} subtaskTitle - Subtasktitle value
 * @returns {*} Return value
 */
function createSubtaskObject(subtaskTitle) {
  return { title: subtaskTitle, completed: false };
}

/**
 * Get trimmed value
 * @param {*} textValue - Textvalue value
 * @returns {*} Return value
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
  registerSubtaskListClick(subtaskListElement);
}

/**
 * Register subtask list click
 * @param {HTMLElement} subtaskListElement - DOM element
 */
function registerSubtaskListClick(subtaskListElement) {
  subtaskListElement.onclick = (mouseEvent) => handleSubtaskListClick(mouseEvent);
}

/**
 * Build subtask list markup
 * @returns {*} Return value
 */
function buildSubtaskListMarkup() {
  return subtaskCollection
    .map((subtaskObject, subtaskIndex) => buildSingleSubtaskMarkup(subtaskObject, subtaskIndex))
    .join("");
}

/**
 * Build single subtask markup
 * @param {*} subtaskObject - Subtaskobject value
 * @param {number} subtaskIndex - Subtaskindex value
 * @returns {*} Return value
 */
function buildSingleSubtaskMarkup(subtaskObject, subtaskIndex) {
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
 * Escape html text
 * @param {*} unsafeText - Unsafetext value
 * @returns {void} Return value
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

  runSubtaskAction(actionName, subtaskIndex);
}

/**
 * Read subtask action
 * @param {Event} mouseEvent - Event object
 * @returns {void} Return value
 */
function readSubtaskAction(mouseEvent) {
  const actionButtonElement = mouseEvent.target.closest("button[data-action]");
  if (!actionButtonElement) return "";
  return actionButtonElement.dataset.action || "";
}

/**
 * Read subtask index
 * @param {Event} mouseEvent - Event object
 * @returns {void} Return value
 */
function readSubtaskIndex(mouseEvent) {
  const listItemElement = mouseEvent.target.closest("li[data-subtask-index]");
  if (!listItemElement) return -1;
  return Number(listItemElement.dataset.subtaskIndex);
}

/**
 * Run subtask action
 * @param {*} actionName - Actionname value
 * @param {number} subtaskIndex - Subtaskindex value
 * @returns {void} Return value
 */
function runSubtaskAction(actionName, subtaskIndex) {
  if (actionName === "delete") deleteSubtask(subtaskIndex);
  if (actionName === "edit") editSubtask(subtaskIndex);
}

/**
 * Delete subtask
 * @param {number} subtaskIndex - Subtaskindex value
 * @returns {void} Return value
 */
function deleteSubtask(subtaskIndex) {
  subtaskCollection.splice(subtaskIndex, 1);
  renderSubtaskList();
}

/**
 * Edit subtask
 * @param {number} subtaskIndex - Subtaskindex value
 * @returns {void} Return value
 */
function editSubtask(subtaskIndex) {
  const currentTitle = subtaskCollection[subtaskIndex].title;
  const newTitle = prompt("Edit subtask:", currentTitle);
  applyEditedSubtaskTitle(subtaskIndex, newTitle);
}

/**
 * Apply edited subtask title
 * @param {number} subtaskIndex - Subtaskindex value
 * @param {*} newTitle - Newtitle value
 * @returns {void} Return value
 */
function applyEditedSubtaskTitle(subtaskIndex, newTitle) {
  const cleanedTitle = getTrimmedValue(newTitle ?? "");
  if (!cleanedTitle) return;
  subtaskCollection[subtaskIndex].title = cleanedTitle;
  renderSubtaskList();
}

/**
 * Is valid subtask index
 * @param {number} subtaskIndex - Subtaskindex value
 * @returns {boolean} Return value
 */
function isValidSubtaskIndex(subtaskIndex) {
  return Number.isInteger(subtaskIndex) && subtaskIndex >= 0 && subtaskIndex < subtaskCollection.length;
}

/**
 * Reset subtasks
 * @returns {void} Return value
 */
function resetSubtasks() {
  subtaskCollection = [];
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
 * @param {*} checkedName - Checkedname value
 * @param {*} uncheckedName - Uncheckedname value
 * @returns {void} Return value
 */
function applyPriorityIcon(iconId, radioElement, checkedName, uncheckedName) {
  const iconElement = document.getElementById(iconId);
  if (!iconElement || !radioElement) return;

  iconElement.src = radioElement.checked
    ? `../assets/icons/${checkedName}.svg`
    : `../assets/icons/${uncheckedName}.svg`;
}

// Form-Reset, Data-Collection und Success-Toast wurden nach add_task_form.js ausgelagert