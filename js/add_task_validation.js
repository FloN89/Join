document.addEventListener("DOMContentLoaded", registerValidationLiveEvents);

/* =========================
   VALIDIERUNG
========================= */

/**
 * Register live validation events
 */
function registerValidationLiveEvents() {
  registerRequiredFieldLiveValidation("title", "error-title");
  registerRequiredFieldLiveValidation("due-date", "error-due-date");

  const taskFormElement = document.getElementById("taskForm");
  if (taskFormElement) {
    taskFormElement.addEventListener("reset", () => {
      requestAnimationFrame(clearAllValidationErrors);
    });
  }
}

/**
 * Register live validation for a required field
 * @param {string} inputId - Input element ID
 * @param {string} errorId - Error element ID
 */
function registerRequiredFieldLiveValidation(inputId, errorId) {
  const inputElement = document.getElementById(inputId);
  if (!inputElement) return;

  const validateCurrentField = () => {
    if (!inputElement.value.trim()) return;
    markFieldValid(inputElement, document.getElementById(errorId));
  };

  inputElement.addEventListener("input", validateCurrentField);
  inputElement.addEventListener("change", validateCurrentField);
}

/**
 * Clear all validation errors
 */
function clearAllValidationErrors() {
  clearFieldError("title", "error-title");
  clearFieldError("due-date", "error-due-date");
  clearFieldError("category", "error-category");
}

/**
 * Clear validation state of one field
 * @param {string} inputId - Input element ID
 * @param {string} errorId - Error element ID
 */
function clearFieldError(inputId, errorId) {
  const inputElement = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);

  if (inputElement) inputElement.classList.remove("input-error");
  if (errorElement) errorElement.classList.remove("active");
}

/**
 * Validates all required form fields
 * @returns {boolean} True if form is valid
 */
function validateForm() {
  let isFormValid = true;
  if (!checkRequiredField("title", "error-title")) isFormValid = false;
  if (!checkRequiredField("due-date", "error-due-date")) isFormValid = false;
  if (!validateCategoryField()) isFormValid = false;
  return isFormValid;
}

/**
 * Validates category field is set
 * @returns {boolean} True if category is selected
 */
function validateCategoryField() {
  const categoryInputElement = document.getElementById("category");
  const errorElement = document.getElementById("error-category");
  if (!categoryInputElement || !errorElement) return false;

  if (!categoryInputElement.value.trim()) {
    categoryInputElement.classList.add("input-error");
    errorElement.classList.add("active");
    return false;
  }

  categoryInputElement.classList.remove("input-error");
  errorElement.classList.remove("active");
  return true;
}

/**
 * Checks required field by input ID and error ID
 * @param {string} inputId - Input element ID
 * @param {string} errorId - Error element ID
 * @returns {boolean} True if field is valid
 */
function checkRequiredField(inputId, errorId) {
  const inputElement = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);
  if (!inputElement || !errorElement) return false;

  if (!inputElement.value.trim()) return markFieldInvalid(inputElement, errorElement);
  return markFieldValid(inputElement, errorElement);
}

/**
 * Marks field as invalid with error styling
 * @param {HTMLElement} inputElement - Input DOM element
 * @param {HTMLElement} errorElement - Error DOM element
 * @returns {boolean} Always returns false
 */
function markFieldInvalid(inputElement, errorElement) {
  inputElement.classList.add("input-error");
  errorElement.classList.add("active");
  return false;
}

/**
 * Marks field as valid and removes error styling
 * @param {HTMLElement} inputElement - Input DOM element
 * @param {HTMLElement} errorElement - Error DOM element
 * @returns {boolean} Always returns true
 */
function markFieldValid(inputElement, errorElement) {
  if (inputElement) inputElement.classList.remove("input-error");
  if (errorElement) errorElement.classList.remove("active");
  return true;
}