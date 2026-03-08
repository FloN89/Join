let subtaskCollection = [];

/* =========================
   SUBTASKS
========================= */

function registerSubtaskEvents() {
  registerSubtaskInputKeydown();
  registerSubtaskButtons();
}

function registerSubtaskInputKeydown() {
  const subtaskInputElement = document.getElementById("subtask");
  if (!subtaskInputElement) return;

  subtaskInputElement.addEventListener("keydown", (keyboardEvent) => {
    if (keyboardEvent.key !== "Enter") return;
    keyboardEvent.preventDefault();
    addSubtask();
  });
}

function registerSubtaskButtons() {
  const clearButtonElement = document.getElementById("subtask-clear-button");
  const addButtonElement = document.getElementById("subtask-add-button");

  if (clearButtonElement) clearButtonElement.addEventListener("click", clearSubtaskInput);
  if (addButtonElement) addButtonElement.addEventListener("click", addSubtask);
}

function clearSubtaskInput() {
  const subtaskInputElement = document.getElementById("subtask");
  if (!subtaskInputElement) return;
  subtaskInputElement.value = "";
}

function addSubtask() {
  const subtaskTitle = readSubtaskTitleFromInput();
  if (!subtaskTitle) return;

  subtaskCollection.push(createSubtaskObject(subtaskTitle));
  renderSubtaskList();
  clearSubtaskInput();
}

function readSubtaskTitleFromInput() {
  const subtaskInputElement = document.getElementById("subtask");
  if (!subtaskInputElement) return "";
  return getTrimmedValue(subtaskInputElement.value);
}

function createSubtaskObject(subtaskTitle) {
  return { title: subtaskTitle, completed: false };
}

function getTrimmedValue(textValue) {
  if (typeof textValue !== "string") return "";
  return textValue.trim();
}

function renderSubtaskList() {
  const subtaskListElement = document.getElementById("subtask-list");
  if (!subtaskListElement) return;

  subtaskListElement.innerHTML = buildSubtaskListMarkup();
  registerSubtaskListClick(subtaskListElement);
}

function registerSubtaskListClick(subtaskListElement) {
  subtaskListElement.onclick = (mouseEvent) => handleSubtaskListClick(mouseEvent);
}

function buildSubtaskListMarkup() {
  return subtaskCollection
    .map((subtaskObject, subtaskIndex) => buildSingleSubtaskMarkup(subtaskObject, subtaskIndex))
    .join("");
}

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

