/**
 * Generates HTML for task overlay (big card view)
 * @param {string} category - Task category
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @param {string} dueDate - Task due date
 * @param {string} priority - Task priority
 * @param {string} priorityColor - Color for priority icon
 * @param {Array} assignees - Array of assigned users
 * @param {Array} subtasks - Array of subtasks
 * @param {string} id - Task ID
 * @returns {string} HTML template for task overlay
 */
function generateTaskOverlay(category, title, description, dueDate, priority, priorityColor, assignees, subtasks, id) {
  return `
    <div class="big-card">
      <div class="overlay-header">
        <div class="task-category ${category}">${category}</div>
        <img src="../assets/icons/close.svg" alt="Close" class="close-icon" onclick="closeTaskOverlay()">
      </div>

      <h1 class="task-title-big">${title}</h1>
      <p class="task-description-big">${description}</p>

      <div class="due-date-container">
        <p class="task-due-date-big">Due Date: </p>
        <div class="date">${dueDate}</div>
      </div>

      <div class="priority-container">
        <div class="priority-label">
          <p class="task-priority">Priority:</p>
          <p>${priority}</p>
        </div>
        <img src="../assets/icons/${priority}_${priorityColor}.svg" class="priority-icon" alt="${priority}">
      </div>

      <div class="assigned-to-container">
        <p class="task-assigned-to">Assigned to:</p>
        <div class="assignees">
          ${renderAssignees(assignees)}
        </div>
      </div>

      <div class="task-subtasks">
        <h3>Subtasks:</h3>
        <ul>${renderSubtasks(subtasks, id)}</ul>
      </div>

      <div class="overlay-buttons">
        <div class="delete-task-button" onclick="deleteTask('${id}')">
          <img src="../assets/icons/delete.svg" alt="Delete" class="delete-icon">
          Delete
        </div>
        <img class="divider" src="../assets/icons/vector_3.svg" alt="Divider">
        <div class="edit-task-button" onclick="openEditTaskOverlay('${id}')">
          <img src="../assets/icons/edit.svg" alt="Edit" class="edit-icon">
          Edit
        </div>
      </div>
    </div>
  `;
}

/**
 * Generates HTML for edit task overlay
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @param {string} dueDate - Task due date
 * @param {string} id - Task ID
 * @returns {string} HTML template for edit overlay
 */
