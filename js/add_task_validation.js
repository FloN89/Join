/* =========================
   VALIDIERUNG
========================= */

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
    errorElement.classList.add("active");
    return false;
  }

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
  inputElement.classList.remove("input-error");
  errorElement.classList.remove("active");
  return true;
}
