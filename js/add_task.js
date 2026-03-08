/**
 * Add-Task Seite:
 * - Initialisiert Events, setzt Mindestdatum, lädt Kontakte
 * - Steuert Dropdowns, Kategorie, Prioritäts-Icons
 * - Verwaltet Subtasks (Add/Edit/Delete)
 * - Speichert Task-Daten via postData()
 */
document.addEventListener("DOMContentLoaded", initializeAddTaskPage);

const GUEST_CONTACTS_FALLBACK = [
  { name: "Alex", color: "#FF7A00" },
  { name: "Mina", color: "#1FD7C1" },
  { name: "Chris", color: "#6E52FF" },
];

let contacts = [];

/* =========================
   INITIALISIERUNG
========================= */

/** Startpunkt für die Seite. */
async function initializeAddTaskPage() {
  setMinimumDateToToday();
  registerUserInterfaceEvents();
  await loadContacts();
  initializePriorityIconHandlers();
  renderSubtaskList();
}

/** Registriert alle Event-Listener (keine Inline-onclicks nötig). */
function registerUserInterfaceEvents() {
  registerFormSubmitEvent();
  registerDropdownEvents();
  registerCategoryOptionEvents();
  registerSubtaskEvents();
  registerClearButtonEvent();
}

/** Verhindert Auswahl von Datumswerten in der Vergangenheit. */
function setMinimumDateToToday() {
  const dateInputElement = document.getElementById("due-date");
  if (!dateInputElement) return;
  dateInputElement.min = new Date().toISOString().split("T")[0];
}

/* =========================
   EVENTS: FORM / BUTTONS
========================= */

/** Registriert den Submit-Handler am Formular. */
function registerFormSubmitEvent() {
  const taskFormElement = document.getElementById("taskForm");
  if (!taskFormElement) return;
  taskFormElement.addEventListener("submit", handleFormSubmit);
}

/** Registriert den Clear-Button. */
function registerClearButtonEvent() {
  const clearButtonElement = document.getElementById("clear-form-button");
  if (!clearButtonElement) return;
  clearButtonElement.addEventListener("click", handleClear);
}

/** Submit: validieren, sammeln, speichern, UI zurücksetzen. */
async function handleFormSubmit(submitEvent) {
  submitEvent.preventDefault();
  if (!validateForm()) return;

  const taskObject = collectTaskData();

  try {
    await postData("task", taskObject);
    handleClear();
    showSuccessAndRedirect();
  } catch (saveError) {
    showSavingFailedToast();
    console.error("Saving failed:", saveError);
  }
}

/* =========================
   VALIDIERUNG
========================= */

/** Validiert alle Pflichtfelder. */
function validateForm() {
  let isFormValid = true;
  if (!checkRequiredField("title", "error-title")) isFormValid = false;
  if (!checkRequiredField("due-date", "error-due-date")) isFormValid = false;
  if (!validateCategoryField()) isFormValid = false;
  return isFormValid;
}

/** Validiert, ob Kategorie gesetzt wurde. */
function validateCategoryField() {
  const categoryInputElement = document.getElementById("category");
  const errorElement = document.getElementById("error-category");
  if (!categoryInputElement || !errorElement) return false;

  if (!categoryInputElement.value.trim()) {
    errorElement.classList.add("active");
    return false;
  }

  errorElement.classList.remove("active");
  return true;
}

/** Prüft ein Pflichtfeld anhand Input-ID und Fehler-ID. */
function checkRequiredField(inputId, errorId) {
  const inputElement = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);
  if (!inputElement || !errorElement) return false;

  if (!inputElement.value.trim()) return markFieldInvalid(inputElement, errorElement);
  return markFieldValid(inputElement, errorElement);
}

function markFieldInvalid(inputElement, errorElement) {
  inputElement.classList.add("input-error");
  errorElement.classList.add("active");
  return false;
}

function markFieldValid(inputElement, errorElement) {
  inputElement.classList.remove("input-error");
  errorElement.classList.remove("active");
  return true;
}

/* =========================
   KONTAKTE LADEN / ASSIGNEES
========================= */

