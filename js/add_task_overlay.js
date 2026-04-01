let overlayBootstrapped = false;

/**
 * Initializes the add-task overlay after the HTML was injected into the board.
 */
async function initializeAddTaskOverlay() {
  const taskFormElement = getElement("taskForm");
  if (!taskFormElement) return;

  if (overlayBootstrapped && taskFormElement.dataset.initialized === "true") {
    updateAssigneeDisplay();
    return;
  }

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
 * @param {SubmitEvent} submitEvent
 */
async function handleOverlayFormSubmit(submitEvent) {
  submitEvent.preventDefault();

  const submitButtonElement =
    submitEvent.submitter || document.querySelector("#taskForm .create-btn");

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
 * Validates and submits the overlay task.
 */
async function submitOverlayTask() {
  if (!validateForm()) return;

  const taskObject = buildOverlayTaskObject();
  await postData(getTaskCollectionPath(), taskObject);
  finalizeOverlayTaskCreation(taskObject);
}

/**
 * Builds the overlay task object.
 * @returns {Object}
 */
function buildOverlayTaskObject() {
  return {
    ...collectTaskData(),
    status: window.currentBoardAddTaskStatus || "todo",
  };
}

/**
 * Finalizes successful overlay creation.
 * Keeps board animation behavior unchanged.
 * @param {Object} taskObject
 */
function finalizeOverlayTaskCreation(taskObject) {
  handleClear();

  if (typeof closeBoardAddTaskOverlay === "function") {
    closeBoardAddTaskOverlay();
  } else {
    getElement("add-task-overlay")?.classList.remove("active");
    document.body.classList.remove("overlay-open");
  }

  window.dispatchEvent(new CustomEvent("task-created", { detail: taskObject }));
}

/**
 * Disables one button.
 * @param {HTMLElement|null} buttonElement
 */
function disableButton(buttonElement) {
  if (!buttonElement) return;
  buttonElement.disabled = true;
}

/**
 * Enables one button.
 * @param {HTMLElement|null} buttonElement
 */
function enableButton(buttonElement) {
  if (!buttonElement) return;
  buttonElement.disabled = false;
}

/**
 * Handles an overlay save error.
 * @param {Error} saveError
 */
function handleOverlaySaveError(saveError) {
  console.error("Saving failed:", saveError);

  if (typeof showSavingFailedToast === "function") {
    showSavingFailedToast();
    return;
  }

  alert("Saving failed. Check console/network tab.");
}