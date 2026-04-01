document.addEventListener("DOMContentLoaded", initializeAddTaskPage);

/* =========================
   ADD TASK PAGE
========================= */

/**
 * Initializes the add-task page.
 */
async function initializeAddTaskPage() {
  setMinimumDateToToday();
  registerPageEvents();
  registerValidationLiveEvents();
  await loadContacts();
  initializePriorityIconHandlers();
  renderSubtaskList();
}

/**
 * Registers all page events.
 */
function registerPageEvents() {
  registerPageFormSubmitEvent();
  registerDropdownEvents();
  registerCategoryOptionEvents();
  registerSubtaskEvents();
  registerPageClearButtonEvent();
  registerGlobalClickHandler();
}

/**
 * Registers the page submit handler.
 */
function registerPageFormSubmitEvent() {
  const taskFormElement = getElement("taskForm");
  if (!taskFormElement) return;
  taskFormElement.addEventListener("submit", handlePageFormSubmit);
}

/**
 * Registers the page clear button.
 */
function registerPageClearButtonEvent() {
  bindClick("clear-form-button", handleClear);
}

/**
 * Handles task creation on the page.
 * @param {SubmitEvent} submitEvent - Submit event.
 */
async function handlePageFormSubmit(submitEvent) {
  submitEvent.preventDefault();
  if (!validateForm()) return;
  const taskObject = buildPageTaskObject();
  try {
    await postData(getTaskCollectionPath(), taskObject);
    handleClear();
    showSuccessAndRedirect();
  } catch (saveError) {
    showSavingFailedToast();
    console.error("Saving failed:", saveError);
  }
}

/**
 * Builds the page task object.
 * @returns {Object} Task data.
 */
function buildPageTaskObject() {
  return {
    ...collectTaskData(),
    status: "todo",
    createdAt: Date.now(),
  };
}