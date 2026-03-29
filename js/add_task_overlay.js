/**
 * add_task_overlay.js
 * - Initialisiert Formular, Kontakte, Dropdowns, Priorität-Icons und Subtasks.
 * - Speichert Tasks via postData("task/", taskObject).
 * - Erwartet loadData(...) und postData(...) aus deinem Projekt-Setup.
 */

document.addEventListener("DOMContentLoaded", initializeAddTaskPage);

const guestContactsFallback = [
  { name: "Alex", color: "#FF7A00" },
  { name: "Mina", color: "#1FD7C1" },
  { name: "Chris", color: "#6E52FF" }
];

let contactCollection = [];

/* =========================
   PAGE INITIALIZATION
   ========================= */

/** Startpunkt: richtet alles ein, sobald DOM bereit ist. */
async function initializeAddTaskPage() {
  setMinimumDateToToday();
  registerFormSubmitHandler();
  registerLiveValidationHandlers();
  registerGlobalClickHandler();
  await loadContacts();
  initializePriorityIconHandlers();
  renderSubtaskList();
}

/** Setzt im Date-Input das Minimum auf "heute". */
function setMinimumDateToToday() {
  const dateInputElement = document.getElementById("due-date");
  if (!dateInputElement) return;
  dateInputElement.min = new Date().toISOString().split("T")[0];
}

/** Registriert das Submit-Event am Formular. */
function registerFormSubmitHandler() {
  const taskFormElement = document.getElementById("taskForm");
  if (!taskFormElement) return;
  taskFormElement.addEventListener("submit", handleFormSubmit);
}

/** Schließt Dropdowns, wenn außerhalb geklickt wird. */
function registerGlobalClickHandler() {
  document.addEventListener("click", handleOutsideClick);
}

/** Schließt beide Dropdowns, wenn Klick nicht im jeweiligen Bereich ist. */
function handleOutsideClick(mouseEvent) {
  closeDropdownIfClickedOutside("assignee-dropdown", ".custom-multiselect", mouseEvent);
  closeDropdownIfClickedOutside("category-dropdown", ".custom-category-select", mouseEvent);
}

/** Hilfsfunktion: schließt ein Dropdown, wenn außerhalb geklickt wurde. */
function closeDropdownIfClickedOutside(dropdownId, containerSelector, mouseEvent) {
  const dropdownElement = document.getElementById(dropdownId);
  const containerElement = document.querySelector(containerSelector);
  if (!dropdownElement || !containerElement) return;
  if (!containerElement.contains(mouseEvent.target)) dropdownElement.classList.add("d-none");
}

/* =========================
   OVERLAY OPEN / CLOSE
   ========================= */

/** Öffnet Overlay (optional, falls du es später per Button öffnest). */
function openAddTaskOverlay() {
  const overlayElement = document.getElementById("add-task-overlay");
  if (!overlayElement) return;
  overlayElement.classList.add("active");
  document.body.classList.add("overlay-open");
}

/** Schließt Overlay und erlaubt Scrollen im Hintergrund. */
function closeAddTaskOverlay() {
  const overlayElement = document.getElementById("add-task-overlay");
  if (!overlayElement) return;
  overlayElement.classList.remove("active");
  document.body.classList.remove("overlay-open");
}

/** Stoppt das Schließen, wenn im Panel geklickt wird. */
function stopOverlayClick(mouseEvent) {
  mouseEvent.stopPropagation();
}

/* =========================
   CONTACTS / ASSIGNEES
   ========================= */

/** Lädt Kontakte aus der Datenquelle (Guest bekommt Fallback). */
async function loadContacts() {
  const userIdentifier = sessionStorage.getItem("userId");
  const isGuestUser = !userIdentifier || userIdentifier === "guest";
  const databasePath = isGuestUser ? "guest-contacts/" : "contacts/";
  const rawData = (await loadData(databasePath)) || [];
  const normalizedList = Array.isArray(rawData) ? rawData : Object.values(rawData);
  contactCollection = buildContactCollection(normalizedList, isGuestUser);
  renderAssigneeOptions();
}

