let task = {};
let taskId = [];

/**
 * Fetches all tasks from Firebase for current user or guest
 * Clears the board and renders all task cards
 * @async
 */
async function fetchTasks() {
  let userId = sessionStorage.getItem("userId");

  if (userId === "guest") {
    await seedGuestTasks();
    task = (await loadData("guest-tasks/")) || {};
  } else {
    task = (await loadData("task/")) || {};
  }

  taskId = Object.keys(task);

  clearBoard();
  dataToCard();
}

let currentDraggedElement;

/**
 * Starts dragging operation for desktop drag and drop
 * @param {DragEvent} dragEvent - The drag event
 */
function startDragging(dragEvent) {
  currentDraggedElement = dragEvent.target;
  dragEvent.target.classList.add("dragging");
}

/**
 * Ends dragging operation and removes dragging style
 * @param {DragEvent} dragEvent - The drag event
 */
function endDragging(dragEvent) {
  dragEvent.target.classList.remove("dragging");
}

/**
 * Allows dropping by preventing default and adding visual feedback
 * @param {DragEvent} dragEvent - The drag event
 */
function allowDrop(dragEvent) {
  dragEvent.preventDefault();
  dragEvent.currentTarget.classList.add("drag-over");
}

/**
 * Handles drop event and updates task status
 * @param {DragEvent} dropEvent - The drop event
 */
function drop(dropEvent) {
  dropEvent.preventDefault();
  dropEvent.currentTarget.classList.remove("drag-over");

  if (!currentDraggedElement) return;

  const taskList = dropEvent.currentTarget;
  taskList.appendChild(currentDraggedElement);

  updateEmptyStates();
  updateTaskStatus(currentDraggedElement, taskList.id);
}

/**
 * Removes drag-over visual feedback from drop zone
 * @param {DragEvent} dragEvent - The drag event
 */
function removeDragOver(dragEvent) {
  dragEvent.currentTarget.classList.remove("drag-over");
}

/**
 * Updates task status in Firebase when task is moved
 * @async
 * @param {HTMLElement} taskElement - The task card element
 * @param {string} newStatus - The new status (todo, in-progress, await-feedback, done)
 */
async function updateTaskStatus(taskElement, newStatus) {
  const id = taskElement.dataset.taskId;
  if (!id || !task[id]) return;

  task[id].status = newStatus;

  const userId = sessionStorage.getItem("userId");
  const path = userId === "guest" ? "guest-tasks/" + id : "task/" + id;
  await saveData(path, task[id]);
}

/**
 * Renders all tasks as cards on the board
 */
function dataToCard() {
  for (let i = 0; i < taskId.length; i++) {
    let id = taskId[i];
    let taskData = task[id];
    if (!taskData) continue;
    let status = taskData.status || "todo";
    createTaskCard(taskData.category, taskData.title, taskData.description, taskData.assignedTo, taskData.priority, taskData.subtasks, id, status);
  }
  updateEmptyStates();
}

/**
 * Updates empty state placeholders for all task categories
 */
function updateEmptyStates() {
  const categories = getTaskCategories();
  categories.forEach(updateCategoryEmptyState);
}

/**
 * Returns array of task category definitions
 * @returns {Array<{id: string, name: string}>} Array of category objects
 */
function getTaskCategories() {
  return [
    { id: "todo", name: "To do" },
    { id: "in-progress", name: "In progress" },
    { id: "await-feedback", name: "Await feedback" },
    { id: "done", name: "Done" }
  ];
}

/**
 * Updates empty state for a single category
 * @param {{id: string, name: string}} category - Category object
 */
function updateCategoryEmptyState(category) {
  const taskList = document.getElementById(category.id);
  if (!taskList) return;
  removeExistingPlaceholder(taskList);
  if (shouldShowEmptyState(taskList)) {
    addEmptyStatePlaceholder(taskList, category.name);
  }
}

/**
 * Removes existing empty state placeholder from task list
 * @param {HTMLElement} taskList - The task list container
 */
function removeExistingPlaceholder(taskList) {
  const existingPlaceholder = taskList.querySelector(".empty-state");
  if (existingPlaceholder) existingPlaceholder.remove();
}

/**
 * Checks if task list should show empty state
 * @param {HTMLElement} taskList - The task list container
 * @returns {boolean} True if list is empty
 */
function shouldShowEmptyState(taskList) {
  return taskList.querySelectorAll(".task-card").length === 0;
}

/**
 * Adds empty state placeholder to task list
 * @param {HTMLElement} taskList - The task list container
 * @param {string} categoryName - Name of the category
 */
function addEmptyStatePlaceholder(taskList, categoryName) {
  const placeholder = document.createElement("div");
  placeholder.className = "empty-state";
  placeholder.textContent = "No tasks " + categoryName;
  taskList.appendChild(placeholder);
}

/**
 * Creates and renders a task card on the board
 * @param {string} category - Task category
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @param {Array} assignedTo - Array of assigned users
 * @param {string} priority - Task priority (low, medium, high, urgent)
 * @param {Array} subtasks - Array of subtask objects
 * @param {string} id - Task ID
 * @param {string} status - Task status
 */
function createTaskCard(category, title, description, assignedTo, priority, subtasks, id, status) {
  const column = getTaskColumn(status);
  const card = createCardElement(column, id);
  attachDragAndTouchEvents(card);
  card.innerHTML = buildTaskCardHTML(category, title, description, assignedTo, priority, subtasks, id);
}

