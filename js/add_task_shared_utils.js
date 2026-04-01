/**
 * Returns trimmed text.
 * @param {string} textValue - Input text.
 * @returns {string} Clean text.
 */
function getTrimmedValue(textValue) {
  if (typeof textValue !== "string") return "";
  return textValue.trim();
}

/**
 * Escapes unsafe HTML text.
 * @param {string} unsafeText - Raw text.
 * @returns {string} Safe text.
 */
function escapeHtmlText(unsafeText) {
  return String(unsafeText)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Checks whether a subtask index exists.
 * @param {number} subtaskIndex - Array index.
 * @returns {boolean} True when valid.
 */
function isValidSubtaskIndex(subtaskIndex) {
  return Number.isInteger(subtaskIndex) && subtaskIndex >= 0 && subtaskIndex < subtaskCollection.length;
}

/**
 * Returns the correct task collection path.
 * @returns {string} Storage path.
 */
function getTaskCollectionPath() {
  return sessionStorage.getItem("userId") === "guest" ? "guest-tasks" : "task";
}

/**
 * Reads an element by identifier.
 * @param {string} elementId - Element identifier.
 * @returns {HTMLElement|null} Matching element.
 */
function getElement(elementId) {
  return document.getElementById(elementId);
}

/**
 * Returns whether the current session is a guest session.
 * @returns {boolean} True for guest users.
 */
function isGuestSessionUser() {
  const userId = sessionStorage.getItem("userId");
  return !userId || userId === "guest";
}

/**
 * Returns initials from a full name.
 * @param {string} fullName - Contact name.
 * @returns {string} Initial letters.
 */
function getInitials(fullName) {
  return String(fullName)
    .split(" ")
    .filter((namePart) => namePart.length > 0)
    .map((namePart) => namePart[0].toUpperCase())
    .join("");
}

/**
 * Sets the minimum date to today.
 */
function setMinimumDateToToday() {
  const dateInputElement = getElement("due-date");
  if (!dateInputElement) return;
  dateInputElement.min = new Date().toISOString().split("T")[0];
}

/**
 * Adds one class and optionally removes one class.
 * @param {HTMLElement|null} element - Target element.
 * @param {string} classToAdd - Class to add.
 * @param {string} classToRemove - Class to remove.
 */
function swapClass(element, classToAdd, classToRemove = "") {
  if (!element) return;
  if (classToRemove) element.classList.remove(classToRemove);
  if (classToAdd) element.classList.add(classToAdd);
}