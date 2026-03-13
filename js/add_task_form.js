/* =========================
   FORM RESET + DATA SAMMLUNG
========================= */

/**
 * Handles form clear/reset
 */
function handleClear() {
  resetFormElement();
  resetAssignees();
  resetCategory();
  resetSubtasks();
  updatePriorityIcons();
}

/**
 * Resets form element to initial state
 */
function resetFormElement() {
  const taskFormElement = document.getElementById("taskForm");
  if (!taskFormElement) return;
  taskFormElement.reset();
}

/**
 * Resets all assignee selections
 */
function resetAssignees() {
  uncheckAllAssigneeCheckboxes();
  clearAssigneeAvatarContainer();
  resetAssigneePlaceholder();
  updateAssigneeDisplay();
}

/**
 * Unchecks all assignee checkboxes
 */
function uncheckAllAssigneeCheckboxes() {
  document.querySelectorAll('#assignee-dropdown input[type="checkbox"]').forEach((checkboxElement) => {
    checkboxElement.checked = false;
  });
}

/**
 * Clears assignee avatar container
 */
function clearAssigneeAvatarContainer() {
  const avatarContainerElement = document.getElementById("selected-assignee-avatars");
  if (!avatarContainerElement) return;
  avatarContainerElement.innerHTML = "";
}

/**
 * Resets assignee placeholder text
 */
function resetAssigneePlaceholder() {
  const placeholderElement = document.getElementById("selected-assignees-placeholder");
  if (!placeholderElement) return;
  placeholderElement.textContent = "Select contacts to assign";
}

/**
 * Resets category selection
 */
function resetCategory() {
  setCategoryHiddenInput("");
  setCategoryPlaceholderText("");
  removeCategoryError();
}

/**
 * Collects all task data from form
 * @returns {Object} Task data object
 */
function collectTaskData() {
  return {
    category: readInputValue("category"),
    title: readInputValue("title"),
    description: readInputValue("description"),
    dueDate: readInputValue("due-date"),
    priority: readSelectedPriority(),
    assignedTo: getSelectedAssignees(),
    subtasks: structuredClone(subtaskCollection),
  };
}

/**
 * Reads input value by ID
 * @param {string} inputId - Input element ID
 * @returns {string} Trimmed input value
 */
function readInputValue(inputId) {
  const inputElement = document.getElementById(inputId);
  if (!inputElement) return "";
  return inputElement.value.trim();
}

/**
 * Reads selected priority value
 * @returns {string} Priority value or default "medium"
 */
function readSelectedPriority() {
  const selectedElement = document.querySelector('input[name="priority"]:checked');
  return selectedElement ? selectedElement.value : "medium";
}

/* =========================
   SUCCESS TOAST + REDIRECT
========================= */

/**
 * Ensures success toast element exists
 * @returns {HTMLElement} Toast element
 */
function ensureSuccessToastElement() {
  const toastElement = document.getElementById("task-success");
  if (toastElement) return toastElement;

  const newToastElement = document.createElement("div");
  newToastElement.id = "task-success";
  newToastElement.className = "task-success";
  newToastElement.textContent = "Task added to board";
  document.body.appendChild(newToastElement);
  return newToastElement;
}

/**
 * Shows success toast and redirects to board
 */
function showSuccessAndRedirect() {
  const toastElement = ensureSuccessToastElement();
  restartToastAnimation(toastElement);

  setTimeout(() => {
    window.location.href = "board.html";
  }, 2500);
}

/**
 * Shows saving failed toast message
 */
function showSavingFailedToast() {
  const toastElement = ensureSuccessToastElement();
  toastElement.textContent = "Saving failed";
  restartToastAnimation(toastElement);
}

/**
 * Restarts toast animation by toggling class
 * @param {HTMLElement} toastElement - Toast DOM element
 */
function restartToastAnimation(toastElement) {
  toastElement.classList.remove("show");
  void toastElement.offsetWidth;
  toastElement.classList.add("show");
}
