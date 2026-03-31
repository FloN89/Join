let subtaskCollection = [];
let editingSubtaskIndex = null;

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

function renderSubtaskList() {
  const subtaskListElement = document.getElementById("subtask-list");
  if (!subtaskListElement) return;

  subtaskListElement.innerHTML = buildSubtaskListMarkup();
  registerSubtaskListEvents(subtaskListElement);
  focusEditingSubtaskInput();
}

function registerSubtaskListEvents(subtaskListElement) {
  subtaskListElement.onclick = (mouseEvent) => handleSubtaskListClick(mouseEvent);
  subtaskListElement.onkeydown = (keyboardEvent) => handleSubtaskListKeydown(keyboardEvent);
  subtaskListElement.onfocusout = (focusEvent) => handleSubtaskListFocusOut(focusEvent);
}

function buildSubtaskListMarkup() {
  return subtaskCollection
    .map((subtaskObject, subtaskIndex) => buildSingleSubtaskMarkup(subtaskObject, subtaskIndex))
    .join("");
}

function buildSingleSubtaskMarkup(subtaskObject, subtaskIndex) {
  if (editingSubtaskIndex === subtaskIndex) {
    return buildEditableSubtaskMarkup(subtaskObject, subtaskIndex);
  }

  return buildReadonlySubtaskMarkup(subtaskObject, subtaskIndex);
}

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

function runSubtaskAction(actionName, subtaskIndex, listItemElement) {
  if (actionName === "delete") deleteSubtask(subtaskIndex);
  if (actionName === "edit") editSubtask(subtaskIndex);
  if (actionName === "save") saveSubtaskEdit(subtaskIndex, readEditedSubtaskValue(listItemElement));
  if (actionName === "cancel") cancelSubtaskEdit();
}

function readEditedSubtaskValue(listItemElement) {
  const inputElement = listItemElement?.querySelector(".subtask-title-input");
  if (!inputElement) return "";
  return inputElement.value;
}

function deleteSubtask(subtaskIndex) {
  if (!isValidSubtaskIndex(subtaskIndex)) return;

  subtaskCollection.splice(subtaskIndex, 1);

  if (editingSubtaskIndex === subtaskIndex) editingSubtaskIndex = null;
  if (editingSubtaskIndex !== null && subtaskIndex < editingSubtaskIndex) editingSubtaskIndex -= 1;

  renderSubtaskList();
}

function editSubtask(subtaskIndex) {
  if (!isValidSubtaskIndex(subtaskIndex)) return;
  editingSubtaskIndex = subtaskIndex;
  renderSubtaskList();
}

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

function cancelSubtaskEdit() {
  editingSubtaskIndex = null;
  renderSubtaskList();
}

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

function resetSubtasks() {
  subtaskCollection = [];
  editingSubtaskIndex = null;
  renderSubtaskList();
}