let currentTouchElement = null;
let touchClone = null;
let touchOffsetX = 0;
let touchOffsetY = 0;
let autoScrollInterval = null;
let touchStartX = 0;
let touchStartY = 0;
let isDragging = false;


/**
 * Handles touch start event for mobile drag and drop
 * @param {TouchEvent} touchEvent - The touch event
 */
function handleTouchStart(touchEvent) {
  currentTouchElement = touchEvent.currentTarget;
  currentDraggedElement = currentTouchElement;

  const touch = touchEvent.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  isDragging = false;

  const cardPosition = currentTouchElement.getBoundingClientRect();
  touchOffsetX = touch.clientX - cardPosition.left;
  touchOffsetY = touch.clientY - cardPosition.top;
}


/**
 * Checks if touch movement should start drag operation
 * @param {number} deltaX - Horizontal movement distance
 * @param {number} deltaY - Vertical movement distance
 * @returns {boolean} True if drag should start
 */
function shouldStartTouchDrag(deltaX, deltaY) {
  if (deltaX < 10 && deltaY < 10) return false;
  if (deltaX > deltaY) return false;
  return true;
}


/**
 * Initializes touch drag by creating clone element
 * @param {number} fingerX - Touch X coordinate
 * @param {number} fingerY - Touch Y coordinate
 */
function initializeTouchDrag(fingerX, fingerY) {
  isDragging = true;
  currentTouchElement.classList.add("dragging");
  touchClone = currentTouchElement.cloneNode(true);
  touchClone.classList.add("touch-clone");
  touchClone.classList.remove("dragging");
  document.body.appendChild(touchClone);
  touchClone.style.left = fingerX - touchOffsetX + "px";
  touchClone.style.top = fingerY - touchOffsetY + "px";
}


/**
 * Updates position of touch clone element
 * @param {number} fingerX - Touch X coordinate
 * @param {number} fingerY - Touch Y coordinate
 */
function updateTouchClonePosition(fingerX, fingerY) {
  touchClone.style.left = fingerX - touchOffsetX + "px";
  touchClone.style.top = fingerY - touchOffsetY + "px";
}


/**
 * Handles auto-scroll when dragging near screen edges
 * @param {number} fingerY - Touch Y coordinate
 */
function handleTouchAutoScroll(fingerY) {
  const scrollZone = 100;
  const scrollSpeed = 10;
  const windowHeight = window.innerHeight;

  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }

  if (fingerY < scrollZone) {
    autoScrollInterval = setInterval(() => window.scrollBy(0, -scrollSpeed), 20);
  } else if (fingerY > windowHeight - scrollZone) {
    autoScrollInterval = setInterval(() => window.scrollBy(0, scrollSpeed), 20);
  }
}


/**
 * Highlights the drop zone under finger during drag
 * @param {number} fingerX - Touch X coordinate
 * @param {number} fingerY - Touch Y coordinate
 */
function highlightTouchDropZone(fingerX, fingerY) {
  touchClone.style.display = "none";
  const elementUnderFinger = document.elementFromPoint(fingerX, fingerY);
  touchClone.style.display = "block";

  document.querySelectorAll(".task-list").forEach(list => {
    list.classList.remove("drag-over");
  });

  if (elementUnderFinger) {
    const taskListUnderFinger = elementUnderFinger.closest(".task-list");
    if (taskListUnderFinger) {
      taskListUnderFinger.classList.add("drag-over");
    }
  }
}


/**
 * Handles touch move event during drag
 * @param {TouchEvent} touchEvent - The touch event
 */
function handleTouchMove(touchEvent) {
  if (!currentTouchElement) return;
  const touch = touchEvent.touches[0];
  const fingerX = touch.clientX;
  const fingerY = touch.clientY;

  processTouchDragStart(fingerX, fingerY);
  if (!isDragging || !touchClone) return;

  if (touchEvent.cancelable) {
    touchEvent.preventDefault();
  }
  updateTouchDragPosition(fingerX, fingerY);
}


/**
 * Processes touch drag start with threshold check
 * @param {number} fingerX - Touch X coordinate
 * @param {number} fingerY - Touch Y coordinate
 */
function processTouchDragStart(fingerX, fingerY) {
  const deltaX = Math.abs(fingerX - touchStartX);
  const deltaY = Math.abs(fingerY - touchStartY);
  if (!isDragging && shouldStartTouchDrag(deltaX, deltaY)) {
    initializeTouchDrag(fingerX, fingerY);
  }
}


/**
 * Updates drag position and handles scroll and highlighting
 * @param {number} fingerX - Touch X coordinate
 * @param {number} fingerY - Touch Y coordinate
 */
function updateTouchDragPosition(fingerX, fingerY) {
  updateTouchClonePosition(fingerX, fingerY);
  handleTouchAutoScroll(fingerY);
  highlightTouchDropZone(fingerX, fingerY);
}


/**
 * Stops auto-scroll interval
 */
function stopTouchAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}


/**
 * Finds drop target element at finger position
 * @param {number} fingerX - Touch X coordinate
 * @param {number} fingerY - Touch Y coordinate
 * @returns {Element} Element at drop position
 */
function findTouchDropTarget(fingerX, fingerY) {
  touchClone.style.display = "none";
  const elementAtDropPosition = document.elementFromPoint(fingerX, fingerY);
  touchClone.remove();
  touchClone = null;
  return elementAtDropPosition;
}


/**
 * Clears drag-over states from all task lists
 */
function clearTouchDragOverStates() {
  document.querySelectorAll(".task-list").forEach(list => {
    list.classList.remove("drag-over");
  });
}


/**
 * Processes touch drop and updates task status
 * @param {Element} elementAtDropPosition - Element at drop position
 */
function processTouchDrop(elementAtDropPosition) {
  if (!elementAtDropPosition) return;

  const targetTaskList = elementAtDropPosition.closest(".task-list");
  if (targetTaskList && currentDraggedElement) {
    targetTaskList.appendChild(currentDraggedElement);
    updateEmptyStates();
    updateTaskStatus(currentDraggedElement, targetTaskList.id);
  }
}


/**
 * Resets touch drag state variables
 */
function resetTouchDragState() {
  currentTouchElement = null;
  currentDraggedElement = null;
  isDragging = false;
}


/**
 * Handles touch end event
 * @param {TouchEvent} touchEvent - The touch event
 */
function handleTouchEnd(touchEvent) {
  if (!currentTouchElement) return;
  stopTouchAutoScroll();

  if (isDragging) {
    finalizeTouchDrag(touchEvent);
  }

  resetTouchDragState();
}


/**
 * Finalizes touch drag operation
 * @param {TouchEvent} touchEvent - The touch event
 */
function finalizeTouchDrag(touchEvent) {
  currentTouchElement.classList.remove("dragging");
  const touch = touchEvent.changedTouches[0];
  if (touchClone) {
    completeTouchDrop(touch.clientX, touch.clientY);
  }
}


/**
 * Completes touch drop operation
 * @param {number} fingerX - Touch X coordinate
 * @param {number} fingerY - Touch Y coordinate
 */
function completeTouchDrop(fingerX, fingerY) {
  const dropTarget = findTouchDropTarget(fingerX, fingerY);
  clearTouchDragOverStates();
  processTouchDrop(dropTarget);
}
