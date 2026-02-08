function generateTaskOverlay(category, title, description, dueDate, priority, priorityColor, assignedTo, subtasks, id) {
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
                        <p class="task-priority">Priority: ${priority}</p>
                        <img src="../assets/icons/${priority}_${priorityColor}.svg" class="priority-icon" alt="${priority}">
                    </div>
                    <div class="assigned-to-container">
                        <p class="task-assigned-to">Assigned to:</p>
                        <div class="assignees">
                         ${renderAssignees(assignedTo)}
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
                        <img class="divider" src="../assets/icons/vector 3.svg" alt="Divider">
                        <div class="edit-task-button" onclick="openEditTaskOverlay('${id}')">
                            <img src="../assets/icons/edit.svg" alt="Edit" class="edit-icon">
                            Edit
                        </div>
                    </div>
                </div>
        `;
}