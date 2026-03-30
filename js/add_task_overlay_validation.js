/* =========================
   VALIDIERUNG
========================= */

function registerValidationLiveEvents() {
  registerRequiredFieldLiveValidation("title", "error-title");
  registerRequiredFieldLiveValidation("due-date", "error-due-date");
  registerCategoryLiveValidation();

  const taskFormElement = document.getElementById("taskForm");
  if (taskFormElement) {
    taskFormElement.addEventListener("reset", () => {
      requestAnimationFrame(clearAllValidationErrors);
    });
  }
}

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

function registerCategoryLiveValidation() {
  const categoryInputElement = document.getElementById("category");
  if (!categoryInputElement) return;

  categoryInputElement.addEventListener("change", () => {
    if (!categoryInputElement.value.trim()) return;
    clearFieldError("category", "error-category");
  });
}

function clearAllValidationErrors() {
  clearFieldError("title", "error-title");
  clearFieldError("due-date", "error-due-date");
  clearFieldError("category", "error-category");
}

function clearFieldError(inputId, errorId) {
  const inputElement = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);

  if (inputElement) inputElement.classList.remove("input-error");
  if (errorElement) errorElement.classList.remove("active");
}

function validateForm() {
  let isFormValid = true;

  if (!checkRequiredField("title", "error-title")) isFormValid = false;
  if (!checkRequiredField("due-date", "error-due-date")) isFormValid = false;
  if (!validateCategoryField()) isFormValid = false;

  return isFormValid;
}

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

function checkRequiredField(inputId, errorId) {
  const inputElement = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);
  if (!inputElement || !errorElement) return false;

  if (!inputElement.value.trim()) {
    return markFieldInvalid(inputElement, errorElement);
  }

  return markFieldValid(inputElement, errorElement);
}

function markFieldInvalid(inputElement, errorElement) {
  inputElement.classList.add("input-error");
  errorElement.classList.add("active");
  return false;
}

function markFieldValid(inputElement, errorElement) {
  if (inputElement) inputElement.classList.remove("input-error");
  if (errorElement) errorElement.classList.remove("active");
  return true;
}