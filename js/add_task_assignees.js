/* =========================
   KONTAKTE LADEN / ASSIGNEES
========================= */

/**
 * Renders all contacts as selectable rows
 */
function renderAssigneeOptions() {
  const dropdownElement = document.getElementById("assignee-dropdown");
  if (!dropdownElement) return;

  dropdownElement.innerHTML = "";
  contacts.forEach((contactObject) => dropdownElement.appendChild(createAssigneeRow(contactObject)));
}

/**
 * Creates assignee row with initials, name and checkbox
 * @param {Object} contactObject - Contact object with name and color
 * @returns {HTMLElement} Row element
 */
function createAssigneeRow(contactObject) {
  const rowElement = document.createElement("div");
  rowElement.className = "assignee-row";
  rowElement.innerHTML = buildAssigneeRowMarkup(contactObject);

  const leftElement = rowElement.querySelector(".assignee-left");
  const checkboxElement = rowElement.querySelector(".assignee-checkbox");

  registerAssigneeRowEvents(rowElement, leftElement, checkboxElement);
  return rowElement;
}

/**
 * Builds assignee row HTML markup
 * @param {Object} contactObject - Contact object
 * @returns {string} HTML markup
 */
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

/**
 * Registers events for assignee row
 * @param {HTMLElement} rowElement - Row DOM element
 * @param {HTMLElement} leftElement - Left section DOM element
 * @param {HTMLElement} checkboxElement - Checkbox DOM element
 */
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

/**
 * Checks if key is Enter or Space
 * @param {Event} keyboardEvent - Keyboard event
 * @returns {boolean} True if Enter or Space
 */
function isEnterOrSpace(keyboardEvent) {
  return keyboardEvent.key === "Enter" || keyboardEvent.key === " ";
}

/**
 * Toggles checkbox state
 * @param {HTMLElement} checkboxElement - Checkbox DOM element
 */
function toggleCheckbox(checkboxElement) {
  checkboxElement.checked = !checkboxElement.checked;
}

/**
 * Syncs row selection styling
 * @param {HTMLElement} rowElement - Row DOM element
 * @param {boolean} isSelected - Selection state
 */
function syncRowSelectionStyle(rowElement, isSelected) {
  if (isSelected) rowElement.classList.add("name-selected");
  if (!isSelected) rowElement.classList.remove("name-selected");
}

/**
 * Updates avatar display and placeholder text
 */
function updateAssigneeDisplay() {
  const avatarContainerElement = document.getElementById("selected-assignee-avatars");
  const placeholderElement = document.getElementById("selected-assignees-placeholder");
  if (!avatarContainerElement || !placeholderElement) return;

  const selectedAssignees = getSelectedAssignees();
  renderAssigneeAvatarContainer(avatarContainerElement, selectedAssignees);
  setAssigneePlaceholderText(placeholderElement, selectedAssignees);
}

/**
 * Renders assignee avatar container
 * @param {HTMLElement} containerElement - Container DOM element
 * @param {Array} assignedToList - Array of assignees
 */
function renderAssigneeAvatarContainer(containerElement, assignedToList) {
  containerElement.innerHTML = "";
  assignedToList.forEach((assigneeObject) => containerElement.appendChild(buildAvatarElement(assigneeObject)));
}

/**
 * Builds avatar element
 * @param {Object} assigneeObject - Assignee object
 * @returns {HTMLElement} Avatar element
 */
function buildAvatarElement(assigneeObject) {
  const avatarElement = document.createElement("div");
  avatarElement.className = "avatar";
  avatarElement.textContent = getInitials(assigneeObject.name);
  avatarElement.style.backgroundColor = assigneeObject.color;
  return avatarElement;
}

/**
 * Sets assignee placeholder text
 * @param {HTMLElement} placeholderElement - Placeholder DOM element
 * @param {Array} selectedAssignees - Array of selected assignees
 */
function setAssigneePlaceholderText(placeholderElement, selectedAssignees) {
  placeholderElement.textContent = selectedAssignees.length > 0 ? "Selected contacts" : "Select contacts to assign";
}

/**
 * Gets all selected assignees from dropdown
 * @returns {Array} Array of assignee objects
 */
function getSelectedAssignees() {
  const checkboxNodeList = document.querySelectorAll('#assignee-dropdown input[type="checkbox"]:checked');
  return Array.from(checkboxNodeList).map((checkboxElement) => buildAssigneeFromCheckbox(checkboxElement));
}

/**
 * Builds assignee object from checkbox
 * @param {HTMLElement} checkboxElement - Checkbox DOM element
 * @returns {Object} Assignee object
 */
function buildAssigneeFromCheckbox(checkboxElement) {
  return {
    name: checkboxElement.dataset.name || "",
    color: checkboxElement.dataset.color || "#CCCCCC",
  };
}
