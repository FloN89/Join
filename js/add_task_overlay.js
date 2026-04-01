let overlayBootstrapped = false;

bootstrapAddTaskOverlay();

/* =========================
   ADD TASK OVERLAY
========================= */

/**
 * Boots the overlay initialization.
 */
function bootstrapAddTaskOverlay() {
  if (document.readyState === "loading") return document.addEventListener("DOMContentLoaded", initializeAddTaskOverlay, { once: true });
  initializeAddTaskOverlay();
}

/**
 * Initializes the add-task overlay.
 */
async function initializeAddTaskOverlay() {
  const taskFormElement = getElement("taskForm");
  if (!taskFormElement || overlayBootstrapped) return;
  overlayBootstrapped = true;
  taskFormElement.dataset.initialized = "true";
  setMinimumDateToToday();
  registerOverlayEvents();
  registerValidationLiveEvents();
  await loadContacts();
  initializePriorityIconHandlers();
  renderSubtaskList();
  updateAssigneeDisplay();
}

window.initializeAddTaskOverlay = initializeAddTaskOverlay;

/**
 * Activates the overlay user interface.
 */
function activateAddTaskOverlayUi() {
  getElement("add-task-overlay")?.classList.add("active");
  document.body.classList.add("overlay-open");
}

/**
 * Closes the overlay user interface.
 */
function closeAddTaskOverlay() {
  getElement("add-task-overlay")?.classList.remove("active");
  document.body.classList.remove("overlay-open");
}

/**
 * Stops click propagation inside the overlay.
 * @param {MouseEvent} mouseEvent - Click event.
 */
function stopOverlayClick(mouseEvent) {
  mouseEvent.stopPropagation();
}

/**
 * Registers all overlay events.
 */
function registerOverlayEvents() {
  registerOverlayFormSubmitEvent();
  registerDropdownEvents();
  registerCategoryOptionEvents();
  registerSubtaskEvents();
  registerOverlayClearButtonEvent();
  registerGlobalClickHandler();
}

/**
 * Registers the overlay submit handler.
 */
function registerOverlayFormSubmitEvent() {
  const taskFormElement = getElement("taskForm");
  if (!taskFormElement) return;
  taskFormElement.addEventListener("submit", handleOverlayFormSubmit);
}

/**
 * Registers the overlay clear button.
 */
function registerOverlayClearButtonEvent() {
  bindClick("clear-form-button", handleClear);
}

/**
 * Handles task creation in the overlay.
 * @param {SubmitEvent} submitEvent - Submit event.
 */
async function handleOverlayFormSubmit(submitEvent) {
  submitEvent.preventDefault();
  const submitButtonElement = readSubmitButton(submitEvent);
  disableButton(submitButtonElement);
  try {
    await submitOverlayTask();
  } catch (saveError) {
    handleOverlaySaveError(saveError);
  } finally {
    enableButton(submitButtonElement);
  }
}

/**
 * Submits the overlay task after validation.
 */
async function submitOverlayTask() {
  if (!validateForm()) return;
  const taskObject = buildOverlayTaskObject();
  await saveOverlayTask(taskObject);
  finalizeOverlayTaskCreation(taskObject);
}

/**
 * Reads the submit button.
 * @param {SubmitEvent} submitEvent - Submit event.
 * @returns {HTMLElement|null} Submit button.
 */
function readSubmitButton(submitEvent) {
  return submitEvent.submitter || document.querySelector("#taskForm .create-btn");
}

/**
 * Disables one button.
 * @param {HTMLElement|null} buttonElement - Button element.
 */
function disableButton(buttonElement) {
  if (!buttonElement) return;
  buttonElement.disabled = true;
}

/**
 * Enables one button.
 * @param {HTMLElement|null} buttonElement - Button element.
 */
function enableButton(buttonElement) {
  if (!buttonElement) return;
  buttonElement.disabled = false;
}

/**
 * Builds the overlay task object.
 * @returns {Object} Task data.
 */
function buildOverlayTaskObject() {
  return {
    ...collectTaskData(),
    status: window.currentBoardAddTaskStatus || "todo",
  };
}

/**
 * Saves the overlay task.
 * @param {Object} taskObject - Task data.
 */
async function saveOverlayTask(taskObject) {
  await postData(getTaskCollectionPath(), taskObject);
}

/**
 * Finalizes overlay task creation.
 * @param {Object} taskObject - Task data.
 */
function finalizeOverlayTaskCreation(taskObject) {
  handleClear();
  closeAddTaskOverlay();
  window.dispatchEvent(new CustomEvent("task-created", { detail: taskObject }));
}

/**
 * Handles an overlay save error.
 * @param {Error} saveError - Save error.
 */
function handleOverlaySaveError(saveError) {
  console.error("Saving failed:", saveError);
  if (typeof showSavingFailedToast === "function") return showSavingFailedToast();
  alert("Saving failed. Check console/network tab.");
}