let boardEditAssigneeEventsBound = false;

/**
 * Returns the active contact list for the board page.
 * @returns {Array}
 */
function getBoardContacts() {
  if (typeof contactCollection !== "undefined" && Array.isArray(contactCollection)) {
    return contactCollection;
  }

  if (typeof contacts !== "undefined") {
    if (Array.isArray(contacts)) return contacts;

    if (contacts && typeof contacts === "object") {
      return Object.values(contacts).map((contact) => ({
        name: contact.name || contact.contactName || "",
        color: contact.color || "#CCCCCC",
      }));
    }
  }

  return [];
}

/**
 * Returns the edit overlay root element.
 * @returns {HTMLElement|null}
 */
function getEditOverlayRoot() {
  return document.getElementById("edit_task_overlay");
}

/**
 * Finds one element inside the edit overlay.
 * @param {string} selector
 * @returns {HTMLElement|null}
 */
function getEditOverlayElement(selector) {
  const root = getEditOverlayRoot();
  return root ? root.querySelector(selector) : null;
}

/**
 * Returns all selected assignees from the edit overlay only.
 * @returns {Array}
 */
function getBoardEditSelectedAssignees() {
  const root = getEditOverlayRoot();
  if (!root) return [];

  const checkboxNodeList = root.querySelectorAll(
    '#assignee-dropdown input[type="checkbox"]:checked'
  );

  return Array.from(checkboxNodeList).map((checkboxElement) => ({
    name: checkboxElement.dataset.name || "",
    color: checkboxElement.dataset.color || "#CCCCCC",
  }));
}

/**
 * Updates placeholder and avatar preview inside the edit overlay only.
 */
function updateBoardEditAssigneeDisplay() {
  const avatarContainer = getEditOverlayElement("#selected-assignee-avatars");
  const placeholder = getEditOverlayElement("#selected-assignees-placeholder");

  if (!avatarContainer || !placeholder) return;

  const selectedAssignees = getBoardEditSelectedAssignees();

  avatarContainer.innerHTML = "";

  selectedAssignees.forEach((assigneeObject) => {
    const avatarElement = document.createElement("div");
    avatarElement.className = "avatar";
    avatarElement.textContent = getInitials(assigneeObject.name);
    avatarElement.style.backgroundColor = assigneeObject.color;
    avatarContainer.appendChild(avatarElement);
  });

  placeholder.textContent =
    selectedAssignees.length > 0
      ? "Selected contacts"
      : "Select contacts to assign";
}

/**
 * Closes the edit overlay assignee dropdown.
 */
function closeBoardEditAssigneeDropdown() {
  getEditOverlayElement("#assignee-dropdown")?.classList.add("d-none");
}

/**
 * Toggles the edit overlay assignee dropdown.
 * @param {MouseEvent} clickEvent
 */
function toggleBoardEditAssigneeDropdown(clickEvent) {
  clickEvent.stopPropagation();
  getEditOverlayElement("#assignee-dropdown")?.classList.toggle("d-none");
}

/**
 * Binds dropdown events for the board edit overlay once per rendered header.
 */
function bindBoardEditDropdownEvents() {
  const headerElement = getEditOverlayElement("#assignee-header");
  const dropdownElement = getEditOverlayElement("#assignee-dropdown");

  if (!headerElement || !dropdownElement) return;
  if (headerElement.dataset.dropdownBound === "true") return;

  headerElement.addEventListener("click", toggleBoardEditAssigneeDropdown);
  headerElement.dataset.dropdownBound = "true";

  if (!boardEditAssigneeEventsBound) {
    document.addEventListener("click", (clickEvent) => {
      const root = getEditOverlayRoot();
      if (!root || !root.classList.contains("active")) return;

      const multiselectContainer = root.querySelector(".custom-multiselect");
      if (!multiselectContainer?.contains(clickEvent.target)) {
        closeBoardEditAssigneeDropdown();
      }
    });

    boardEditAssigneeEventsBound = true;
  }
}

/**
 * Creates one board-edit assignee option label.
 * @param {Object} contact
 * @returns {HTMLElement}
 */
function createBoardEditAssigneeLabel(contact) {
  const displayName =
    typeof getAssigneeDisplayName === "function"
      ? getAssigneeDisplayName(contact)
      : contact.name;

  const label = document.createElement("label");
  label.className = "assignee-row";
  label.innerHTML = `
    <div class="assignee-left" tabindex="0" role="button">
      <div class="assignee-initials" style="background-color: ${contact.color};">
        ${getInitials(contact.name)}
      </div>
      <span class="assignee-name">${displayName}</span>
    </div>
    <input
      class="assignee-checkbox"
      type="checkbox"
      data-name="${contact.name}"
      data-color="${contact.color}"
    >
  `;

  const leftElement = label.querySelector(".assignee-left");
  const checkboxElement = label.querySelector(".assignee-checkbox");

  if (leftElement && checkboxElement) {
    leftElement.addEventListener("click", (clickEvent) => {
      clickEvent.stopPropagation();
      checkboxElement.checked = !checkboxElement.checked;
      label.classList.toggle("name-selected", checkboxElement.checked);
      updateBoardEditAssigneeDisplay();
    });

    leftElement.addEventListener("keydown", (keyboardEvent) => {
      if (keyboardEvent.key !== "Enter" && keyboardEvent.key !== " ") return;
      keyboardEvent.preventDefault();
      leftElement.click();
    });

    checkboxElement.addEventListener("change", () => {
      label.classList.toggle("name-selected", checkboxElement.checked);
      updateBoardEditAssigneeDisplay();
    });
  }

  return label;
}

/**
 * Checks whether a contact is already assigned to the task.
 * @param {Object} contact
 * @param {Array} taskAssignees
 * @returns {boolean}
 */
function isBoardEditContactAssigned(contact, taskAssignees = []) {
  return taskAssignees.some(
    (assignee) =>
      assignee.name === contact.name && assignee.color === contact.color
  );
}

/**
 * Appends one assignee option to the edit dropdown.
 * @param {HTMLElement} assigneeDropdown
 * @param {Object} contact
 * @param {Array} taskAssignees
 */
function appendBoardEditAssigneeOption(assigneeDropdown, contact, taskAssignees) {
  const assigneeLabel = createBoardEditAssigneeLabel(contact);

  if (isBoardEditContactAssigned(contact, taskAssignees)) {
    const checkbox = assigneeLabel.querySelector(".assignee-checkbox");
    if (checkbox) checkbox.checked = true;
    assigneeLabel.classList.add("name-selected");
  }

  assigneeDropdown.appendChild(assigneeLabel);
}

/**
 * Renders edit assignees dropdown for the board edit overlay.
 * @param {Array} taskAssignees
 */
function renderEditAssignees(taskAssignees = []) {
  const assigneeDropdown = getEditOverlayElement("#assignee-dropdown");
  if (!assigneeDropdown) return;

  assigneeDropdown.innerHTML = "";
  assigneeDropdown.classList.add("d-none");

  getBoardContacts().forEach((contact) =>
    appendBoardEditAssigneeOption(assigneeDropdown, contact, taskAssignees)
  );

  bindBoardEditDropdownEvents();
  updateBoardEditAssigneeDisplay();
}