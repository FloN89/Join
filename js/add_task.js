/**
 * Add-Task Seite:
 * - Initialisiert Events, setzt Mindestdatum, lädt Kontakte
 * - Steuert Dropdowns, Kategorie, Prioritäts-Icons
 * - Verwaltet Subtasks (Add/Edit/Delete)
 * - Speichert Task-Daten via postData()
 */
document.addEventListener("DOMContentLoaded", initializeAddTaskPage);

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

/**
 * Registriert alle Event-Listener (keine Inline-onclicks nötig).
 */
function registerUserInterfaceEvents() {
  registerFormSubmitEvent();
  registerDropdownEvents();
  registerCategoryOptionEvents();
  registerSubtaskEvents();
  registerClearButtonEvent();
  registerGlobalClickHandler();
}

/**
 * Registriert globalen Klick-Handler zum Schließen offener Dropdowns.
 */
function registerGlobalClickHandler() {
  document.addEventListener("click", handleOutsideClick);
}

/**
 * Schließt Dropdowns, wenn außerhalb geklickt wird.
 * @param {MouseEvent} mouseEvent
 */
function handleOutsideClick(mouseEvent) {
  closeDropdownIfClickedOutside("assignee-dropdown", ".custom-multiselect", mouseEvent);
  closeDropdownIfClickedOutside("category-dropdown", ".custom-category-select", mouseEvent);
}

/**
 * Schließt ein Dropdown, wenn der Klick außerhalb seines Containers stattfindet.
 * @param {string} dropdownId
 * @param {string} containerSelector
 * @param {MouseEvent} mouseEvent
 */
function closeDropdownIfClickedOutside(dropdownId, containerSelector, mouseEvent) {
  const dropdownElement = document.getElementById(dropdownId);
  const containerElement = document.querySelector(containerSelector);

  if (!dropdownElement || !containerElement) return;
  if (!containerElement.contains(mouseEvent.target)) {
    dropdownElement.classList.add("d-none");
  }
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

  const taskObject = {
    ...collectTaskData(),
    status: "todo",
  };

  try {
    await postData(getTaskCollectionPath(), taskObject);
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
 * Für Guests werden beide Quellen berücksichtigt:
 * - guest-contacts/
 * - contacts/
 */
async function loadContacts() {
  const isGuestUser = isGuestSessionUser();
  const sourcePaths = isGuestUser
    ? ["guest-contacts/", "contacts/"]
    : ["contacts/"];

  const mergedContactsObject = await loadMergedContactsFromPaths(sourcePaths);

  if (!isGuestUser) {
    await includeLoggedInUserInAddTaskContacts(mergedContactsObject);
  }

  let normalizedContacts = Object.values(mergedContactsObject)
    .map(mapContact)
    .filter((contactObject) => contactObject.name.length > 0);

  normalizedContacts = deduplicateContacts(normalizedContacts);

  if (isGuestUser && normalizedContacts.length === 0) {
    normalizedContacts = getGuestContactsFallback().map(mapContact);
  }

  contacts = normalizedContacts.sort((firstContact, secondContact) =>
    firstContact.name.localeCompare(secondContact.name, "de")
  );

  renderAssigneeOptions();
  updateAssigneeDisplay();
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
 * Lädt mehrere Kontaktquellen und merged sie in ein Objekt.
 * @param {string[]} sourcePaths
 * @returns {Promise<Object>}
 */
async function loadMergedContactsFromPaths(sourcePaths) {
  const mergedContactsObject = {};

  for (const sourcePath of sourcePaths) {
    const rawContacts = (await loadData(sourcePath)) || {};
    const normalizedObject = normalizeRawContactsToObject(rawContacts, sourcePath);

    Object.entries(normalizedObject).forEach(([contactId, contactObject]) => {
      mergedContactsObject[contactId] = contactObject;
    });
  }

  return mergedContactsObject;
}

/**
 * Normalisiert Rohdaten in ein Objekt mit stabilen Keys.
 * @param {*} rawContacts
 * @param {string} sourcePath
 * @returns {Object}
 */
function normalizeRawContactsToObject(rawContacts, sourcePath = "") {
  if (Array.isArray(rawContacts)) {
    return Object.fromEntries(
      rawContacts.map((contactObject, index) => [
        `${sourcePath}${index}`,
        contactObject,
      ])
    );
  }

  if (rawContacts && typeof rawContacts === "object") {
    return { ...rawContacts };
  }

  return {};
}

/**
 * Ergänzt den eingeloggten User in die Kontaktliste, falls noch nicht vorhanden.
 * @param {Object} contactsObject
 */
async function includeLoggedInUserInAddTaskContacts(contactsObject) {
  const userId = sessionStorage.getItem("userId");
  if (!userId || userId === "guest" || contactsObject[userId]) return;

  const userObject = await loadData(`users/${userId}`);
  if (!userObject) return;

  contactsObject[userId] = {
    contactName: String(userObject.username || userObject.name || "").trim(),
    contactMail: String(userObject.mail || "").trim(),
    contactPhone: String(userObject.phone || "").trim(),
    color: userObject.color || "#CCCCCC",
  };
}

/**
 * Fallback-Kontakte für Guest-Session.
 * @returns {Array}
 */
function getGuestContactsFallback() {
  if (
    typeof GUEST_CONTACTS_FALLBACK !== "undefined" &&
    Array.isArray(GUEST_CONTACTS_FALLBACK)
  ) {
    return GUEST_CONTACTS_FALLBACK;
  }

  if (typeof guestContacts === "object" && guestContacts !== null) {
    return Object.values(guestContacts);
  }

  return [
    { name: "Sofia Müller", color: "#ff7a00" },
    { name: "Max Mustermann", color: "#9327ff" },
    { name: "Anna Schmidt", color: "#6e52ff" },
  ];
}

/**
 * Entfernt doppelte Kontakte anhand von Name + Mail.
 * @param {Array} contactList
 * @returns {Array}
 */
function deduplicateContacts(contactList) {
  const seenKeys = new Set();

  return contactList.filter((contactObject) => {
    const uniqueKey = `${String(contactObject.name || "").trim().toLowerCase()}|${String(
      contactObject.mail || ""
    )
      .trim()
      .toLowerCase()}`;

    if (seenKeys.has(uniqueKey)) return false;
    seenKeys.add(uniqueKey);
    return true;
  });
}

/**
 * Mappt Kontaktobjekte auf das Format für Assigned to.
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
  return String(fullName)
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

/*** Register category option events*/
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

/*** Set category hidden input
 * @param {*} categoryValue - Categoryvalue value*/
function setCategoryHiddenInput(categoryValue) {
  const hiddenInputElement = document.getElementById("category");
  if (!hiddenInputElement) return;
  hiddenInputElement.value = categoryValue || "";
}

/*** Set category placeholder text
 * @param {*} categoryValue - Categoryvalue value*/
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
/*** Remove category error*/
function removeCategoryError() {
  const errorElement = document.getElementById("error-category");
  if (!errorElement) return;
  errorElement.classList.remove("active");
}