function escapeHtmlText(unsafeText) {
  return String(unsafeText)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function handleSubtaskListClick(mouseEvent) {
  const actionName = readSubtaskAction(mouseEvent);
  if (!actionName) return;

  const subtaskIndex = readSubtaskIndex(mouseEvent);
  if (!isValidSubtaskIndex(subtaskIndex)) return;

  runSubtaskAction(actionName, subtaskIndex);
}

function readSubtaskAction(mouseEvent) {
  const actionButtonElement = mouseEvent.target.closest("button[data-action]");
  if (!actionButtonElement) return "";
  return actionButtonElement.dataset.action || "";
}

function readSubtaskIndex(mouseEvent) {
  const listItemElement = mouseEvent.target.closest("li[data-subtask-index]");
  if (!listItemElement) return -1;
  return Number(listItemElement.dataset.subtaskIndex);
}

function runSubtaskAction(actionName, subtaskIndex) {
  if (actionName === "delete") deleteSubtask(subtaskIndex);
  if (actionName === "edit") editSubtask(subtaskIndex);
}

function deleteSubtask(subtaskIndex) {
  subtaskCollection.splice(subtaskIndex, 1);
  renderSubtaskList();
}

function editSubtask(subtaskIndex) {
  const currentTitle = subtaskCollection[subtaskIndex].title;
  const newTitle = prompt("Edit subtask:", currentTitle);
  applyEditedSubtaskTitle(subtaskIndex, newTitle);
}

function applyEditedSubtaskTitle(subtaskIndex, newTitle) {
  const cleanedTitle = getTrimmedValue(newTitle ?? "");
  if (!cleanedTitle) return;
  subtaskCollection[subtaskIndex].title = cleanedTitle;
  renderSubtaskList();
}

function isValidSubtaskIndex(subtaskIndex) {
  return Number.isInteger(subtaskIndex) && subtaskIndex >= 0 && subtaskIndex < subtaskCollection.length;
}

function resetSubtasks() {
  subtaskCollection = [];
  renderSubtaskList();
}

/* =========================
   PRIORITY ICONS
========================= */

function initializePriorityIconHandlers() {
  const radioNodeList = document.querySelectorAll('input[name="priority"]');
  radioNodeList.forEach((radioElement) => {
    radioElement.addEventListener("change", updatePriorityIcons);
  });
  updatePriorityIcons();
}

function updatePriorityIcons() {
  const urgentRadio = document.getElementById("priority-urgent");
  const mediumRadio = document.getElementById("priority-medium");
  const lowRadio = document.getElementById("priority-low");

  applyPriorityIcon("icon-urgent", urgentRadio, "urgent_white", "urgent_red");
  applyPriorityIcon("icon-medium", mediumRadio, "medium_white", "medium_yellow");
  applyPriorityIcon("icon-low", lowRadio, "low_white", "low_green");
}

function applyPriorityIcon(iconId, radioElement, checkedName, uncheckedName) {
  const iconElement = document.getElementById(iconId);
  if (!iconElement || !radioElement) return;

  iconElement.src = radioElement.checked
    ? `../assets/icons/${checkedName}.svg`
    : `../assets/icons/${uncheckedName}.svg`;
}

/* =========================
   FORM RESET + DATA SAMMLUNG
========================= */

function handleClear() {
  resetFormElement();
  resetAssignees();
  resetCategory();
  resetSubtasks();
  updatePriorityIcons();
}

function resetFormElement() {
  const taskFormElement = document.getElementById("taskForm");
  if (!taskFormElement) return;
  taskFormElement.reset();
}

function resetAssignees() {
  uncheckAllAssigneeCheckboxes();
  clearAssigneeAvatarContainer();
  resetAssigneePlaceholder();
  updateAssigneeDisplay();
}

function uncheckAllAssigneeCheckboxes() {
  document.querySelectorAll('#assignee-dropdown input[type="checkbox"]').forEach((checkboxElement) => {
    checkboxElement.checked = false;
  });
}

function clearAssigneeAvatarContainer() {
  const avatarContainerElement = document.getElementById("selected-assignee-avatars");
  if (!avatarContainerElement) return;
  avatarContainerElement.innerHTML = "";
}

function resetAssigneePlaceholder() {
  const placeholderElement = document.getElementById("selected-assignees-placeholder");
  if (!placeholderElement) return;
  placeholderElement.textContent = "Select contacts to assign";
}

function resetCategory() {
  setCategoryHiddenInput("");
  setCategoryPlaceholderText("");
  removeCategoryError();
}

function collectTaskData() {
  return {
    category: readInputValue("category"),
    title: readInputValue("title"),
    description: readInputValue("description"),
    dueDate: readInputValue("due-date"),
    priority: readSelectedPriority(),
    assignedTo: getSelectedAssignees(),
    subtasks: structuredClone(subtaskCollection),
  };
}

function readInputValue(inputId) {
  const inputElement = document.getElementById(inputId);
  if (!inputElement) return "";
  return inputElement.value.trim();
}

function readSelectedPriority() {
  const selectedElement = document.querySelector('input[name="priority"]:checked');
  return selectedElement ? selectedElement.value : "medium";
}

/* =========================
   SUCCESS TOAST + REDIRECT
========================= */

function ensureSuccessToastElement() {
  const toastElement = document.getElementById("task-success");
  if (toastElement) return toastElement;

  const newToastElement = document.createElement("div");
  newToastElement.id = "task-success";
  newToastElement.className = "task-success";
  newToastElement.textContent = "Task added to board";
  document.body.appendChild(newToastElement);
  return newToastElement;
}

function showSuccessAndRedirect() {
  const toastElement = ensureSuccessToastElement();
  restartToastAnimation(toastElement);

  setTimeout(() => {
    window.location.href = "board.html";
  }, 2500);
}

function showSavingFailedToast() {
  const toastElement = ensureSuccessToastElement();
  toastElement.textContent = "Saving failed";
  restartToastAnimation(toastElement);
}

function restartToastAnimation(toastElement) {
  toastElement.classList.remove("show");
  void toastElement.offsetWidth;
  toastElement.classList.add("show");
}