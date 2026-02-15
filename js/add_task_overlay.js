// Wartet, bis das DOM vollständig geladen ist, und initialisiert die Add-Task-Seite
document.addEventListener("DOMContentLoaded", initializeAddTaskPage);

// Liste aller verfügbaren Kontakte für die Zuweisung (Name + Farbe)
const contacts = [
  { name: "Anton Mayer", color: "#FF7A00" },
  { name: "Evelyne Meyer", color: "#1FD7C1" },
  { name: "Marcel Bauer", color: "#462F8A" }
];

// Initialisiert alle notwendigen Funktionen auf der Seite
function initializeAddTaskPage() {
  setMinimumDateToToday();
  initializeFormEvents();
  renderAssigneeOptions();
  initPriorityIconHandlers();
}

// Öffnet das Add-Task-Overlay und verhindert Scrollen im Hintergrund
function openAddTaskOverlay() {
  const overlayElement = document.getElementById("add-task-overlay");
  if (!overlayElement) return;

  overlayElement.classList.add("active");
  document.body.classList.add("overlay-open");
}

// Schließt das Add-Task-Overlay und erlaubt wieder Scrollen im Hintergrund
function closeAddTaskOverlay() {
  const overlayElement = document.getElementById("add-task-overlay");
  if (!overlayElement) return;

  overlayElement.classList.remove("active");
  document.body.classList.remove("overlay-open");
}

// Verhindert, dass Klicks im Overlay den Klick-Handler des Hintergrunds auslösen
function stopOverlayClick(event) {
  event.stopPropagation();
}

// Setzt das minimale auswählbare Datum im Datumsfeld auf heute (UI-only)
function setMinimumDateToToday() {
  const dateInput = document.getElementById("due-date");
  if (!dateInput) return;

  const todayDate = new Date().toISOString().split("T")[0];
  dateInput.min = todayDate;
}

// Registriert alle Formular-Events
function initializeFormEvents() {
  const taskForm = document.getElementById("taskForm");
  if (!taskForm) return;

  taskForm.addEventListener("submit", handleFormSubmit);
}

// Validiert das gesamte Formular
function validateForm() {
  let isFormValid = true;

  if (!checkRequiredField("title", "error-title")) isFormValid = false;
  // due-date wird NICHT mehr für Firebase gebraucht -> nicht als Pflichtfeld validieren
  if (!validateCategoryField()) isFormValid = false;

  return isFormValid;
}

// Prüft, ob eine Kategorie ausgewählt wurde
function validateCategoryField() {
  const categoryInput = document.getElementById("category");
  const categoryError = document.getElementById("error-category");

  if (!categoryInput.value.trim()) {
    categoryError.classList.add("active");
    return false;
  }

  categoryError.classList.remove("active");
  return true;
}

// Prüft ein Pflichtfeld anhand seiner ID
function checkRequiredField(inputId, errorId) {
  const inputElement = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);

  if (!inputElement.value.trim()) {
    inputElement.classList.add("input-error");
    errorElement.classList.add("active");
    return false;
  }

  inputElement.classList.remove("input-error");
  errorElement.classList.remove("active");
  return true;
}

// Rendert alle verfügbaren Assignee-Optionen
function renderAssigneeOptions() {
  const assigneeDropdown = document.getElementById("assignee-dropdown");
  if (!assigneeDropdown) return;

  assigneeDropdown.innerHTML = "";

  for (let i = 0; i < contacts.length; i++) {
    assigneeDropdown.appendChild(createAssigneeLabel(contacts[i]));
  }
}

// Erstellt ein Label mit Checkbox für einen Assignee (Name + Farbe als data-Attribute)
function createAssigneeLabel(contact) {
  const labelElement = document.createElement("label");
  labelElement.className = "checkbox-label";

  labelElement.innerHTML = `
    <span>${contact.name}</span>
    <input
      type="checkbox"
      data-name="${contact.name}"
      data-color="${contact.color}"
      onchange="updateAssigneeDisplay()"
    >
  `;

  return labelElement;
}

// Aktualisiert die Anzeige der ausgewählten Assignees
function updateAssigneeDisplay() {
  const assignedTo = getSelectedAssignees();
  const placeholderText = document.getElementById("selected-assignees-placeholder");
  const avatarContainer = document.getElementById("selected-assignee-avatars");

  avatarContainer.innerHTML = "";

  if (assignedTo.length === 0) {
    placeholderText.textContent = "Select contacts";
    return;
  }

  placeholderText.textContent = assignedTo.map((a) => a.name).join(", ");
  renderAssigneeAvatars(assignedTo, avatarContainer);
}

// Gibt alle aktuell ausgewählten Assignees zurück (als Objekte)
function getSelectedAssignees() {
  const checkboxElements = document.querySelectorAll("#assignee-dropdown input");
  const selected = [];

  for (let i = 0; i < checkboxElements.length; i++) {
    const cb = checkboxElements[i];
    if (cb.checked) {
      selected.push({
        name: cb.dataset.name,
        color: cb.dataset.color
      });
    }
  }

  return selected;
}

// Rendert Initialen-Avatare für ausgewählte Assignees (mit Farbe)
function renderAssigneeAvatars(assignedTo, container) {
  for (let i = 0; i < assignedTo.length; i++) {
    const avatarElement = document.createElement("div");
    avatarElement.className = "avatar";
    avatarElement.textContent = getInitials(assignedTo[i].name);
    avatarElement.style.backgroundColor = assignedTo[i].color;
    container.appendChild(avatarElement);
  }
}

