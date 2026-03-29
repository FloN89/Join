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

// Validierungsfunktionen wurden nach add_task_validation.js ausgelagert

/* =========================
   KONTAKTE LADEN / ASSIGNEES
========================= */

/**
 * Lädt Kontakte (Guest oder User) und rendert Dropdown-Optionen.
 */
async function loadContacts() {
  const isGuestUser = isGuestSessionUser();

  if (isGuestUser) {
    const rawGuestContacts = (await loadData("guest-contacts/")) || {};
    const guestContactList = normalizeContacts(rawGuestContacts, true);

    contacts = sanitizeContacts(guestContactList).sort((firstContact, secondContact) =>
      firstContact.name.localeCompare(secondContact.name, "de")
    );

    renderAssigneeOptions();
    return;
  }

  const rawContacts = (await loadData("contacts/")) || {};
  const contactsObject = Array.isArray(rawContacts)
    ? Object.fromEntries(rawContacts.map((contactObject, index) => [index, contactObject]))
    : { ...rawContacts };

  await includeLoggedInUserInAddTaskContacts(contactsObject);

  contacts = Object.values(contactsObject)
    .map(mapContact)
    .filter((contactObject) => contactObject.name.length > 0)
    .sort((firstContact, secondContact) =>
      firstContact.name.localeCompare(secondContact.name, "de")
    );

  renderAssigneeOptions();
}

/**
 * Prüft, ob der aktuelle User ein Guest ist.
 * @returns {boolean}
 */
function isGuestSessionUser() {
  const userId = sessionStorage.getItem("userId");
  return !userId || userId === "guest";
}

/**
 * Ergänzt den eingeloggten User in der Kontaktliste,
 * falls er noch nicht unter contacts/ existiert.
 * @param {Object} contactsObject
 */
async function includeLoggedInUserInAddTaskContacts(contactsObject) {
  const userId = sessionStorage.getItem("userId");
  if (!userId || userId === "guest" || contactsObject[userId]) return;

  const user = await loadData("users/" + userId);
  if (!user) return;

  contactsObject[userId] = {
    contactName: String(user.username || user.name || "").trim(),
    contactMail: String(user.mail || "").trim(),
    contactPhone: String(user.phone || "").trim(),
    color: user.color || "#CCCCCC",
  };
}

/**
 * Normalisiert Rohdaten zu einer Kontaktliste.
 * @param {*} rawContacts
 * @param {boolean} isGuestUser
 * @returns {Array}
 */
function normalizeContacts(rawContacts, isGuestUser) {
  const contactList = Array.isArray(rawContacts)
    ? rawContacts
    : Object.values(rawContacts);

  if (isGuestUser && contactList.length === 0) return GUEST_CONTACTS_FALLBACK;
  return contactList;
}

/**
 * Bereinigt die Kontaktliste.
 * @param {Array} contactList
 * @returns {Array}
 */
function sanitizeContacts(contactList) {
  return contactList
    .map(mapContact)
    .filter((contactObject) => contactObject.name.length > 0);
}

/**
 * Mappt Kontaktobjekte aus contacts/ auf das Format für Assigned to.
 * @param {Object} contactObject
 * @returns {Object}
 */
function mapContact(contactObject = {}) {
  const name = String(
    contactObject.contactName ||
    contactObject.name ||
    contactObject.contactMail ||
    ""
  ).trim();

  return {
    name,
    mail: String(contactObject.contactMail || contactObject.mail || "").trim(),
    phone: String(contactObject.contactPhone || contactObject.phone || "").trim(),
    color: contactObject.color || "#CCCCCC",
  };
}

// Assignee-Funktionen wurden nach add_task_assignees.js ausgelagert

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

/**
 * Register dropdown events
 */
function registerDropdownEvents() {
  const assigneeHeaderElement = document.getElementById("assignee-header");
  const categoryHeaderElement = document.getElementById("category-header");

  if (assigneeHeaderElement) assigneeHeaderElement.addEventListener("click", toggleAssigneeDropdown);
  if (categoryHeaderElement) categoryHeaderElement.addEventListener("click", toggleCategoryDropdown);
}

/**
 * Toggle assignee dropdown
 * @returns {void} Return value
 */
function toggleAssigneeDropdown() {
  toggleDropdownById("assignee-dropdown");
  closeDropdownById("category-dropdown");
}

/**
 * Toggle category dropdown
 * @returns {void} Return value
 */
function toggleCategoryDropdown() {
  toggleDropdownById("category-dropdown");
  closeDropdownById("assignee-dropdown");
}

/**
 * Toggle dropdown by id
 * @param {string} dropdownId - ID value
 * @returns {void} Return value
 */
function toggleDropdownById(dropdownId) {
  const dropdownElement = document.getElementById(dropdownId);
  if (!dropdownElement) return;
  dropdownElement.classList.toggle("d-none");
}

/**
 * Close dropdown by id
 * @param {string} dropdownId - ID value
 */
function closeDropdownById(dropdownId) {
  const dropdownElement = document.getElementById(dropdownId);
  if (!dropdownElement) return;
  dropdownElement.classList.add("d-none");
}

/**
 * Register category option events
 */
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

/**
 * Set category hidden input
 * @param {*} categoryValue - Categoryvalue value
 */
function setCategoryHiddenInput(categoryValue) {
  const hiddenInputElement = document.getElementById("category");
  if (!hiddenInputElement) return;
  hiddenInputElement.value = categoryValue || "";
}

/**
 * Set category placeholder text
 * @param {*} categoryValue - Categoryvalue value
 */
function setCategoryPlaceholderText(categoryValue) {
  const placeholderElement = document.getElementById("selected-category-placeholder");
  if (!placeholderElement) return;

  if (categoryValue === "technical-task") {
    placeholderElement.textContent = "Technical Task";
  } else if (categoryValue === "user-story") {
    placeholderElement.textContent = "User Story";
  } else {
    placeholderElement.textContent = "Select category";
  }
}
/**
 * Remove category error
 */
function removeCategoryError() {
  const errorElement = document.getElementById("error-category");
  if (!errorElement) return;
  errorElement.classList.remove("active");
}