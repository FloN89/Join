/**
 * Initializes priority icon updates.
 */
function initializePriorityIconHandlers() {
  document.querySelectorAll('input[name="priority"]').forEach(registerPriorityChangeEvent);
  updatePriorityIcons();
}

/**
 * Registers one priority change event.
 * @param {HTMLElement} radioElement - Radio input.
 */
function registerPriorityChangeEvent(radioElement) {
  radioElement.addEventListener("change", updatePriorityIcons);
}

/**
 * Updates all priority icons.
 */
function updatePriorityIcons() {
  applyPriorityIcon("icon-urgent", getElement("priority-urgent"), "urgent_white", "urgent_red");
  applyPriorityIcon("icon-medium", getElement("priority-medium"), "medium_white", "medium_yellow");
  applyPriorityIcon("icon-low", getElement("priority-low"), "low_white", "low_green");
}

/**
 * Applies the correct priority icon.
 * @param {string} iconId - Image identifier.
 * @param {HTMLElement|null} radioElement - Radio input.
 * @param {string} checkedName - Checked icon name.
 * @param {string} uncheckedName - Unchecked icon name.
 */
function applyPriorityIcon(iconId, radioElement, checkedName, uncheckedName) {
  const iconElement = getElement(iconId);
  if (!iconElement || !radioElement) return;
  iconElement.src = radioElement.checked ? `../assets/icons/${checkedName}.svg` : `../assets/icons/${uncheckedName}.svg`;
}