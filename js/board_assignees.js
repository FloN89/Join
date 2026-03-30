/**
 * Maps checked assignee checkbox to object
 * @param {HTMLElement} checkbox - Checkbox element
 * @returns {Object} Assignee object with name and color
 */
function mapCheckedAssignee(checkbox) {
  return { name: checkbox.dataset.name, color: checkbox.dataset.color };
}


/**
 * Gets all selected assignees from dropdown
 * @returns {Array} Array of selected assignee objects
 */
function getSelectedAssignees() {
  const assignees = [];
  document.querySelectorAll("#assignee-dropdown .assignee-checkbox:checked").forEach((checkbox) => {
    assignees.push(mapCheckedAssignee(checkbox));
  });
  return assignees;
}


/**
 * Returns the active contact list for the board page.
 * @returns {Array} Array of contact objects
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
        color: contact.color || "#CCCCCC"
      }));
    }
  }
  return [];
}


/**
 * Creates an assignee option label for the dropdown.
 * @param {Object} contact - Contact object with name and color
 * @returns {HTMLElement} Label element
 */
function createAssigneeLabel(contact) {
  const label = document.createElement("label");
  label.className = "assignee-row";
  label.innerHTML = `
    <div class="assignee-left">
      <div class="assignee-initials" style="background-color: ${contact.color};">${getInitials(contact.name)}</div>
      <span class="assignee-name">${contact.name}</span>
    </div>
    <input class="assignee-checkbox" type="checkbox" data-name="${contact.name}" data-color="${contact.color}">
  `;
  return label;
}


/**
 * Checks whether a contact is already assigned to the task.
 * @param {Object} contact - Contact object
 * @param {Array} taskAssignees - Array of assigned contact objects
 * @returns {boolean}
 */
function isContactAssigned(contact, taskAssignees) {
  return taskAssignees.some(
    (assignee) => assignee.name === contact.name && assignee.color === contact.color
  );
}


/**
 * Renders one assignee avatar element
 * @param {HTMLElement} avatarsContainer - Container element
 * @param {Object} assignee - Assignee object
 */
function renderAssigneeAvatar(avatarsContainer, assignee) {
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = getInitials(assignee.name);
  avatar.style.backgroundColor = assignee.color;
  avatarsContainer.appendChild(avatar);
}


/**
 * Updates assignee display in edit form
 */
function updateAssigneeDisplay() {
  const avatarsContainer = document.getElementById("selected-assignee-avatars");
  const placeholder = document.getElementById("selected-assignees-placeholder");
  if (!avatarsContainer || !placeholder) return;
  avatarsContainer.innerHTML = "";
  getSelectedAssignees().forEach(assignee => renderAssigneeAvatar(avatarsContainer, assignee));
  placeholder.textContent = avatarsContainer.children.length ? "" : "Select contacts";
}


/**
 * Appends one assignee option to dropdown
 * @param {HTMLElement} assigneeDropdown - Dropdown element
 * @param {Object} contact - Contact object
 * @param {Array} taskAssignees - Array of task assignees
 */
function appendAssigneeOption(assigneeDropdown, contact, taskAssignees) {
  const assigneeLabel = createAssigneeLabel(contact);
  if (isContactAssigned(contact, taskAssignees)) {
    assigneeLabel.querySelector("input").checked = true;
  }
  assigneeDropdown.appendChild(assigneeLabel);
}


/**
 * Renders edit assignees dropdown
 * @param {Array} taskAssignees - Array of task assignees
 */
function renderEditAssignees(taskAssignees = []) {
  const assigneeDropdown = document.getElementById("assignee-dropdown");
  if (!assigneeDropdown) return;
  assigneeDropdown.innerHTML = "";
  getBoardContacts().forEach((contact) => appendAssigneeOption(assigneeDropdown, contact, taskAssignees));
  updateAssigneeDisplay();
}
