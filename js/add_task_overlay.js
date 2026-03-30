/**
 * add_task_overlay.js
 * - Initialisiert Formular, Kontakte, Dropdowns, Priorität-Icons und Subtasks.
 * - Nutzt dieselbe Kontaktlogik wie add_task.
 */

document.addEventListener("DOMContentLoaded", initializeAddTaskPage);


let contactCollection = [];

/* =========================
   PAGE INITIALIZATION
   ========================= */

async function initializeAddTaskPage() {
  setMinimumDateToToday();
  registerUserInterfaceEvents();
  await loadContacts();
  initializePriorityIconHandlers();
  renderSubtaskList();
}

function registerUserInterfaceEvents() {
  registerFormSubmitHandler();
  registerDropdownEvents();
  registerCategoryOptionEvents();
  registerSubtaskEvents();
  registerClearButtonEvent();
  registerLiveValidationHandlers();
  registerGlobalClickHandler();
}

function setMinimumDateToToday() {
  const dateInputElement = document.getElementById("due-date");
  if (!dateInputElement) return;
  dateInputElement.min = new Date().toISOString().split("T")[0];
}

function registerFormSubmitHandler() {
  const taskFormElement = document.getElementById("taskForm");
  if (!taskFormElement) return;
  taskFormElement.addEventListener("submit", handleFormSubmit);
}

function registerClearButtonEvent() {
  const clearButtonElement = document.getElementById("clear-form-button");
  if (!clearButtonElement) return;
  clearButtonElement.addEventListener("click", handleClear);
}

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

