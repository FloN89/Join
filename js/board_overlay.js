/**
 * Opens the add task overlay and loads content if needed
 * @async
 */
async function openAddTaskOverlay() {
  const overlay = document.getElementById("add-task-overlay");
  const content = document.getElementById("add-task-content");

  if (!content.innerHTML.trim()) {
    const response = await fetch("add_task_overlay.html");
    content.innerHTML = await response.text();

    if (typeof initializeAddTaskPage === "function") {
      initializeAddTaskPage();
    }
  }
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
}


/**
 * Closes the add task overlay
 */
function closeAddTaskOverlay() {
  const overlay = document.getElementById("add-task-overlay");
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overlay-open");
}
