/**
 * Renders assignees as HTML for task overlay
 * @param {Array} assignees - Array of assignee objects
 * @returns {string} HTML string for assignees
 */
function renderAssignees(assignees) {
  if (!assignees || assignees.length === 0) return "";
  return assignees.map(person => generateTaskOverlayAssignee(person)).join("");
}

/**
 * Gets template markup from DOM by template ID
 * @param {string} templateId - ID of template element
 * @returns {string} Template HTML content
 */
function getTemplateMarkup(templateId) {
  const template = document.getElementById(templateId);
  return template ? template.innerHTML.trim() : "";
}

/**
 * Renders subtasks as HTML for task overlay
 * @param {Array} subtasks - Array of subtask objects
 * @param {string} id - Task ID
 * @returns {string} HTML string for subtasks
 */
function renderSubtasks(subtasks, id) {
  if (!subtasks || subtasks.length === 0) return "";
  return subtasks.map((subtask, index) => generateTaskOverlaySubtask(subtask, index, id)).join("");
}

/**
 * Builds database path based on user type (guest or regular)
 * @param {string} id - Task ID
 * @returns {string} Firebase database path
 */
function getTaskPath(id) {
  const isGuest = sessionStorage.getItem("userId") === "guest";
  return (isGuest ? "guest-tasks/" : "task/") + id;
}

/**
 * Shows task overlay and background
 */
function setTaskOverlayVisible() {
  document.getElementById("task_overlay").style.display = "flex";
  document.getElementById("big-card-background").style.display = "block";
}

/**
 * Builds HTML for large task overlay
 * @param {Object} taskItem - Task data object
 * @param {string} id - Task ID
 * @param {string} priorityColor - Priority color
 * @returns {string} HTML for task overlay
 */
function buildTaskOverlayHtml(taskItem, id, priorityColor) {
  return generateTaskOverlay(
    taskItem.category,
    taskItem.title,
    taskItem.description,
    taskItem.dueDate,
    taskItem.priority,
    priorityColor,
    taskItem.assignedTo,
    taskItem.subtasks,
    id
  );
}

/**
 * Opens task detail overlay
 * @param {string} id - Task ID
 * @param {string} priorityColor - Priority color
 */
function openTaskOverlay(id, priorityColor) {
  const overlay = document.getElementById("task_overlay");
  const taskItem = task[id];
  overlay.innerHTML = "";
  overlay.innerHTML = buildTaskOverlayHtml(taskItem, id, priorityColor);
  overlay.classList.add("active");
  setTaskOverlayVisible();
}

/**
 * Toggles done state of a subtask
 * @param {Array} subtasks - Array of subtasks
 * @param {number} index - Index of subtask to toggle
 * @returns {Array} Updated subtasks array
 */
function toggleSubtaskValue(subtasks, index) {
  subtasks[index].done = !subtasks[index].done;
  return subtasks;
}

/**
 * Updates the progress bar and counter on the small board card
 * @param {string} id - Task ID
 */
function updateBoardCardProgress(id) {
  const card = document.querySelector(`.task-card[data-task-id="${id}"]`);
  if (!card) return;
  const subtasks = task[id].subtasks || [];
  const newHTML = createSubtasksHTML(subtasks);
  const existing = card.querySelector(".subtasks-container");
  if (existing) {
    existing.outerHTML = newHTML || "";
  } else if (newHTML) {
    card.querySelector(".task-footer").insertAdjacentHTML("beforebegin", newHTML);
  }
}

/**
 * Toggles subtask completion and saves to database
 * @async
 * @param {string} id - Task ID
 * @param {number} subtaskIndex - Index of subtask
 */
async function toggleSubtaskCompletion(id, subtaskIndex) {
  const subtasks = toggleSubtaskValue(task[id].subtasks || [], subtaskIndex);
  await saveData(getTaskPath(id), { ...task[id], subtasks: subtasks });
  updateBoardCardProgress(id);
  openTaskOverlay(id, getPriorityColor(task[id].priority));
}

/**
 * Shows edit overlay and hides details overlay
 */
function showEditOverlay() {
  document.getElementById("edit_task_overlay").classList.add("active");
  document.getElementById("task_overlay").style.display = "none";
  document.getElementById("big-card-background").style.display = "block";
}

/**
 * Renders edit overlay HTML content
 * @param {string} id - Task ID
 */