function registerCategoryOptionEvents() {
  const optionElements = document.querySelectorAll("#category-dropdown .category-option");
  optionElements.forEach((optionElement) => {
    optionElement.addEventListener("click", () => {
      selectCategory(optionElement.dataset.category);
    });
  });
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
  if (!containerElement.contains(mouseEvent.target)) dropdownElement.classList.add("d-none");
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
   CONTACTS / ASSIGNEES
   ========================= */

async function loadContacts() {
  if (typeof loadData !== "function") {
    console.error("loadData is not available");
    return;
  }

  const isGuestUser = isGuestSessionUser();
  const sourcePaths = isGuestUser
    ? ["guest-contacts/", "contacts/"]
    : ["contacts/"];

  const mergedContactsObject = await loadMergedContactsFromPaths(sourcePaths);

  if (!isGuestUser && typeof includeLoggedInUserInAddTaskContacts === "function") {
    await includeLoggedInUserInAddTaskContacts(mergedContactsObject);
  }

  let normalizedContacts = Object.values(mergedContactsObject)
    .map(mapContact)
    .filter((contactObject) => contactObject.name.length > 0);

  normalizedContacts = deduplicateContacts(normalizedContacts);

  if (normalizedContacts.length === 0) {
    normalizedContacts = GUEST_CONTACTS_FALLBACK.map(mapContact);
  }

  contactCollection = normalizedContacts.sort((firstContact, secondContact) =>
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
  contactCollection.forEach((contactItem) => {
    dropdownElement.appendChild(buildAssigneeRow(contactItem));
  });
}

function buildAssigneeRow(contactItem) {
  const rowElement = document.createElement("div");
  rowElement.className = "assignee-row";
  rowElement.innerHTML = getAssigneeRowMarkup(contactItem);
  attachAssigneeRowHandlers(rowElement);
  return rowElement;
}

function getAssigneeRowMarkup(contactItem) {
  const initialsText = getInitials(contactItem.name);
  return `
    <div class="assignee-left" tabindex="0" role="button" aria-label="Toggle assignee">
      <div class="assignee-initials" style="background-color:${contactItem.color};">${initialsText}</div>
      <span class="assignee-name">${escapeHtmlText(contactItem.name)}</span>
    </div>
    <input
      class="assignee-checkbox"
      type="checkbox"
      data-name="${escapeHtmlText(contactItem.name)}"
      data-color="${contactItem.color}"
    >
  `;
}

function attachAssigneeRowHandlers(rowElement) {
  const clickAreaElement = rowElement.querySelector(".assignee-left");
  const checkboxElement = rowElement.querySelector(".assignee-checkbox");
  if (!clickAreaElement || !checkboxElement) return;

  clickAreaElement.addEventListener("click", () => toggleAssigneeSelection(rowElement, checkboxElement));
  clickAreaElement.addEventListener("keydown", (keyboardEvent) =>
    handleAssigneeKeydown(keyboardEvent, rowElement, checkboxElement)
  );

  checkboxElement.addEventListener("change", () => {
    rowElement.classList.toggle("name-selected", checkboxElement.checked);
    updateAssigneeDisplay();
  });
}

function handleAssigneeKeydown(keyboardEvent, rowElement, checkboxElement) {
  if (keyboardEvent.key !== "Enter" && keyboardEvent.key !== " ") return;
  keyboardEvent.preventDefault();
  toggleAssigneeSelection(rowElement, checkboxElement);
}

function toggleAssigneeSelection(rowElement, checkboxElement) {
  checkboxElement.checked = !checkboxElement.checked;
  rowElement.classList.toggle("name-selected", checkboxElement.checked);
  updateAssigneeDisplay();
}

function updateAssigneeDisplay() {
  const selectedAssignees = getSelectedAssignees();
  renderAssigneeAvatars(selectedAssignees);
  updateAssigneePlaceholder(selectedAssignees.length);
}

function getSelectedAssignees() {
  const checkboxElements = document.querySelectorAll("#assignee-dropdown .assignee-checkbox:checked");
  return Array.from(checkboxElements).map((checkboxElement) => ({
    name: checkboxElement.dataset.name || "",
    color: checkboxElement.dataset.color || "#CCCCCC",
  }));
}

function renderAssigneeAvatars(selectedAssignees) {
  const avatarContainer = document.getElementById("selected-assignee-avatars");
  if (!avatarContainer) return;

  avatarContainer.innerHTML = "";
  selectedAssignees.forEach((assigneeItem) => {
    avatarContainer.appendChild(buildAvatar(assigneeItem));
  });
}

function buildAvatar(assigneeItem) {
  const avatarElement = document.createElement("div");
  avatarElement.className = "avatar";
  avatarElement.textContent = getInitials(assigneeItem.name);
  avatarElement.style.backgroundColor = assigneeItem.color;
  return avatarElement;
}

function updateAssigneePlaceholder(selectedCount) {
  const placeholderElement = document.getElementById("selected-assignees-placeholder");
  if (!placeholderElement) return;
  placeholderElement.textContent = selectedCount === 0 ? "Select contacts to assign" : "Selected contacts";
}

function getInitials(fullName = "") {
  return String(fullName)
    .split(" ")
    .filter((namePart) => namePart.length > 0)
    .map((namePart) => namePart[0].toUpperCase())
    .join("");
}

/* =========================
   CATEGORY
   ========================= */

function toggleAssigneeDropdown() {
  toggleDropdownVisibility("assignee-dropdown");
  closeDropdown("category-dropdown");
}

function toggleCategoryDropdown() {
  toggleDropdownVisibility("category-dropdown");
  closeDropdown("assignee-dropdown");
}

function toggleDropdownVisibility(dropdownId) {
  const dropdownElement = document.getElementById(dropdownId);
  if (!dropdownElement) return;
  dropdownElement.classList.toggle("d-none");
}

function closeDropdown(dropdownId) {
  const dropdownElement = document.getElementById(dropdownId);
  if (!dropdownElement) return;
  dropdownElement.classList.add("d-none");
}

function selectCategory(categoryValue) {
  setCategoryHiddenValue(categoryValue);
  setCategoryPlaceholder(categoryValue);
  closeDropdown("category-dropdown");
  hideCategoryError();
}

function setCategoryHiddenValue(categoryValue) {
  const categoryInputElement = document.getElementById("category");
  if (!categoryInputElement) return;
  categoryInputElement.value = categoryValue || "";
}

function setCategoryPlaceholder(categoryValue) {
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

function hideCategoryError() {
  const categoryInputElement = document.getElementById("category");
  const categoryErrorElement = document.getElementById("error-category");

  if (categoryInputElement) categoryInputElement.classList.remove("input-error");
  if (categoryErrorElement) categoryErrorElement.classList.remove("active");
}

/* =========================
   FORM VALIDATION / SAVE
   ========================= */

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

function validateRequiredField(inputId, errorId) {
  const inputElement = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);
  if (!inputElement || !errorElement) return false;
  return setFieldValidity(inputElement, errorElement, inputElement.value.trim().length > 0);
}

function validateCategoryField() {
  const inputElement = document.getElementById("category");
  const errorElement = document.getElementById("error-category");
  if (!inputElement || !errorElement) return false;
  return setFieldValidity(inputElement, errorElement, inputElement.value.trim().length > 0);
}

function setFieldValidity(inputElement, errorElement, isValid) {
  inputElement.classList.toggle("input-error", !isValid);
  errorElement.classList.toggle("active", !isValid);
  return isValid;
}

function collectTaskData() {
  return {
    category: readInputValue("category"),
    title: readInputValue("title"),
    description: readInputValue("description"),
    dueDate: readInputValue("due-date"),
    priority: getSelectedPriorityValue(),
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

function getSelectedPriorityValue() {
  const checkedElement = document.querySelector('input[name="priority"]:checked');
  return checkedElement ? checkedElement.value : "medium";
}

async function saveTask(taskObject) {
  try {
    await postData("task", taskObject);
    alert("Task successfully saved!");
    handleClear();
  } catch (errorObject) {
    console.error("Saving failed:", errorObject);
    alert("Saving failed. Check console/network tab.");
  }
}

function handleClear() {
  const taskFormElement = document.getElementById("taskForm");
  if (taskFormElement) taskFormElement.reset();
  resetSubtasks();
  resetAssignees();
  resetCategory();
  updatePriorityIcons();
}

function resetAssignees() {
  document.querySelectorAll('#assignee-dropdown input[type="checkbox"]').forEach((checkboxElement) => {
    checkboxElement.checked = false;
    checkboxElement.closest(".assignee-row")?.classList.remove("name-selected");
  });
  updateAssigneeDisplay();
}

function resetCategory() {
  const categoryInputElement = document.getElementById("category");
  const placeholderElement = document.getElementById("selected-category-placeholder");
  if (categoryInputElement) categoryInputElement.value = "";
  if (placeholderElement) placeholderElement.textContent = "Select category";
  hideCategoryError();
}