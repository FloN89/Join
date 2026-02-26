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

function generateEditTaskOverlay(title, description, dueDate, id) {
    return `
            <div class="big-card edit-overlay">

                <div class="edit-overlay-header">
                    <img src="../assets/icons/close.svg" alt="Close" class="close-icon" onclick="closeTaskOverlay()">
                </div>

                <div class="edit-overlay-body">
                    <div class="edit-title-container">
                        <h3>Title</h3>
                        <input id="edit-title" type="text" placeholder="Enter a title" value="${title}">
                    </div>
                    <div class="edit-description-container">
                        <h3>Description</h3>
                        <input id="edit-description" type="text" placeholder="Enter a description" value="${description}">
                    </div>

                    <div class="edit-due-date-container">
                        <label for="due-date">Due Date</label>
                        <input type="date" id="edit-due-date" name="due-date" value="${dueDate}"/>
                    </div>

                    <div class="form-right">
                        <div class="edit-priority-container">
                            <label>Priority</label>
                            <div class="priority-options">
                                <input type="radio" id="priority-urgent" name="priority" value="urgent" />
                                <label for="priority-urgent" class="priority-button urgent">
                                    Urgent
                                    <img id="icon-urgent" src="../assets/icons/urgent_red.svg" />
                                </label>

                                <input type="radio" id="priority-medium" name="priority" value="medium" checked />
                                <label for="priority-medium" class="priority-button medium">
                                    Medium
                                    <img id="icon-medium" src="../assets/icons/medium_yellow.svg" />
                                </label>

                                <input type="radio" id="priority-low" name="priority" value="low" />
                                <label for="priority-low" class="priority-button low">
                                    Low
                                    <img id="icon-low" src="../assets/icons/low_green.svg" />
                                </label>
                            </div>
                        </div>

                        <div class="edit-assignee-container">
                            <label>Assigned to</label>
                            <div class="custom-multiselect">
                                <div class="multiselect-header" onclick="toggleAssigneeDropdown()">
                                    <span id="selected-assignees-placeholder">
                                    Select contacts to assign
                                    </span>
                                <img src="../assets/icons/arrow_drop_down.svg" class="dropdown-icon" />
                                </div>
                                <div class="multiselect-dropdown d-none" id="assignee-dropdown"></div>
                                <div class="selected-assignee-avatars" id="selected-assignee-avatars"></div>
                            </div>
                        </div>

                        <div class="edit-subtasks-container">
                            <label for="subtask">Subtasks</label>
                            <div class="subtask-input-container">
                                <input type="text" id="subtask" placeholder="Add new subtask" onkeydown="handleSubtaskKey(event)" />
                                <button type="button" onclick="addEditSubtask()" class="subtask-add-btn">
                                  +
                                </button>
                            </div>
                            <ul id="edit-subtask-list"></ul>
                        </div>
                    </div>

                    <div class="edit-overlay-footer">
                        <button class="save-changes" onclick="saveChanges('${id}')">Ok
                            <img src="../assets/icons/check_white.svg" alt="Save" class="save-icon">
                        </button>
                    </div>
                </div>
            </div>
        `;
}

function getInitalsImgTaskOverlay(color, contactId) {
    return `
    <div class="assigne-icon-large" style = "background-color: ${color}">
        ${getInitals((contactId))}
    </div > `
}