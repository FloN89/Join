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
 * Creates one board-edit assignee option label.
 * Important: no override of shared add-task functions.
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

      if (typeof updateAssigneeDisplay === "function") {
        updateAssigneeDisplay();
      }
    });

    leftElement.addEventListener("keydown", (keyboardEvent) => {
      if (keyboardEvent.key !== "Enter" && keyboardEvent.key !== " ") return;
      keyboardEvent.preventDefault();
      leftElement.click();
    });

    checkboxElement.addEventListener("change", () => {
      label.classList.toggle("name-selected", checkboxElement.checked);

      if (typeof updateAssigneeDisplay === "function") {
        updateAssigneeDisplay();
      }
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
 * Renders edit assignees dropdown.
 * Uses shared updateAssigneeDisplay() from add_task_assignees.js.
 * @param {Array} taskAssignees
 */
function renderEditAssignees(taskAssignees = []) {
  const assigneeDropdown = document.getElementById("assignee-dropdown");
  if (!assigneeDropdown) return;

  assigneeDropdown.innerHTML = "";
  getBoardContacts().forEach((contact) =>
    appendBoardEditAssigneeOption(assigneeDropdown, contact, taskAssignees)
  );

  if (typeof updateAssigneeDisplay === "function") {
    updateAssigneeDisplay();
  }
}