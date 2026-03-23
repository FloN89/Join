/**
 * Opens the add task UI.
 * On mobile devices, it redirects to the normal add task page.
 * On larger screens, it opens the add task overlay.
 *
 * @async
 * @param {string} status - The task status/column where the new task should be added
 */
async function openAddTaskOverlay(status) {
  // Redirect to the normal Add Task page on mobile devices
  if (window.innerWidth <= 768) {
    window.location.href = "../html/add_task.html";
    return;
  }

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