/** Normalisiert Kontakte und stellt sicher, dass Guest nie leer ist. */
function buildContactCollection(rawList, isGuestUser) {
  const sourceList = isGuestUser && rawList.length === 0 ? guestContactsFallback : rawList;
  return sourceList
    .map((contactItem) => normalizeContact(contactItem))
    .filter((contactItem) => contactItem.name.trim().length > 0);
}

/** Baut ein sauberes Kontakt-Objekt aus verschiedenen möglichen Feldern. */
function normalizeContact(contactItem) {
  return {
    name: contactItem.name || contactItem.contactName || "",
    color: contactItem.color || "#CCCCCC"
  };
}

/** Rendert Checkbox-Liste im Assignee-Dropdown. */
function renderAssigneeOptions() {
  const dropdownElement = document.getElementById("assignee-dropdown");
  if (!dropdownElement) return;
  dropdownElement.innerHTML = "";
  contactCollection.forEach((contactItem) => dropdownElement.appendChild(buildAssigneeRow(contactItem)));
}

/** Erstellt genau eine Assignee-Zeile (Name + Initialen + Checkbox). */
function buildAssigneeRow(contactItem) {
  const rowElement = document.createElement("div");
  rowElement.className = "assignee-row";
  rowElement.innerHTML = getAssigneeRowMarkup(contactItem);
  attachAssigneeRowHandlers(rowElement);
  return rowElement;
}

/** Liefert das HTML-Markup für eine Assignee-Zeile. */
function getAssigneeRowMarkup(contactItem) {
  const initialsText = getInitials(contactItem.name);
  return `
    <div class="assignee-left" tabindex="0" role="button" aria-label="Toggle assignee">
      <div class="assignee-initials" style="background-color:${contactItem.color};">${initialsText}</div>
      <span class="assignee-name">${escapeHtmlText(contactItem.name)}</span>
    </div>
    <input class="assignee-checkbox" type="checkbox" data-name="${escapeHtmlText(contactItem.name)}" data-color="${contactItem.color}">
  `;
}

/** Hängt Interaktionen an: Klick/Enter/Space togglen die Checkbox + Auswahl. */
function attachAssigneeRowHandlers(rowElement) {
  const clickAreaElement = rowElement.querySelector(".assignee-left");
  const checkboxElement = rowElement.querySelector(".assignee-checkbox");
  if (!clickAreaElement || !checkboxElement) return;
  clickAreaElement.addEventListener("click", () => toggleAssigneeSelection(rowElement, checkboxElement));
  clickAreaElement.addEventListener("keydown", (keyboardEvent) => handleAssigneeKeydown(keyboardEvent, rowElement, checkboxElement));
  checkboxElement.addEventListener("change", () => updateAssigneeDisplay());
}

/** Tastatur: Enter oder Space verhält sich wie Klick. */
function handleAssigneeKeydown(keyboardEvent, rowElement, checkboxElement) {
  if (keyboardEvent.key !== "Enter" && keyboardEvent.key !== " ") return;
  keyboardEvent.preventDefault();
  toggleAssigneeSelection(rowElement, checkboxElement);
}

/** Schaltet Checkbox um und synchronisiert die optische Markierung. */
function toggleAssigneeSelection(rowElement, checkboxElement) {
  checkboxElement.checked = !checkboxElement.checked;
  rowElement.classList.toggle("name-selected", checkboxElement.checked);
  updateAssigneeDisplay();
}

/** Aktualisiert Avatare + Placeholder entsprechend der Auswahl. */
function updateAssigneeDisplay() {
  const selectedAssignees = getSelectedAssignees();
  renderAssigneeAvatars(selectedAssignees);
  updateAssigneePlaceholder(selectedAssignees.length);
}