/** Lädt Kontakte (Guest oder User) und rendert Dropdown-Optionen. */
async function loadContacts() {
  const isGuestUser = isGuestSessionUser();
  const dataPath = isGuestUser ? "guest-contacts/" : "contacts/";
  const rawContacts = (await loadData(dataPath)) || [];

  const contactList = normalizeContacts(rawContacts, isGuestUser);
  contacts = sanitizeContacts(contactList);

  renderAssigneeOptions();
}

function isGuestSessionUser() {
  const userId = sessionStorage.getItem("userId");
  return !userId || userId === "guest";
}

function normalizeContacts(rawContacts, isGuestUser) {
  const contactList = Array.isArray(rawContacts) ? rawContacts : Object.values(rawContacts);
  if (isGuestUser && contactList.length === 0) return GUEST_CONTACTS_FALLBACK;
  return contactList;
}

function sanitizeContacts(contactList) {
  return contactList
    .map((contactObject) => mapContact(contactObject))
    .filter((contactObject) => contactObject.name.trim().length > 0);
}

function mapContact(contactObject) {
  return {
    name: contactObject.name || contactObject.contactName || "",
    color: contactObject.color || "#CCCCCC",
  };
}

/** Rendert alle Kontakte als auswählbare Zeilen. */
function renderAssigneeOptions() {
  const dropdownElement = document.getElementById("assignee-dropdown");
  if (!dropdownElement) return;

  dropdownElement.innerHTML = "";
  contacts.forEach((contactObject) => dropdownElement.appendChild(createAssigneeRow(contactObject)));
}

/** Erstellt eine Zeile mit Initialen, Name und Checkbox. */
function createAssigneeRow(contactObject) {
  const rowElement = document.createElement("div");
  rowElement.className = "assignee-row";
  rowElement.innerHTML = buildAssigneeRowMarkup(contactObject);

  const leftElement = rowElement.querySelector(".assignee-left");
  const checkboxElement = rowElement.querySelector(".assignee-checkbox");

  registerAssigneeRowEvents(rowElement, leftElement, checkboxElement);
  return rowElement;
}

function buildAssigneeRowMarkup(contactObject) {
  const initialsText = getInitials(contactObject.name);
  return `
    <div class="assignee-left" tabindex="0" role="button">
      <div class="assignee-initials" style="background-color: ${contactObject.color};">
        ${initialsText}
      </div>
      <span class="assignee-name">${contactObject.name}</span>
    </div>

    <input
      class="assignee-checkbox"
      type="checkbox"
      data-name="${contactObject.name}"
      data-color="${contactObject.color}"
    >
  `;
}

function registerAssigneeRowEvents(rowElement, leftElement, checkboxElement) {
  if (!leftElement || !checkboxElement) return;

  leftElement.addEventListener("click", (clickEvent) => {
    clickEvent.stopPropagation();
    toggleCheckbox(checkboxElement);
    syncRowSelectionStyle(rowElement, checkboxElement.checked);
    updateAssigneeDisplay();
  });

  leftElement.addEventListener("keydown", (keyboardEvent) => {
    if (!isEnterOrSpace(keyboardEvent)) return;
    keyboardEvent.preventDefault();
    leftElement.click();
  });

  checkboxElement.addEventListener("change", () => {
    syncRowSelectionStyle(rowElement, checkboxElement.checked);
    updateAssigneeDisplay();
  });
}

function isEnterOrSpace(keyboardEvent) {
  return keyboardEvent.key === "Enter" || keyboardEvent.key === " ";
}

function toggleCheckbox(checkboxElement) {
  checkboxElement.checked = !checkboxElement.checked;
}

function syncRowSelectionStyle(rowElement, isSelected) {
  if (isSelected) rowElement.classList.add("name-selected");
  if (!isSelected) rowElement.classList.remove("name-selected");
}

/** Aktualisiert Avatar-Anzeige + Platzhaltertext. */
function updateAssigneeDisplay() {
  const avatarContainerElement = document.getElementById("selected-assignee-avatars");
  const placeholderElement = document.getElementById("selected-assignees-placeholder");
  if (!avatarContainerElement || !placeholderElement) return;

  const selectedAssignees = getSelectedAssignees();
  renderAssigneeAvatarContainer(avatarContainerElement, selectedAssignees);
  setAssigneePlaceholderText(placeholderElement, selectedAssignees);
}