/**
 * Gets the task column element by status
 * @param {string} status - Task status
 * @returns {HTMLElement} The column element
 */
function getTaskColumn(status) {
  let columnId = status || "todo";
  return document.getElementById(columnId) || document.getElementById("todo");
}

/**
 * Creates a card element and appends it to column
 * @param {HTMLElement} column - The column to append to
 * @param {string} id - Task ID
 * @returns {HTMLElement} The created card element
 */
function createCardElement(column, id) {
  let card = column.appendChild(document.createElement("div"));
  card.className = "task-card";
  card.draggable = true;
  card.dataset.taskId = id;
  return card;
}

/**
 * Attaches drag and touch event listeners to card
 * @param {HTMLElement} card - The card element
 */
function attachDragAndTouchEvents(card) {
  card.ondragstart = startDragging;
  card.ondragend = endDragging;
  card.addEventListener("touchstart", handleTouchStart, { passive: false });
  card.addEventListener("touchmove", handleTouchMove, { passive: false });
  card.addEventListener("touchend", handleTouchEnd, { passive: false });
}

/**
 * Builds the HTML content for a task card
 * @param {string} category - Task category
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @param {Array} assignedTo - Array of assigned users
 * @param {string} priority - Task priority
 * @param {Array} subtasks - Array of subtasks
 * @param {string} id - Task ID
 * @returns {string} HTML string for card content
 */
function buildTaskCardHTML(category, title, description, assignedTo, priority, subtasks, id) {
  const subtasksHTML = createSubtasksHTML(subtasks);
  const usersHTML = createUsersHTML(assignedTo);
  const priorityColor = getPriorityColor(priority);
  return generateSmallTaskCardTemplate(category, title, description, subtasksHTML, usersHTML, priority, priorityColor, id);
}

/**
 * Creates HTML for subtasks progress bar
 * @param {Array} subtasks - Array of subtask objects
 * @returns {string} HTML string or empty string
 */
function createSubtasksHTML(subtasks) {
  if (!subtasks || subtasks.length === 0) return "";
  const completedCount = countCompletedSubtasks(subtasks);
  const totalCount = subtasks.length;
  const progressPercentage = (completedCount / totalCount) * 100;
  return generateSubtasksProgressTemplate(progressPercentage, completedCount, totalCount);
}

/**
 * Counts completed subtasks in array
 * @param {Array} subtasks - Array of subtask objects
 * @returns {number} Number of completed subtasks
 */
function countCompletedSubtasks(subtasks) {
  return subtasks.filter(function (subtask) {
    return subtask.done === true || subtask.completed === true;
  }).length;
}

/**
 * Creates HTML for assigned user badges
 * @param {Array} assignedTo - Array of user objects or names
 * @returns {string} HTML string for user badges
 */
function createUsersHTML(assignedTo) {
  if (!assignedTo || assignedTo.length === 0) return "";
  return assignedTo.map(generateUserBadgeHTML).join("");
}

/**
 * Generates HTML for a single user badge
 * @param {Object|string} user - User object or name string
 * @returns {string} HTML string for user badge
 */
function generateUserBadgeHTML(user) {
  const userName = typeof user === "string" ? user : user?.name || "";
  if (!userName) return "";
  const initials = getInitials(userName);
  const backgroundColor = getUserColor(user);
  return generateUserBadgeTemplate(initials, backgroundColor);
}

/**
 * Gets color from user object or returns default
 * @param {Object|string} user - User object or name string
 * @returns {string} Color hex code
 */
function getUserColor(user) {
  return (typeof user === "object" && user?.color) ? user.color : "#CCCCCC";
}

/**
 * Extracts initials from user name
 * @param {string} name - User full name
 * @returns {string} User initials (1-2 characters)
 */
function getInitials(name) {
  if (!name || typeof name !== "string") return "";
  const nameParts = name.split(" ");
  if (!nameParts[0]) return "";
  if (nameParts.length >= 2) {
    return nameParts[0][0] + nameParts[1][0];
  }
  return nameParts[0][0];
}

/**
 * Creates user badge HTML with initials
 * @param {Object} user - User object with name and color
 * @returns {string} HTML string for user badge
 */
function createUserBadge(user) {
  const initials = getInitials(user.name);
  const backgroundColor = user.color || "#CCCCCC";
  return generateUserBadgeTemplate(initials, backgroundColor);
}

/**
 * Maps priority level to color name
 * @param {string} priority - Priority level (low, medium, high, urgent)
 * @returns {string} Color name (green, yellow, red)
 */
function getPriorityColor(priority) {
  if (priority === "low") {
    return "green";
  } else if (priority === "medium") {
    return "yellow";
  } else if (priority === "high") {
    return "red";
  } else if (priority === "urgent") {
    return "red";
  }
  return "red";
}

document.addEventListener("DOMContentLoaded", fetchTasks);

/**
 * Clears all task cards from the board
 */
function clearBoard() {
  document.querySelectorAll(".task-list").forEach(list => {
    list.innerHTML = "";
  });
}

// Overlay-Funktionen wurden nach board_overlay.js ausgelagert
// Suchfunktionen wurden nach board_search.js ausgelagert
