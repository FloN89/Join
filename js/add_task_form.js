/* =========================
   FORM RESET UND DATEN
========================= */

/**
 * Clears the complete form state.
 */
function handleClear() {
  resetFormElement();
  resetAssignees();
  resetCategory();
  resetSubtasks();
  resetFieldErrors();
  closeTaskDropdowns();
  updatePriorityIcons();
}

/**
 * Resets the form element.
 */
function resetFormElement() {
  const taskFormElement = getElement("taskForm");
  if (!taskFormElement) return;
  taskFormElement.reset();
}

/**
 * Resets all assignee selections.
 */
function resetAssignees() {
  uncheckAllAssigneeCheckboxes();
  removeAllAssigneeSelectionStyles();
  clearAssigneeAvatarContainer();
  resetAssigneePlaceholder();
  updateAssigneeDisplay();
}

/**
 * Unchecks all assignee boxes.
 */
function uncheckAllAssigneeCheckboxes() {
  document.querySelectorAll('#assignee-dropdown input[type="checkbox"]').forEach(clearCheckbox);
}

/**
 * Clears one checkbox.
 * @param {HTMLInputElement} checkboxElement - Checkbox element.
 */
function clearCheckbox(checkboxElement) {
  checkboxElement.checked = false;
}

/**
 * Removes selected row styles.
 */
function removeAllAssigneeSelectionStyles() {
  document.querySelectorAll("#assignee-dropdown .assignee-row").forEach(removeAssigneeSelectionStyle);
}

/**
 * Removes the selected style from one row.
 * @param {HTMLElement} rowElement - Assignee row.
 */
function removeAssigneeSelectionStyle(rowElement) {
  rowElement.classList.remove("name-selected");
}

/**
 * Clears the avatar container.
 */
function clearAssigneeAvatarContainer() {
  const avatarContainerElement = getElement("selected-assignee-avatars");
  if (!avatarContainerElement) return;
  avatarContainerElement.innerHTML = "";
}

/**
 * Resets the assignee placeholder.
 */
function resetAssigneePlaceholder() {
  const placeholderElement = getElement("selected-assignees-placeholder");
  if (!placeholderElement) return;
  placeholderElement.textContent = "Select contacts to assign";
}

/**
 * Resets the category input and label.
 */
function resetCategory() {
  setCategoryHiddenInput("");
  setCategoryPlaceholderText("");
  removeCategoryError();
}

/**
 * Removes all validation styles.
 */
function resetFieldErrors() {
  document.querySelectorAll("#taskForm .input-error").forEach(removeInputErrorClass);
  document.querySelectorAll("#taskForm .field-error-message.active").forEach(removeActiveErrorClass);
}

/**
 * Removes the input error class.
 * @param {HTMLElement} inputElement - Input element.
 */
function removeInputErrorClass(inputElement) {
  inputElement.classList.remove("input-error");
}

/**
 * Removes the active error class.
 * @param {HTMLElement} errorElement - Error element.
 */
function removeActiveErrorClass(errorElement) {
  errorElement.classList.remove("active");
}

/**
 * Collects task form data.
 * @returns {Object} Task data.
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
 * Reads one trimmed input value.
 * @param {string} inputId - Input identifier.
 * @returns {string} Input value.
 */
function readInputValue(inputId) {
  const inputElement = getElement(inputId);
  if (!inputElement) return "";
  return inputElement.value.trim();
}

/**
 * Reads the selected priority.
 * @returns {string} Priority value.
 */
function readSelectedPriority() {
  const selectedElement = document.querySelector('input[name="priority"]:checked');
  return selectedElement ? selectedElement.value : "medium";
}

/* =========================
   TOAST UND WEITERLEITUNG
========================= */

/**
 * Ensures that a toast element exists.
 * @returns {HTMLElement} Toast element.
 */
function ensureSuccessToastElement() {
  const toastElement = getElement("task-success");
  if (toastElement) return toastElement;
  return createSuccessToastElement();
}

/**
 * Creates the toast element.
 * @returns {HTMLElement} Toast element.
 */
function createSuccessToastElement() {
  const toastElement = document.createElement("div");
  toastElement.id = "task-success";
  toastElement.className = "task-success";
  toastElement.textContent = "Task added to board";
  document.body.appendChild(toastElement);
  return toastElement;
}

/**
 * Shows the success toast and redirects.
 */
function showSuccessAndRedirect() {
  const toastElement = ensureSuccessToastElement();
  restartToastAnimation(toastElement);
  setTimeout(() => redirectToBoardPage(), 2500);
}

/**
 * Redirects to the board page.
 */
function redirectToBoardPage() {
  window.location.href = "board.html";
}

/**
 * Shows a failed saving toast.
 */
function showSavingFailedToast() {
  const toastElement = ensureSuccessToastElement();
  toastElement.textContent = "Saving failed";
  restartToastAnimation(toastElement);
}

/**
 * Restarts the toast animation.
 * @param {HTMLElement} toastElement - Toast element.
 */
function restartToastAnimation(toastElement) {
  toastElement.classList.remove("show");
  void toastElement.offsetWidth;
  toastElement.classList.add("show");
}