function renderAssigneeAvatarContainer(containerElement, assignedToList) {
  containerElement.innerHTML = "";
  assignedToList.forEach((assigneeObject) => containerElement.appendChild(buildAvatarElement(assigneeObject)));
}

function buildAvatarElement(assigneeObject) {
  const avatarElement = document.createElement("div");
  avatarElement.className = "avatar";
  avatarElement.textContent = getInitials(assigneeObject.name);
  avatarElement.style.backgroundColor = assigneeObject.color;
  return avatarElement;
}

function setAssigneePlaceholderText(placeholderElement, selectedAssignees) {
  placeholderElement.textContent = selectedAssignees.length > 0 ? "Selected contacts" : "Select contacts to assign";
}

/** Liest alle ausgewählten Assignees aus dem Dropdown aus. */
function getSelectedAssignees() {
  const checkboxNodeList = document.querySelectorAll('#assignee-dropdown input[type="checkbox"]:checked');
  return Array.from(checkboxNodeList).map((checkboxElement) => buildAssigneeFromCheckbox(checkboxElement));
}

function buildAssigneeFromCheckbox(checkboxElement) {
  return {
    name: checkboxElement.dataset.name || "",
    color: checkboxElement.dataset.color || "#CCCCCC",
  };
}

/** Erstellt Initialen aus einem Namen. */
function getInitials(fullName) {
  return fullName
    .split(" ")
    .filter((namePart) => namePart.length > 0)
    .map((namePart) => namePart[0].toUpperCase())
    .join("");
}

/* =========================
   DROPDOWNS + CATEGORY
========================= */

function registerDropdownEvents() {
  const assigneeHeaderElement = document.getElementById("assignee-header");
  const categoryHeaderElement = document.getElementById("category-header");

  if (assigneeHeaderElement) assigneeHeaderElement.addEventListener("click", toggleAssigneeDropdown);
  if (categoryHeaderElement) categoryHeaderElement.addEventListener("click", toggleCategoryDropdown);
}

function toggleAssigneeDropdown() {
  toggleDropdownById("assignee-dropdown");
  closeDropdownById("category-dropdown");
}

function toggleCategoryDropdown() {
  toggleDropdownById("category-dropdown");
  closeDropdownById("assignee-dropdown");
}

function toggleDropdownById(dropdownId) {
  const dropdownElement = document.getElementById(dropdownId);
  if (!dropdownElement) return;
  dropdownElement.classList.toggle("d-none");
}

function closeDropdownById(dropdownId) {
  const dropdownElement = document.getElementById(dropdownId);
  if (!dropdownElement) return;
  dropdownElement.classList.add("d-none");
}

function registerCategoryOptionEvents() {
  const optionElements = document.querySelectorAll("#category-dropdown .category-option");
  optionElements.forEach((optionElement) => {
    optionElement.addEventListener("click", () => selectCategory(optionElement.dataset.category));
  });
}

/** Setzt Kategorie, Placeholder und Fehlerzustand. */
function selectCategory(categoryValue) {
  setCategoryHiddenInput(categoryValue);
  setCategoryPlaceholderText(categoryValue);
  closeDropdownById("category-dropdown");
  removeCategoryError();
}

function setCategoryHiddenInput(categoryValue) {
  const hiddenInputElement = document.getElementById("category");
  if (!hiddenInputElement) return;
  hiddenInputElement.value = categoryValue || "";
}

function setCategoryPlaceholderText(categoryValue) {
  const placeholderElement = document.getElementById("selected-category-placeholder");
  if (!placeholderElement) return;

  if (categoryValue === "technical-task") placeholderElesment.textContent = "Technical Task";
  if (categoryValue === "user-story") placeholderElement.textContent = "User Story";
  if (!categoryValue) placeholderElement.textContent = "Select category";
}

function removeCategoryError() {
  const errorElement = document.getElementById("error-category");
  if (!errorElement) return;
  errorElement.classList.remove("active");
}