function generateEditTaskOverlay(title, description, dueDate, id) {
  const safeTitle =
    typeof escapeHtmlText === "function" ? escapeHtmlText(title || "") : (title || "");
  const safeDescription =
    typeof escapeHtmlText === "function"
      ? escapeHtmlText(description || "")
      : (description || "");

  return `
    <div class="big-card edit-overlay edit-task-overlay-card">
      <div class="edit-overlay-header">
        <img
          src="../assets/icons/close.svg"
          alt="Close"
          class="close-icon"
          onclick="closeTaskOverlay()"
        >
      </div>

      <div class="edit-overlay-body">
        <div class="form-field edit-title-field">
          <label for="edit-title">Title</label>
          <input
            id="edit-title"
            type="text"
            placeholder="Enter a title"
            value="${safeTitle}"
          >
        </div>

        <div class="form-field edit-description-field">
          <label for="edit-description">Description</label>
          <textarea
            id="edit-description"
            rows="4"
            placeholder="Enter a description"
          >${safeDescription}</textarea>
        </div>

        <div class="form-field edit-due-date-container">
          <label for="edit-due-date">Due date</label>
          <input
            type="date"
            id="edit-due-date"
            name="edit-due-date"
            value="${dueDate || ""}"
          >
        </div>

        <div class="form-field edit-priority-container">
          <label>Priority</label>

          <div class="priority-options">
            <input
              type="radio"
              id="edit-priority-urgent"
              name="edit-priority"
              value="urgent"
            >
            <label for="edit-priority-urgent" class="priority-button urgent">
              Urgent
              <img
                id="edit-icon-urgent"
                src="../assets/icons/urgent_red.svg"
                alt="Urgent"
              >
            </label>

            <input
              type="radio"
              id="edit-priority-medium"
              name="edit-priority"
              value="medium"
            >
            <label for="edit-priority-medium" class="priority-button medium">
              Medium
              <img
                id="edit-icon-medium"
                src="../assets/icons/medium_yellow.svg"
                alt="Medium"
              >
            </label>

            <input
              type="radio"
              id="edit-priority-low"
              name="edit-priority"
              value="low"
            >
            <label for="edit-priority-low" class="priority-button low">
              Low
              <img
                id="edit-icon-low"
                src="../assets/icons/low_green.svg"
                alt="Low"
              >
            </label>
          </div>
        </div>

        <div class="form-field edit-assignee-container">
          <label>Assigned to</label>

          <div class="custom-multiselect">
            <div class="multiselect-header" id="assignee-header">
              <span id="selected-assignees-placeholder">
                Select contacts to assign
              </span>
              <img
                src="../assets/icons/arrow_drop_down.svg"
                class="dropdown-icon"
                alt="Open assignee dropdown"
              >
            </div>

            <div
              class="multiselect-dropdown d-none"
              id="assignee-dropdown"
            ></div>

            <div
              class="selected-assignee-avatars"
              id="selected-assignee-avatars"
            ></div>
          </div>
        </div>

        <div class="form-field edit-subtasks-container">
          <label for="edit-subtask">Subtasks</label>

          <div class="subtask-input-container">
            <input
              type="text"
              id="edit-subtask"
              placeholder="Add new subtask"
            >

            <div class="subtask-input-actions" aria-label="Subtask actions">
              <button
                type="button"
                class="subtask-action-btn"
                id="edit-subtask-clear-button"
                aria-label="Clear subtask"
              >
                <img
                  src="../assets/icons/close.svg"
                  class="closeSub-btn"
                  alt="Clear"
                >
              </button>

              <span
                class="subtask-action-divider"
                aria-hidden="true"
              ></span>

              <button
                type="button"
                class="subtask-action-btn"
                id="edit-subtask-add-button"
                aria-label="Add subtask"
              >
                <img
                  src="../assets/icons/check.svg"
                  class="checkSub-btn"
                  alt="Add"
                >
              </button>
            </div>
          </div>

          <ul id="edit-subtask-list"></ul>
        </div>

        <div class="edit-overlay-footer">
          <button
            type="button"
            class="save-changes"
            onclick="saveChanges('${id}')"
          >
            Ok
            <img
              src="../assets/icons/check_white.svg"
              alt="Save"
              class="save-icon"
            >
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Generates initials image for task overlay
 * @param {string} color - Background color
 * @param {string} contactId - Contact ID
 * @returns {string} HTML template for initials image
 */
function getInitalsImgTaskOverlay(color, contactId) {
  return `
    <div class="assigne-icon-large" style="background-color: ${color}">
      ${getInitals((contactId))}
    </div>
  `;
}

/**
 * Generates HTML for task overlay assignee
 * @param {Object} person - Person object with name and color
 * @returns {string} HTML template for assignee
 */
function generateTaskOverlayAssignee(person) {
  return `
    <div class="task-overlay-assignee">
      ${createUserBadge(person)}
      ${person.name}
    </div>
  `;
}

/**
 * Generates HTML for task overlay subtask
 * @param {Object} subtask - Subtask object
 * @param {number} index - Subtask index
 * @param {string} id - Task ID
 * @returns {string} HTML template for subtask
 */
function generateTaskOverlaySubtask(subtask, index, id) {
  return `
    <li class="subtask-list">
      <input class="subtaskCheckbox"
        id="subtaskCheckbox-${index}"
        type="checkbox" ${subtask.done ? "checked" : ""}
        onchange="toggleSubtaskCompletion('${id}', ${index})">
      <label for="subtaskCheckbox-${index}">${subtask.title}</label>
    </li>
  `;
}

/**
 * Generates HTML for edit subtask item
 * @param {string} title - Subtask title
 * @returns {string} HTML template for edit subtask
 */
function generateEditSubtaskItem(title) {
  return `
    <div class="subtask-item-content">
      <span class="subtask-bullet">&bull;</span>
      <span class="subtask-title" contenteditable="false">${title}</span>
    </div>
  `;
}

/**
 * Generates HTML template for small task card
 * @param {string} category - Task category
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @param {string} subtasksHTML - HTML for subtasks section
 * @param {string} usersHTML - HTML for assigned users
 * @param {string} priority - Task priority
 * @param {string} priorityColor - Color for priority icon
 * @param {string} id - Task ID
 * @returns {string} HTML template for task card
 */
function generateSmallTaskCardTemplate(category, title, description, subtasksHTML, usersHTML, priority, priorityColor, id) {
  return `
    <div onclick="openTaskOverlay('${id}', '${priorityColor}')" class="task-card-content">
      <div class="task-category ${category}">${category}</div>
      <h3 class="task-title">${title}</h3>
      <p class="task-description">${description}</p>
      ${subtasksHTML}
      <div class="task-footer">
        <div class="assigned-users">${usersHTML}</div>
        <img src="../assets/icons/${priority}_${priorityColor}.svg" class="priority-icon" alt="${priority}">
      </div>
    </div>
  `;
}

/**
 * Generates HTML for subtasks progress section
 * @param {number} progressPercentage - Progress percentage
 * @param {number} completedCount - Number of completed subtasks
 * @param {number} totalCount - Total number of subtasks
 * @returns {string} HTML template for subtasks progress
 */
function generateSubtasksProgressTemplate(progressPercentage, completedCount, totalCount) {
  return `
    <div class="subtasks-container">
      <div class="subtask-progress-bar">
        <div class="subtask-progress-fill" style="width: ${progressPercentage}%"></div>
      </div>
      <span class="subtask-counter">${completedCount}/${totalCount} Subtasks</span>
    </div>
  `;
}

/**
 * Generates HTML for user badge
 * @param {string} initials - User initials
 * @param {string} backgroundColor - Badge background color
 * @returns {string} HTML template for user badge
 */
function generateUserBadgeTemplate(initials, backgroundColor) {
  return `<div class="user-badge" style="background-color: ${backgroundColor}">${initials}</div>`;
}