function renderEditOverlayContent(id) {
  const editOverlay = document.getElementById("edit_task_overlay");
  const taskItem = task[id];
  editOverlay.innerHTML = "";
  editOverlay.innerHTML = generateEditTaskOverlay(taskItem.title, taskItem.description, taskItem.dueDate, id);
  setMinimumEditDateToToday();
}

/**
 * Prevent selecting past dates in edit overlay
 */
function setMinimumEditDateToToday() {
  const dateInputElement = document.getElementById("edit-due-date");
  if (!dateInputElement) return;
  dateInputElement.min = new Date().toISOString().split("T")[0];
}

/**
 * Initializes edit form fields with task data
 * @param {string} id - Task ID
 */
async function initializeEditOverlayFields(id) {
  const taskItem = task[id];

  await loadContacts();

  if (typeof renderEditAssignees === "function") {
    renderEditAssignees(taskItem.assignedTo || []);
  }

  renderEditSubtasks(taskItem.subtasks || []);

  const priorityInput = document.querySelector(
    `input[name="priority"][value="${taskItem.priority}"]`
  );
  if (priorityInput) priorityInput.checked = true;

  initializePriorityIconHandlers();
}

async function openEditTaskOverlay(id) {
  showEditOverlay();
  renderEditOverlayContent(id);
  await initializeEditOverlayFields(id);
}

/**
 * Opens edit task overlay
 * @param {string} id - Task ID
 */
function openEditTaskOverlay(id) {
  showEditOverlay();
  renderEditOverlayContent(id);
  initializeEditOverlayFields(id);
}

/**
 * Gets current task from guest or regular tasks
 * @param {string} id - Task ID
 * @returns {Object} Task object
 */
function getCurrentTask(id) {
  return (guestTasks && guestTasks[id]) || (task && task[id]);
}

/**
 * Reads values from edit task form
 * @returns {Object} Form values object
 */
function getEditFormValues() {
  return {
    title: document.getElementById("edit-title").value,
    description: document.getElementById("edit-description").value,
    dueDate: document.getElementById("edit-due-date").value,
    priority: document.querySelector('input[name="priority"]:checked')?.value,
    assignedTo: getSelectedAssignees(),
    subtasks: getEditedSubtasks()
  };
}

/**
 * Saves task changes to database
 * @async
 * @param {string} id - Task ID
 */
async function saveChanges(id) {
  const payload = { ...getCurrentTask(id), ...getEditFormValues() };
  await saveData(getTaskPath(id), payload);
  await fetchTasks();
  closeTaskOverlay();
}

/**
 * Creates editable subtask list item element
 * @param {string} title - Subtask title
 * @returns {HTMLElement} List item element
 */
function createEditableSubtaskItem(title) {
  const li = document.createElement("li");
  li.className = "subtask-item";
  li.innerHTML = generateEditSubtaskItem(title) + getTemplateMarkup("subtask-actions-default-template");
  return li;
}

/**
 * Binds edit and delete event listeners to subtask row
 * @param {HTMLElement} li - List item element
 */
function bindSubtaskRowEvents(li) {
  const editBtn = li.querySelector(".edit-subtask-btn");
  const deleteBtn = li.querySelector(".delete-subtask-btn");
  editBtn.addEventListener("click", () => enableSubtaskEdit(li));
  deleteBtn.addEventListener("click", () => li.remove());
}

/**
 * Appends new subtask row to list
 * @param {HTMLElement} list - Subtask list element
 * @param {string} title - Subtask title
 */
function appendSubtaskRow(list, title) {
  const li = createEditableSubtaskItem(title);
  list.appendChild(li);
  bindSubtaskRowEvents(li);
}

/**
 * Renders editable subtasks in edit overlay
 * @param {Array} subtasks - Array of subtask objects
 */
function renderEditSubtasks(subtasks = []) {
  const list = document.getElementById("edit-subtask-list");
  if (!list) return;
  list.innerHTML = "";
  subtasks.forEach(subtask => appendSubtaskRow(list, subtask.title));
}

/**
 * Adds new editable subtask from input field
 */
function addEditSubtask() {
  const input = document.getElementById("subtask");
  const text = input.value.trim();
  if (!text) return;
  appendSubtaskRow(document.getElementById("edit-subtask-list"), text);
  input.value = "";
}

