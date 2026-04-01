/**
 * Registers live validation events.
 */
function registerValidationLiveEvents() {
  registerRequiredFieldLiveValidation("title", "error-title");
  registerRequiredFieldLiveValidation("due-date", "error-due-date");
  registerCategoryLiveValidation();
  registerValidationResetEvent();
}

/**
 * Registers validation for one required field.
 * @param {string} inputId - Input identifier.
 * @param {string} errorId - Error identifier.
 */
function registerRequiredFieldLiveValidation(inputId, errorId) {
  const inputElement = getElement(inputId);
  if (!inputElement) return;
  inputElement.addEventListener("input", () => validateFieldOnTyping(inputElement, errorId));
  inputElement.addEventListener("change", () => validateFieldOnTyping(inputElement, errorId));
}

/**
 * Validates one field while typing.
 * @param {HTMLElement} inputElement - Input element.
 * @param {string} errorId - Error identifier.
 */
function validateFieldOnTyping(inputElement, errorId) {
  if (!inputElement.value.trim()) return;
  markFieldValid(inputElement, getElement(errorId));
}

/**
 * Registers live validation for category changes.
 */
function registerCategoryLiveValidation() {
  const categoryInputElement = getElement("category");
  if (!categoryInputElement) return;
  categoryInputElement.addEventListener("change", handleCategoryChangeValidation);
}

/**
 * Clears the category error after a valid change.
 * @param {Event} changeEvent - Change event.
 */
function handleCategoryChangeValidation(changeEvent) {
  if (!changeEvent.target.value.trim()) return;
  clearFieldError("category", "error-category");
}

/**
 * Registers reset validation handling.
 */
function registerValidationResetEvent() {
  const taskFormElement = getElement("taskForm");
  if (!taskFormElement) return;
  taskFormElement.addEventListener("reset", scheduleValidationResetCleanup);
}

/**
 * Schedules error cleanup after form reset.
 */
function scheduleValidationResetCleanup() {
  requestAnimationFrame(clearAllValidationErrors);
}

/**
 * Clears all visible validation errors.
 */
function clearAllValidationErrors() {
  clearFieldError("title", "error-title");
  clearFieldError("due-date", "error-due-date");
  clearFieldError("category", "error-category");
}

/**
 * Clears one field error.
 * @param {string} inputId - Input identifier.
 * @param {string} errorId - Error identifier.
 */
function clearFieldError(inputId, errorId) {
  getElement(inputId)?.classList.remove("input-error");
  getElement(errorId)?.classList.remove("active");
}

/**
 * Validates the complete form.
 * @returns {boolean} True when valid.
 */
function validateForm() {
  let isFormValid = true;
  if (!checkRequiredField("title", "error-title")) isFormValid = false;
  if (!checkRequiredField("due-date", "error-due-date")) isFormValid = false;
  if (!validateCategoryField()) isFormValid = false;
  return isFormValid;
}

/**
 * Validates the category field.
 * @returns {boolean} True when valid.
 */
function validateCategoryField() {
  const categoryInputElement = getElement("category");
  const errorElement = getElement("error-category");
  if (!categoryInputElement || !errorElement) return false;
  if (!categoryInputElement.value.trim()) return markFieldInvalid(categoryInputElement, errorElement);
  return markFieldValid(categoryInputElement, errorElement);
}

/**
 * Checks one required field.
 * @param {string} inputId - Input identifier.
 * @param {string} errorId - Error identifier.
 * @returns {boolean} True when valid.
 */
function checkRequiredField(inputId, errorId) {
  const inputElement = getElement(inputId);
  const errorElement = getElement(errorId);
  if (!inputElement || !errorElement) return false;
  if (!inputElement.value.trim()) return markFieldInvalid(inputElement, errorElement);
  return markFieldValid(inputElement, errorElement);
}

/**
 * Marks one field as invalid.
 * @param {HTMLElement} inputElement - Input element.
 * @param {HTMLElement} errorElement - Error element.
 * @returns {boolean} Always false.
 */
function markFieldInvalid(inputElement, errorElement) {
  inputElement.classList.add("input-error");
  errorElement.classList.add("active");
  return false;
}

/**
 * Marks one field as valid.
 * @param {HTMLElement} inputElement - Input element.
 * @param {HTMLElement} errorElement - Error element.
 * @returns {boolean} Always true.
 */
function markFieldValid(inputElement, errorElement) {
  if (inputElement) inputElement.classList.remove("input-error");
  if (errorElement) errorElement.classList.remove("active");
  return true;
}