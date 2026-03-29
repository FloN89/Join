/**
 * Get trimmed value
 * @param {string} textValue - Text value
 * @returns {string} Return value
 */
function getTrimmedValue(textValue) {
  if (typeof textValue !== "string") return "";
  return textValue.trim();
}

/**
 * Escape html text
 * @param {string} unsafeText - Unsafe text value
 * @returns {string} Return value
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
 * Is valid subtask index
 * @param {number} subtaskIndex - Subtask index value
 * @returns {boolean} Return value
 */
function isValidSubtaskIndex(subtaskIndex) {
  return Number.isInteger(subtaskIndex) && subtaskIndex >= 0 && subtaskIndex < subtaskCollection.length;
}