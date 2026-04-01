let addTaskOverlayEventsBound = false;

/**
 * Initialisiert die Board-Overlay-Events genau einmal.
 */
document.addEventListener("DOMContentLoaded", () => {
  bindBoardAddTaskOverlayEventsOnce();
});

/**
 * Öffnet das Add-Task-Overlay im Board.
 * Auf Mobile wird auf die normale Add-Task-Seite weitergeleitet.
 *
 * @async
 * @param {string} status - Die Board-Spalte, aus der geöffnet wurde
 */
async function openBoardAddTaskOverlay(status = "todo") {
  window.currentBoardAddTaskStatus = status;

  if (window.innerWidth <= 768) {
    window.location.href = "../html/add_task.html";
    return;
  }

  const overlay = document.getElementById("add-task-overlay");
  const content = document.getElementById("add-task-content");

  if (!overlay || !content) {
    console.error("Add-task overlay container not found");
    return;
  }

  if (!content.innerHTML.trim()) {
    const response = await fetch("add_task_overlay.html", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to load add_task_overlay.html (${response.status})`);
    }

    content.innerHTML = await response.text();

    if (typeof initializeAddTaskOverlay === "function") {
      await initializeAddTaskOverlay();
    }
  }

  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
}

function openAddTaskOverlay(status = "todo") {
  return openBoardAddTaskOverlay(status);
}

/**
 * Schließt das Board-Overlay.
 */
function closeBoardAddTaskOverlay() {
  const overlayElement = document.getElementById("add-task-overlay");
  if (!overlayElement) return;

  overlayElement.classList.remove("active");
  overlayElement.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overlay-open");
}

/**
 * Alias, damit alle bestehenden onclick-Aufrufe weiter funktionieren.
 */
function closeAddTaskOverlay() {
  closeBoardAddTaskOverlay();
}

/**
 * Bindet globale Events nur einmal.
 */
function bindBoardAddTaskOverlayEventsOnce() {
  if (addTaskOverlayEventsBound) return;

  bindTaskCreatedRefreshEvent();
  bindEscapeCloseEvent();

  addTaskOverlayEventsBound = true;
}

/**
 * Lädt das Board neu, sobald im Overlay eine Task erstellt wurde.
 */
function bindTaskCreatedRefreshEvent() {
  window.addEventListener("task-created", async () => {
    closeBoardAddTaskOverlay();

    if (typeof fetchTasks === "function") {
      await fetchTasks();
    }
  });
}

/**
 * Schließt das Overlay per ESC.
 */
function bindEscapeCloseEvent() {
  document.addEventListener("keydown", (keyboardEvent) => {
    if (keyboardEvent.key !== "Escape") return;

    const overlayElement = document.getElementById("add-task-overlay");
    if (!overlayElement || !overlayElement.classList.contains("active")) return;

    closeBoardAddTaskOverlay();
  });
}