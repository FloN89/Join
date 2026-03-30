/* =========================
   LIVE VALIDATION
   ========================= */

function registerLiveValidationHandlers() {
  registerRequiredFieldLiveValidation("title", "error-title");
  registerRequiredFieldLiveValidation("due-date", "error-due-date");

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
    clearFieldError(inputId, errorId);
  };

  inputElement.addEventListener("input", validateCurrentField);
  inputElement.addEventListener("change", validateCurrentField);
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