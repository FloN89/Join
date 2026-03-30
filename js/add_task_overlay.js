document.addEventListener("DOMContentLoaded", initializeAddTaskOverlay);

let addTaskOverlayContacts = [];

/* =========================
   INITIALISIERUNG
========================= */

async function initializeAddTaskOverlay() {
  setMinimumDateToToday();
  registerUserInterfaceEvents();
  await loadContacts();
  initializePriorityIconHandlers();
  renderSubtaskList();
}

function registerUserInterfaceEvents() {
  registerFormSubmitEvent();
  registerDropdownEvents();
  registerCategoryOptionEvents();
  registerSubtaskEvents();
  registerClearButtonEvent();
  registerValidationLiveEvents();
  registerGlobalClickHandler();
}

function setMinimumDateToToday() {
  const dateInputElement = document.getElementById("due-date");
  if (!dateInputElement) return;
  dateInputElement.min = new Date().toISOString().split("T")[0];
}

/* =========================
   OVERLAY OPEN / CLOSE
========================= */

function openAddTaskOverlay() {
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
   FORM / BUTTONS
========================= */

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

async function handleFormSubmit(submitEvent) {
  submitEvent.preventDefault();

  const submitButtonElement = document.querySelector(".create-btn");
  if (submitButtonElement) submitButtonElement.disabled = true;

  try {
    if (!validateForm()) return;

    const taskObject = collectTaskData();
    await postData("task", taskObject);

    handleClear();
    closeAddTaskOverlay();
    window.dispatchEvent(new CustomEvent("task-created", { detail: taskObject }));
  } catch (saveError) {
    console.error("Saving failed:", saveError);
    alert("Saving failed. Check console/network tab.");
  } finally {
    if (submitButtonElement) submitButtonElement.disabled = false;
  }
}

/* =========================
   KONTAKTE LADEN / ASSIGNEES
========================= */

async function loadContacts() {
  if (typeof loadData !== "function") {
    console.error("loadData is not available");
    return;
  }

  const isGuestUser = isGuestSessionUser();
  const sourcePaths = isGuestUser ? ["guest-contacts/", "contacts/"] : ["contacts/"];
  const mergedContactsObject = await loadMergedContactsFromPaths(sourcePaths);

  if (!isGuestUser) {
    await ensureLoggedInUserInAddTaskContacts(mergedContactsObject);
  }

  let normalizedContacts = Object.values(mergedContactsObject)
    .map(mapContact)
    .filter((contactObject) => contactObject.name.length > 0);

  normalizedContacts = deduplicateContacts(normalizedContacts);

  if (normalizedContacts.length === 0) {
    normalizedContacts = getGuestContactsFallback().map(mapContact);
  }

  addTaskOverlayContacts = normalizedContacts.sort((firstContact, secondContact) =>
    firstContact.name.localeCompare(secondContact.name, "de")
  );

  renderAssigneeOptions();
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
      rawContacts.map((contactObject, index) => [`${sourcePath}${index}`, contactObject])
    );
  }

  if (rawContacts && typeof rawContacts === "object") {
    return { ...rawContacts };
  }

  return {};
}

async function ensureLoggedInUserInAddTaskContacts(contactsObject) {
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
    ).trim().toLowerCase()}`;

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

function renderAssigneeOptions() {
  const dropdownElement = document.getElementById("assignee-dropdown");
  if (!dropdownElement) return;

  dropdownElement.innerHTML = "";
  addTaskOverlayContacts.forEach((contactObject) => {
    dropdownElement.appendChild(createAssigneeRow(contactObject));
  });
}

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
    <div class="assignee-left" tabindex="0" role="button" aria-label="Toggle assignee">
      <div class="assignee-initials" style="background-color: ${contactObject.color};">
        ${initialsText}
      </div>
      <span class="assignee-name">${escapeHtmlText(contactObject.name)}</span>
    </div>

    <input
      class="assignee-checkbox"
      type="checkbox"
      data-name="${escapeHtmlText(contactObject.name)}"
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
  assignedToList.forEach((assigneeObject) => {
    containerElement.appendChild(buildAvatarElement(assigneeObject));
  });
}

function buildAvatarElement(assigneeObject) {
  const avatarElement = document.createElement("div");
  avatarElement.className = "avatar";
  avatarElement.textContent = getInitials(assigneeObject.name);
  avatarElement.style.backgroundColor = assigneeObject.color;
  return avatarElement;
}

function setAssigneePlaceholderText(placeholderElement, selectedAssignees) {
  placeholderElement.textContent =
    selectedAssignees.length > 0 ? "Selected contacts" : "Select contacts to assign";
}

function getSelectedAssignees() {
  const checkboxNodeList = document.querySelectorAll(
    '#assignee-dropdown input[type="checkbox"]:checked'
  );

  return Array.from(checkboxNodeList).map((checkboxElement) =>
    buildAssigneeFromCheckbox(checkboxElement)
  );
}

function buildAssigneeFromCheckbox(checkboxElement) {
  return {
    name: checkboxElement.dataset.name || "",
    color: checkboxElement.dataset.color || "#CCCCCC",
  };
}

function getInitials(fullName = "") {
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

function registerGlobalClickHandler() {
  document.addEventListener("click", handleOutsideClick);
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
   RESET + DATENSAMMLUNG
========================= */

function handleClear() {
  const taskFormElement = document.getElementById("taskForm");
  if (taskFormElement) taskFormElement.reset();

  resetAssignees();
  resetCategory();
  resetSubtasks();
  clearAllValidationErrors();
  closeTaskDropdowns();
  updatePriorityIcons();
}

function resetAssignees() {
  document.querySelectorAll('#assignee-dropdown input[type="checkbox"]').forEach((checkboxElement) => {
    checkboxElement.checked = false;
  });

  document.querySelectorAll("#assignee-dropdown .assignee-row").forEach((rowElement) => {
    rowElement.classList.remove("name-selected");
  });

  updateAssigneeDisplay();
}

function resetCategory() {
  setCategoryHiddenInput("");
  setCategoryPlaceholderText("");
  removeCategoryError();
}

function closeTaskDropdowns() {
  closeDropdownById("assignee-dropdown");
  closeDropdownById("category-dropdown");
}

function collectTaskData() {
  return {
    category: readInputValue("category"),
    title: readInputValue("title"),
    description: readInputValue("description"),
    dueDate: readInputValue("due-date"),
    priority: readSelectedPriority(),
    assignedTo: getSelectedAssignees(),
    subtasks:
      typeof structuredClone === "function"
        ? structuredClone(subtaskCollection)
        : JSON.parse(JSON.stringify(subtaskCollection)),
  };
}

function readInputValue(inputId) {
  const inputElement = document.getElementById(inputId);
  if (!inputElement) return "";
  return getTrimmedValue(inputElement.value);
}

function readSelectedPriority() {
  const selectedElement = document.querySelector('input[name="priority"]:checked');
  return selectedElement ? selectedElement.value : "medium";
}