let subtaskCollection = [];

/* =========================
   SUBTASKS
   ========================= */

/** Löscht den aktuell eingegebenen Subtask-Text. */
function clearSubtaskInput() {
  const inputElement = document.getElementById("subtask");
  if (!inputElement) return;
  inputElement.value = "";
}

/** Enter fügt Subtask hinzu und verhindert Formular-Submit. */
function handleSubtaskKey(keyboardEvent) {
  if (keyboardEvent.key !== "Enter") return;
  keyboardEvent.preventDefault();
  addSubtask();
}

/** Liest Input aus, speichert Subtask und rendert neu. */
function addSubtask() {
  const inputElement = document.getElementById("subtask");
  if (!inputElement) return;
  const titleText = getTrimmedText(inputElement.value);
  if (!titleText) return;
  subtaskCollection.push({ title: titleText, completed: false });
  inputElement.value = "";
  renderSubtaskList();
}

/** Rendert alle Subtasks (mit Event Delegation für Edit/Delete). */
function renderSubtaskList() {
  const listElement = document.getElementById("subtask-list");
  if (!listElement) return;
  listElement.innerHTML = subtaskCollection.map(buildSubtaskMarkup).join("");
  listElement.onclick = handleSubtaskListClick;
}

/** Baut Markup für genau einen Subtask. */
function buildSubtaskMarkup(subtaskItem, subtaskIndex) {
  return `
    <li class="subtask-item" data-subtask-index="${subtaskIndex}">
      <div class="subtask-left">
        <span class="subtask-bullet">•</span>
        <span class="subtask-title">${escapeHtmlText(subtaskItem.title)}</span>
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

/** Delegiert Klicks auf Edit/Delete Buttons. */
function handleSubtaskListClick(mouseEvent) {
  const actionButtonElement = mouseEvent.target.closest("button[data-action]");
  const listItemElement = mouseEvent.target.closest("li[data-subtask-index]");
  if (!actionButtonElement || !listItemElement) return;
  const subtaskIndex = Number(listItemElement.dataset.subtaskIndex);
  runSubtaskAction(actionButtonElement.dataset.action, subtaskIndex);
}

/** Führt Action aus (edit/delete). */
function runSubtaskAction(actionName, subtaskIndex) {
  if (actionName === "delete") deleteSubtask(subtaskIndex);
  if (actionName === "edit") editSubtask(subtaskIndex);
}

/** Entfernt einen Subtask aus der Liste. */
function deleteSubtask(subtaskIndex) {
  if (!isValidSubtaskIndex(subtaskIndex)) return;
  subtaskCollection.splice(subtaskIndex, 1);
  renderSubtaskList();
}

/** Ändert den Titel eines Subtasks via Prompt. */
function editSubtask(subtaskIndex) {
  if (!isValidSubtaskIndex(subtaskIndex)) return;
  const currentTitle = subtaskCollection[subtaskIndex].title;
  const newTitle = prompt("Edit subtask:", currentTitle);
  applyEditedSubtaskTitle(subtaskIndex, newTitle);
}

/** Übernimmt neuen Titel, wenn gültig. */
function applyEditedSubtaskTitle(subtaskIndex, newTitle) {
  const cleanedTitle = getTrimmedText(newTitle ?? "");
  if (!cleanedTitle) return;
  subtaskCollection[subtaskIndex].title = cleanedTitle;
  renderSubtaskList();
}

/** Prüft, ob Index zur aktuellen Subtask-Liste passt. */
function isValidSubtaskIndex(subtaskIndex) {
  return Number.isInteger(subtaskIndex) && subtaskIndex >= 0 && subtaskIndex < subtaskCollection.length;
}

/** Löscht Subtasks komplett (State + UI). */
function resetSubtasks() {
  subtaskCollection = [];
  renderSubtaskList();
}

/** Clone, damit Subtasks nicht per Referenz verändert werden. */
function cloneSubtasks() {
  if (typeof structuredClone === "function") return structuredClone(subtaskCollection);
  return JSON.parse(JSON.stringify(subtaskCollection));
}

/* =========================
   PRIORITY ICONS
   ========================= */

/** Registriert Change-Events für die Prioritäts-Radios. */
function initializePriorityIconHandlers() {
  document.querySelectorAll('input[name="priority"]').forEach((radioElement) => {
    radioElement.addEventListener("change", updatePriorityIcons);
  });
  updatePriorityIcons();
}

/** Setzt Icons je nach ausgewählter Priorität (weiß vs. farbig). */
function updatePriorityIcons() {
  const urgentRadio = document.getElementById("priority-urgent");
  const mediumRadio = document.getElementById("priority-medium");
  const lowRadio = document.getElementById("priority-low");
  setPriorityIcon("icon-urgent", urgentRadio?.checked, "../assets/icons/urgent_white.svg", "../assets/icons/urgent_red.svg");
  setPriorityIcon("icon-medium", mediumRadio?.checked, "../assets/icons/medium_white.svg", "../assets/icons/medium_yellow.svg");
  setPriorityIcon("icon-low", lowRadio?.checked, "../assets/icons/low_white.svg", "../assets/icons/low_green.svg");
}

/** Schreibt die passende Icon-Quelle abhängig vom checked-Status. */
function setPriorityIcon(iconId, isChecked, checkedSource, uncheckedSource) {
  const iconElement = document.getElementById(iconId);
  if (!iconElement) return;
  iconElement.src = isChecked ? checkedSource : uncheckedSource;
}

/* =========================
   TEXT HELPERS
   ========================= */

/** Liefert getrimmten Text oder leeren String. */
function getTrimmedText(textValue) {
  if (typeof textValue !== "string") return "";
  return textValue.trim();
}

/** Erstellt Initialen aus einem vollständigen Namen. */
function getInitials(fullName) {
  return String(fullName)
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/** Schützt gegen HTML-Injection, wenn Text in innerHTML landet. */
function escapeHtmlText(unsafeText) {
  return String(unsafeText)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}