/** Liest alle ausgewählten Assignees aus dem Dropdown aus. */
function getSelectedAssignees() {
  const checkboxElements = document.querySelectorAll("#assignee-dropdown .assignee-checkbox:checked");
  return Array.from(checkboxElements).map((checkboxElement) => {
    return { name: checkboxElement.dataset.name, color: checkboxElement.dataset.color };
  });
}

/** Rendert Initialen-Avatare für die aktuell ausgewählten Assignees. */
function renderAssigneeAvatars(selectedAssignees) {
  const avatarContainer = document.getElementById("selected-assignee-avatars");
  if (!avatarContainer) return;
  avatarContainer.innerHTML = "";
  selectedAssignees.forEach((assigneeItem) => avatarContainer.appendChild(buildAvatar(assigneeItem)));
}

/** Baut genau einen Avatar-Div (Initialen + Farbe). */
function buildAvatar(assigneeItem) {
  const avatarElement = document.createElement("div");
  avatarElement.className = "avatar";
  avatarElement.textContent = getInitials(assigneeItem.name);
  avatarElement.style.backgroundColor = assigneeItem.color;
  return avatarElement;
}

/** Aktualisiert den Text im Assignee-Placeholder. */
function updateAssigneePlaceholder(selectedCount) {
  const placeholderElement = document.getElementById("selected-assignees-placeholder");
  if (!placeholderElement) return;
  placeholderElement.textContent = selectedCount === 0 ? "Select contacts to assign" : `${selectedCount} selected`;
}

/** Öffnet oder schließt das Assignee-Dropdown und schließt Category. */
function toggleAssigneeDropdown() {
  toggleDropdownVisibility("assignee-dropdown");
  closeDropdown("category-dropdown");
}

/* =========================
   CATEGORY
   ========================= */

/** Öffnet oder schließt das Category-Dropdown und schließt Assignees. */
function toggleCategoryDropdown() {
  toggleDropdownVisibility("category-dropdown");
  closeDropdown("assignee-dropdown");
}

/** Universeller Toggle für Dropdown-Sichtbarkeit. */
function toggleDropdownVisibility(dropdownId) {
  const dropdownElement = document.getElementById(dropdownId);
  if (!dropdownElement) return;
  dropdownElement.classList.toggle("d-none");
}

/** Schließt ein Dropdown sicher. */
function closeDropdown(dropdownId) {
  const dropdownElement = document.getElementById(dropdownId);
  if (!dropdownElement) return;
  dropdownElement.classList.add("d-none");
}

/** Setzt die gewählte Kategorie (hidden input + Placeholder). */
function selectCategory(categoryValue) {
  setCategoryHiddenValue(categoryValue);
  setCategoryPlaceholder(categoryValue);
  closeDropdown("category-dropdown");
  hideCategoryError();
}

/** Schreibt die Kategorie in das hidden Input-Feld. */
function setCategoryHiddenValue(categoryValue) {
  const categoryInputElement = document.getElementById("category");
  if (!categoryInputElement) return;
  categoryInputElement.value = categoryValue;
}

/** Setzt den sichtbaren Text je nach Kategorie. */
function setCategoryPlaceholder(categoryValue) {
  const placeholderElement = document.getElementById("selected-category-placeholder");
  if (!placeholderElement) return;
  placeholderElement.textContent = categoryValue === "user-story" ? "User Story" : "Technical Task";
}

/** Blendet den Kategorie-Fehler aus. */
function hideCategoryError() {
  const categoryInputElement = document.getElementById("category");
  const categoryErrorElement = document.getElementById("error-category");

  if (categoryInputElement) categoryInputElement.classList.remove("input-error");
  if (categoryErrorElement) categoryErrorElement.classList.remove("active");
}

/* =========================
   FORM VALIDATION / SAVE
   ========================= */

