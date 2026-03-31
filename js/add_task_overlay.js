let contacts = [];
let globalOverlayClickHandlerRegistered = false;

bootstrapAddTaskOverlay();

function bootstrapAddTaskOverlay() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAddTaskOverlay, { once: true });
    return;
  }

  initializeAddTaskOverlay();
}

async function initializeAddTaskOverlay() {
  const taskFormElement = document.getElementById("taskForm");
  if (!taskFormElement) return;
  if (taskFormElement.dataset.initialized === "true") return;

  taskFormElement.dataset.initialized = "true";

  setMinimumDateToToday();
  registerUserInterfaceEvents();

  if (typeof registerValidationLiveEvents === "function") {
    registerValidationLiveEvents();
  }

  await loadContacts();
  initializePriorityIconHandlers();
  renderSubtaskList();
  updateAssigneeDisplay();
}

window.initializeAddTaskOverlay = initializeAddTaskOverlay;

function setMinimumDateToToday() {
  const dateInputElement = document.getElementById("due-date");
  if (!dateInputElement) return;
  dateInputElement.min = new Date().toISOString().split("T")[0];
}

/* =========================
   OVERLAY OPEN / CLOSE
========================= */

function activateAddTaskOverlayUi() {
  const overlayElement = document.getElementById("add-task-overlay");
  if (!overlayElement) return;
  overlayElement.classList.add("active");
  document.body.classList.add("overlay-open");
}

function closeAddTaskOverlay() {
  const overlayElement = document.getElementById("add-task-overlay");
  if (!overlayElement) return;

  overlayElement.classList.remove("active");
  document.body.classList.remove("overlay-open");
}

function stopOverlayClick(mouseEvent) {
  mouseEvent.stopPropagation();
}

/* =========================
   EVENTS
========================= */

function registerUserInterfaceEvents() {
  registerFormSubmitEvent();
  registerDropdownEvents();
  registerCategoryOptionEvents();
  registerSubtaskEvents();
  registerClearButtonEvent();
  registerGlobalClickHandler();
}

function registerFormSubmitEvent() {
  const taskFormElement = document.getElementById("taskForm");
  if (!taskFormElement) return;

  taskFormElement.addEventListener("submit", handleFormSubmit);
}

function registerClearButtonEvent() {
  const clearButtonElement = document.getElementById("clear-form-button");
  if (!clearButtonElement) return;

  clearButtonElement.addEventListener("click", handleClear);
}

function registerGlobalClickHandler() {
  if (globalOverlayClickHandlerRegistered) return;

  document.addEventListener("click", handleOutsideClick);
  globalOverlayClickHandlerRegistered = true;
}

function handleOutsideClick(mouseEvent) {
  closeDropdownIfClickedOutside("assignee-dropdown", ".custom-multiselect", mouseEvent);
  closeDropdownIfClickedOutside("category-dropdown", ".custom-category-select", mouseEvent);
}

function closeDropdownIfClickedOutside(dropdownId, containerSelector, mouseEvent) {
  const dropdownElement = document.getElementById(dropdownId);
  const containerElement = document.querySelector(containerSelector);

  if (!dropdownElement || !containerElement) return;
  if (!containerElement.contains(mouseEvent.target)) {
    dropdownElement.classList.add("d-none");
  }
}

async function handleFormSubmit(submitEvent) {
  submitEvent.preventDefault();

  const submitButtonElement =
    submitEvent.submitter || document.querySelector("#taskForm .create-btn");

  if (submitButtonElement) submitButtonElement.disabled = true;

  try {
    if (!validateForm()) return;

    const taskObject = {
      ...collectTaskData(),
      status: window.currentBoardAddTaskStatus || "todo",
    };

    await postData(getTaskCollectionPath(), taskObject);

    handleClear();
    closeAddTaskOverlay();
    window.dispatchEvent(new CustomEvent("task-created", { detail: taskObject }));
  } catch (saveError) {
    console.error("Saving failed:", saveError);

    if (typeof showSavingFailedToast === "function") {
      showSavingFailedToast();
    } else {
      alert("Saving failed. Check console/network tab.");
    }
  } finally {
    if (submitButtonElement) submitButtonElement.disabled = false;
  }
}

/* =========================
   KONTAKTE / ASSIGNEES
========================= */

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

function isGuestSessionUser() {
  const userId = sessionStorage.getItem("userId");
  return !userId || userId === "guest";
}

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

function getGuestContactsFallback() {
  if (typeof GUEST_CONTACTS_FALLBACK !== "undefined" && Array.isArray(GUEST_CONTACTS_FALLBACK)) {
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

function registerDropdownEvents() {
  const assigneeHeaderElement = document.getElementById("assignee-header");
  const categoryHeaderElement = document.getElementById("category-header");

  if (assigneeHeaderElement) {
    assigneeHeaderElement.addEventListener("click", toggleAssigneeDropdown);
  }

  if (categoryHeaderElement) {
    categoryHeaderElement.addEventListener("click", toggleCategoryDropdown);
  }
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
    optionElement.addEventListener("click", () =>
      selectCategory(optionElement.dataset.category)
    );
  });
}

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
  hiddenInputElement.dispatchEvent(new Event("change", { bubbles: true }));
}

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

function removeCategoryError() {
  const categoryInputElement = document.getElementById("category");
  const errorElement = document.getElementById("error-category");

  if (categoryInputElement) categoryInputElement.classList.remove("input-error");
  if (errorElement) errorElement.classList.remove("active");
}

/* =========================
   HILFSFUNKTIONEN FÜR RESET
========================= */

function closeTaskDropdowns() {
  closeDropdownById("assignee-dropdown");
  closeDropdownById("category-dropdown");
}