/**
 * Converts subtask row element to data object
 * @param {HTMLElement} li - List item element
 * @returns {Object|null} Subtask object or null
 */
function getSubtaskFromRow(li) {
  const title = li.querySelector(".subtask-title").textContent.trim();
  return title !== "" ? { title: title, done: false } : null;
}

/**
 * Gets all edited subtasks from edit form
 * @returns {Array} Array of subtask objects
 */
function getEditedSubtasks() {
  const subtasks = [];
  document.querySelectorAll("#edit-subtask-list li").forEach(li => {
    const subtask = getSubtaskFromRow(li);
    if (subtask) subtasks.push(subtask);
  });
  return subtasks;
}

// Assignee-Funktionen wurden nach board_assignees.js ausgelagert

/**
 * Deletes task from database
 * @async
 * @param {string} taskId - Task ID
 */
async function deleteTask(taskId) {
  await deleteData(getTaskPath(taskId));
  closeTaskOverlay();
  await fetchTasks();
}

/**
 * Closes task overlay and cleans up
 */
function closeTaskOverlay() {
  const taskOverlay = document.getElementById("task_overlay");
  const background = document.getElementById("big-card-background");
  const editOverlay = document.getElementById("edit_task_overlay");
  taskOverlay.classList.remove("active");
  taskOverlay.style.display = "none";
  background.style.display = "none";
  editOverlay.innerHTML = "";
}

/**
 * Handles delete button click in subtask list
 * @param {HTMLElement} target - Click target element
 */
function handleSubtaskDeleteClick(target) {
  const li = target.closest("li");
  if (li) li.remove();
}

/**
 * Handles edit button click in subtask list
 * @param {HTMLElement} target - Click target element
 */
function handleSubtaskEditClick(target) {
  const li = target.closest("li");
  if (!li) return;
  const title = li.querySelector(".subtask-title");
  const isEditing = title.getAttribute("contenteditable") === "true";
  title.setAttribute("contenteditable", isEditing ? "false" : "true");
  if (isEditing) title.blur(); else title.focus();
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-subtask-btn")) handleSubtaskDeleteClick(e.target);
  if (e.target.classList.contains("edit-subtask-btn")) handleSubtaskEditClick(e.target);
});

/**
 * Replaces subtask action buttons with template
 * @param {HTMLElement} li - List item element
 * @param {string} templateId - Template ID
 * @returns {HTMLElement} New actions div element
 */
function setSubtaskActions(li, templateId) {
  let actionsDiv = li.querySelector(".subtask-actions");
  actionsDiv.outerHTML = getTemplateMarkup(templateId);
  return li.querySelector(".subtask-actions");
}

/**
 * Binds save and delete event listeners for subtask
 * @param {HTMLElement} li - List item element
 * @param {HTMLElement} titleSpan - Title span element
 * @param {HTMLElement} actionsDiv - Actions div element
 */
function bindSaveAndDeleteActions(li, titleSpan, actionsDiv) {
  const saveBtn = actionsDiv.querySelector(".save-subtask-btn");
  const deleteBtn = actionsDiv.querySelector(".delete-subtask-btn");
  saveBtn.addEventListener("click", () => {
    titleSpan.setAttribute("contenteditable", "false");
    const nextActions = setSubtaskActions(li, "subtask-actions-default-template");
    nextActions.querySelector(".edit-subtask-btn").addEventListener("click", () => enableSubtaskEdit(li));
    nextActions.querySelector(".delete-subtask-btn").addEventListener("click", () => li.remove());
  });
  deleteBtn.addEventListener("click", () => li.remove());
}

/**
 * Enables edit mode for subtask
 * @param {HTMLElement} li - List item element
 */
function enableSubtaskEdit(li) {
  const titleSpan = li.querySelector(".subtask-title");
  titleSpan.setAttribute("contenteditable", "true");
  titleSpan.focus();
  const actionsDiv = setSubtaskActions(li, "subtask-actions-editable-template");
  bindSaveAndDeleteActions(li, titleSpan, actionsDiv);
}

/**
 * Saves subtask edit and exits edit mode
 * @param {HTMLElement} li - List item element
 */
function saveSubtaskEdit(li) {
  const title = li.querySelector(".subtask-title");
  title.setAttribute("contenteditable", "false");
  title.blur();
  setSubtaskActions(li, "subtask-actions-default-template");
}