/** Submit-Handler: validiert, sammelt Daten, speichert in Firebase. */
async function handleFormSubmit(submitEvent) {
  submitEvent.preventDefault();

  const submitBtn = document.querySelector(".create-btn");
  if (submitBtn) submitBtn.disabled = true;

  try {
    if (!validateForm()) return;

    const taskObject = collectTaskData();
    await saveTask(taskObject);
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

/** Validiert Pflichtfelder: Title, Due Date, Category. */
function validateForm() {
  const titleValid = validateRequiredField("title", "error-title");
  const dateValid = validateRequiredField("due-date", "error-due-date");
  const categoryValid = validateCategoryField();
  return titleValid && dateValid && categoryValid;
}

/** Validiert ein Pflichtfeld anhand von IDs. */
function validateRequiredField(inputId, errorId) {
  const inputElement = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);
  if (!inputElement || !errorElement) return false;
  return setFieldValidity(inputElement, errorElement, inputElement.value.trim().length > 0);
}

/** Validiert, ob eine Kategorie ausgewählt wurde. */
function validateCategoryField() {
  const inputElement = document.getElementById("category");
  const errorElement = document.getElementById("error-category");
  if (!inputElement || !errorElement) return false;
  return setFieldValidity(inputElement, errorElement, inputElement.value.trim().length > 0);
}

/** Setzt Error-UI anhand der Validität. */
function setFieldValidity(inputElement, errorElement, isValid) {
  inputElement.classList.toggle("input-error", !isValid);
  errorElement.classList.toggle("active", !isValid);
  return isValid;
}

/** Sammelt alle Formdaten inklusive Subtasks/Assignees. */
function collectTaskData() {
  const titleText = getTrimmedText(document.getElementById("title")?.value);
  const descriptionText = getTrimmedText(document.getElementById("description")?.value);
  const categoryValue = document.getElementById("category")?.value || "";
  const dueDateValue = document.getElementById("due-date")?.value || "";
  const priorityValue = getSelectedPriorityValue();
  const assigneeList = getSelectedAssignees();
  return buildTaskObject(titleText, descriptionText, categoryValue, dueDateValue, priorityValue, assigneeList);
}

/** Ermittelt die aktuell ausgewählte Priorität. */
function getSelectedPriorityValue() {
  const checkedElement = document.querySelector('input[name="priority"]:checked');
  return checkedElement ? checkedElement.value : "medium";
}

/** Baut das Task-Objekt in einer klaren Struktur. */
function buildTaskObject(titleText, descriptionText, categoryValue, dueDateValue, priorityValue, assigneeList) {
  return {
    category: categoryValue,
    title: titleText,
    description: descriptionText,
    dueDate: dueDateValue,
    priority: priorityValue,
    assignedTo: assigneeList,
    subtasks: cloneSubtasks()
  };
}

/** Speichert Task und behandelt Fehler sauber. */
async function saveTask(taskObject) {
  try {
    await postData("task/", taskObject);
    alert("Task successfully saved!");
    handleClear();
  } catch (errorObject) {
    console.error("Saving failed:", errorObject);
    alert("Saving failed. Check console/network tab.");
  }
}

/** Setzt komplettes Formular und UI zurück (inkl. Subtasks/Dropdowns). */
function handleClear() {
  const taskFormElement = document.getElementById("taskForm");
  if (taskFormElement) taskFormElement.reset();
  resetSubtasks();
  resetAssignees();
  resetCategory();
  updatePriorityIcons();
}

/** Entfernt alle Assignee-Auswahlen und setzt UI zurück. */
function resetAssignees() {
  document.querySelectorAll('#assignee-dropdown input[type="checkbox"]').forEach((checkboxElement) => {
    checkboxElement.checked = false;
    checkboxElement.closest(".assignee-row")?.classList.remove("name-selected");
  });
  updateAssigneeDisplay();
}

/** Setzt Kategorie zurück. */
function resetCategory() {
  const categoryInputElement = document.getElementById("category");
  const placeholderElement = document.getElementById("selected-category-placeholder");
  if (categoryInputElement) categoryInputElement.value = "";
  if (placeholderElement) placeholderElement.textContent = "Select category";
  hideCategoryError();
}