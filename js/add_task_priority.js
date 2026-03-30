/**
 * Initialize priority icon handlers
 */
function initializePriorityIconHandlers() {
  const radioNodeList = document.querySelectorAll('input[name="priority"]');
  radioNodeList.forEach((radioElement) => {
    radioElement.addEventListener("change", updatePriorityIcons);
  });
  updatePriorityIcons();
}

/**
 * Update priority icons
 */
function updatePriorityIcons() {
  const urgentRadio = document.getElementById("priority-urgent");
  const mediumRadio = document.getElementById("priority-medium");
  const lowRadio = document.getElementById("priority-low");

  applyPriorityIcon("icon-urgent", urgentRadio, "urgent_white", "urgent_red");
  applyPriorityIcon("icon-medium", mediumRadio, "medium_white", "medium_yellow");
  applyPriorityIcon("icon-low", lowRadio, "low_white", "low_green");
}

/**
 * Apply priority icon
 * @param {string} iconId - ID value
 * @param {HTMLElement} radioElement - DOM element
 * @param {string} checkedName - Checked name value
 * @param {string} uncheckedName - Unchecked name value
 */
function applyPriorityIcon(iconId, radioElement, checkedName, uncheckedName) {
  const iconElement = document.getElementById(iconId);
  if (!iconElement || !radioElement) return;

  iconElement.src = radioElement.checked
    ? `../assets/icons/${checkedName}.svg`
    : `../assets/icons/${uncheckedName}.svg`;
}