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
  if (taskAssignees.includes(contact)) assigneeLabel.querySelector("input").checked = true;
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
  contacts.forEach(contact => appendAssigneeOption(assigneeDropdown, contact, taskAssignees));
  updateAssigneeDisplay();
}
