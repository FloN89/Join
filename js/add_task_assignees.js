/* =========================
   ASSIGNEES
========================= */

/**
 * Renders all assignee options.
 */
function renderAssigneeOptions() {
  const dropdownElement = getElement("assignee-dropdown");
  if (!dropdownElement) return;
  dropdownElement.innerHTML = "";
  contacts.forEach((contactObject) => dropdownElement.appendChild(createAssigneeRow(contactObject)));
}

/**
 * Creates one assignee row.
 * @param {Object} contactObject - Contact data.
 * @returns {HTMLElement} Row element.
 */
function createAssigneeRow(contactObject) {
  const rowElement = document.createElement("div");
  rowElement.className = "assignee-row";
  rowElement.innerHTML = buildAssigneeRowMarkup(contactObject);
  registerAssigneeRowEvents(rowElement);
  return rowElement;
}

/**
 * Builds assignee row markup.
 * @param {Object} contactObject - Contact data.
 * @returns {string} Row markup.
 */
function buildAssigneeRowMarkup(contactObject) {
  return `
    <div class="assignee-left" tabindex="0" role="button">${buildAssigneeIdentityMarkup(contactObject)}</div>
    <input class="assignee-checkbox" type="checkbox" data-name="${contactObject.name}" data-color="${contactObject.color}">
  `;
}

/**
 * Builds the left assignee content.
 * @param {Object} contactObject - Contact data.
 * @returns {string} Identity markup.
 */
function buildAssigneeIdentityMarkup(contactObject) {
  const initialsText = getInitials(contactObject.name);
  const displayName =
    typeof getAssigneeDisplayName === "function"
      ? getAssigneeDisplayName(contactObject)
      : contactObject.name;

  return `
    <div class="assignee-initials" style="background-color: ${contactObject.color};">${initialsText}</div>
    <span class="assignee-name">${displayName}</span>
  `;
}

/**
 * Registers assignee row events.
 * @param {HTMLElement} rowElement - Row element.
 */
function registerAssigneeRowEvents(rowElement) {
  const leftElement = rowElement.querySelector(".assignee-left");
  const checkboxElement = rowElement.querySelector(".assignee-checkbox");
  if (!leftElement || !checkboxElement) return;
  leftElement.addEventListener("click", (clickEvent) => handleAssigneeLeftClick(clickEvent, rowElement, checkboxElement));
  leftElement.addEventListener("keydown", (keyboardEvent) => handleAssigneeLeftKeydown(keyboardEvent, leftElement));
  checkboxElement.addEventListener("change", () => refreshAssigneeSelection(rowElement, checkboxElement.checked));
}

/**
 * Handles clicks on the left assignee area.
 * @param {MouseEvent} clickEvent - Click event.
 * @param {HTMLElement} rowElement - Row element.
 * @param {HTMLInputElement} checkboxElement - Checkbox element.
 */
function handleAssigneeLeftClick(clickEvent, rowElement, checkboxElement) {
  clickEvent.stopPropagation();
  toggleCheckbox(checkboxElement);
  refreshAssigneeSelection(rowElement, checkboxElement.checked);
}

/**
 * Handles keyboard activation for assignees.
 * @param {KeyboardEvent} keyboardEvent - Keyboard event.
 * @param {HTMLElement} leftElement - Left element.
 */
function handleAssigneeLeftKeydown(keyboardEvent, leftElement) {
  if (!isEnterOrSpace(keyboardEvent)) return;
  keyboardEvent.preventDefault();
  leftElement.click();
}

/**
 * Checks whether Enter or Space was pressed.
 * @param {KeyboardEvent} keyboardEvent - Keyboard event.
 * @returns {boolean} True when supported.
 */
function isEnterOrSpace(keyboardEvent) {
  return keyboardEvent.key === "Enter" || keyboardEvent.key === " ";
}

/**
 * Toggles a checkbox.
 * @param {HTMLInputElement} checkboxElement - Checkbox element.
 */
function toggleCheckbox(checkboxElement) {
  checkboxElement.checked = !checkboxElement.checked;
}

/**
 * Refreshes the selected assignee state.
 * @param {HTMLElement} rowElement - Row element.
 * @param {boolean} isSelected - Selection state.
 */
function refreshAssigneeSelection(rowElement, isSelected) {
  syncRowSelectionStyle(rowElement, isSelected);
  updateAssigneeDisplay();
}

/**
 * Updates the row selection style.
 * @param {HTMLElement} rowElement - Row element.
 * @param {boolean} isSelected - Selection state.
 */
function syncRowSelectionStyle(rowElement, isSelected) {
  if (isSelected) return rowElement.classList.add("name-selected");
  rowElement.classList.remove("name-selected");
}

/**
 * Updates avatars and placeholder text.
 */
function updateAssigneeDisplay() {
  const avatarContainerElement = getElement("selected-assignee-avatars");
  const placeholderElement = getElement("selected-assignees-placeholder");
  if (!avatarContainerElement || !placeholderElement) return;
  const selectedAssignees = getSelectedAssignees();
  renderAssigneeAvatarContainer(avatarContainerElement, selectedAssignees);
  setAssigneePlaceholderText(placeholderElement, selectedAssignees);
}

/**
 * Renders the avatar container.
 * @param {HTMLElement} containerElement - Container element.
 * @param {Array} assignedToList - Selected assignees.
 */
function renderAssigneeAvatarContainer(containerElement, assignedToList) {
  containerElement.innerHTML = "";
  assignedToList.forEach((assigneeObject) => containerElement.appendChild(buildAvatarElement(assigneeObject)));
}

/**
 * Builds one avatar element.
 * @param {Object} assigneeObject - Assignee data.
 * @returns {HTMLElement} Avatar element.
 */
function buildAvatarElement(assigneeObject) {
  const avatarElement = document.createElement("div");
  avatarElement.className = "avatar";
  avatarElement.textContent = getInitials(assigneeObject.name);
  avatarElement.style.backgroundColor = assigneeObject.color;
  return avatarElement;
}

/**
 * Updates the assignee placeholder text.
 * @param {HTMLElement} placeholderElement - Placeholder element.
 * @param {Array} selectedAssignees - Selected assignees.
 */
function setAssigneePlaceholderText(placeholderElement, selectedAssignees) {
  placeholderElement.textContent = selectedAssignees.length > 0 ? "Selected contacts" : "Select contacts to assign";
}

/**
 * Returns all selected assignees.
 * @returns {Array} Assignee array.
 */
function getSelectedAssignees() {
  const checkboxNodeList = document.querySelectorAll('#assignee-dropdown input[type="checkbox"]:checked');
  return Array.from(checkboxNodeList).map(buildAssigneeFromCheckbox);
}

/**
 * Builds an assignee object from a checkbox.
 * @param {HTMLInputElement} checkboxElement - Checkbox element.
 * @returns {Object} Assignee data.
 */
function buildAssigneeFromCheckbox(checkboxElement) {
  return {
    name: checkboxElement.dataset.name || "",
    color: checkboxElement.dataset.color || "#CCCCCC",
  };
}