// Erstellt Initialen aus einem vollständigen Namen
function getInitials(fullName) {
  const nameParts = fullName.split(" ");
  let initials = "";

  for (let i = 0; i < nameParts.length; i++) {
    if (nameParts[i].length > 0) initials += nameParts[i][0].toUpperCase();
  }

  return initials;
}

// Öffnet oder schließt das Assignee-Dropdown
function toggleAssigneeDropdown() {
  const assigneeDropdown = document.getElementById("assignee-dropdown");
  assigneeDropdown.classList.toggle("d-none");

  const categoryDropdown = document.getElementById("category-dropdown");
  if (categoryDropdown && !categoryDropdown.classList.contains("d-none")) {
    categoryDropdown.classList.add("d-none");
  }
}

// Öffnet oder schließt das Kategorie-Dropdown
function toggleCategoryDropdown() {
  const categoryDropdown = document.getElementById("category-dropdown");
  categoryDropdown.classList.toggle("d-none");

  const assigneeDropdown = document.getElementById("assignee-dropdown");
  if (assigneeDropdown && !assigneeDropdown.classList.contains("d-none")) {
    assigneeDropdown.classList.add("d-none");
  }
}

// Setzt die ausgewählte Kategorie
function selectCategory(categoryValue) {
  const hiddenCategoryInput = document.getElementById("category");
  const categoryPlaceholder = document.getElementById("selected-category-placeholder");

  hiddenCategoryInput.value = categoryValue;

  if (categoryValue === "technical-task") categoryPlaceholder.textContent = "Technical Task";
  if (categoryValue === "user-story") categoryPlaceholder.textContent = "User Story";

  document.getElementById("category-dropdown").classList.add("d-none");
  document.getElementById("error-category").classList.remove("active");
}

// Reagiert auf die Enter-Taste im Subtask-Feld
function handleSubtaskKey(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addSubtask();
  }
}

// Fügt einen neuen Subtask hinzu (click = remove)
function addSubtask() {
  const subtaskInput = document.getElementById("subtask");
  const subtaskText = subtaskInput.value.trim();

  if (!subtaskText) return;

  const listItem = document.createElement("li");
  listItem.className = "subtask-item";
  listItem.textContent = "• " + subtaskText;

  listItem.addEventListener("click", () => listItem.remove());

  document.getElementById("subtask-list").appendChild(listItem);
  subtaskInput.value = "";
}

// Setzt das komplette Formular zurück
function handleClear() {
  const taskForm = document.getElementById("taskForm");
  taskForm.reset();

  document.getElementById("subtask-list").innerHTML = "";

  document
    .querySelectorAll('#assignee-dropdown input[type="checkbox"]')
    .forEach((checkbox) => (checkbox.checked = false));

  document.getElementById("selected-assignee-avatars").innerHTML = "";
  document.getElementById("selected-assignees-placeholder").textContent = "Select contacts";

  document.getElementById("category").value = "";
  document.getElementById("selected-category-placeholder").textContent = "Select category";

  updatePriorityIcons();
}

// Sammelt alle Eingabedaten aus dem Add-Task-Formular (EXAKT deine Firebase-Struktur)
function collectTaskData() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;

  const priority =
    document.querySelector('input[name="priority"]:checked')?.value || "medium";

  const assignedTo = getSelectedAssignees();

  const subtasks = [];
  document.querySelectorAll("#subtask-list .subtask-item").forEach((li) => {
    subtasks.push({
      title: li.textContent.replace("• ", "").trim(),
      completed: false
    });
  });

  return {
    category,
    title,
    description,
    priority,
    assignedTo,
    subtasks
  };
}

// Speichert einen Task in der Firebase Realtime Database
async function saveTaskToFirebase(task) {
  await postData("tasks", task);
}

// Wird beim Absenden des Formulars aufgerufen
async function handleFormSubmit(event) {
  event.preventDefault();

  if (!validateForm()) return;

  const task = collectTaskData();

  try {
    await saveTaskToFirebase(task);
    alert("Task successfully saved!");
    handleClear();
  } catch (err) {
    console.error("Firebase save failed:", err);
    alert("Saving failed. Check console/network tab.");
  }
}

// PRIORITY ICONS 
function initPriorityIconHandlers() {
  const radios = document.querySelectorAll('input[name="priority"]');
  radios.forEach((radio) => radio.addEventListener("change", updatePriorityIcons));
  updatePriorityIcons();
}

function updatePriorityIcons() {
  const urgent = document.getElementById("priority-urgent");
  const medium = document.getElementById("priority-medium");
  const low = document.getElementById("priority-low");

  const iconUrgent = document.getElementById("icon-urgent");
  const iconMedium = document.getElementById("icon-medium");
  const iconLow = document.getElementById("icon-low");

  if (!urgent || !medium || !low || !iconUrgent || !iconMedium || !iconLow) return;

  iconUrgent.src = urgent.checked
    ? "../assets/icons/urgent_white.svg"
    : "../assets/icons/urgent_red.svg";

  iconMedium.src = medium.checked
    ? "../assets/icons/medium_white.svg"
    : "../assets/icons/medium_yellow.svg";

  iconLow.src = low.checked
    ? "../assets/icons/low_white.svg"
    : "../assets/icons/low_green.svg";
}
