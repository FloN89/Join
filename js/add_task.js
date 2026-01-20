// Wartet, bis das DOM vollständig geladen ist, und initialisiert die Add-Task-Seite
 
document.addEventListener("DOMContentLoaded", initializeAddTaskPage);

// Liste aller verfügbaren Kontakte für die Zuweisung
 
const contacts = ["Enrico Hof", "Osman A", "Florian Narr"];

// Initialisiert alle notwendigen Funktionen auf der Seite
 
function initializeAddTaskPage() {
  setMinimumDateToToday();
  initializeFormEvents();
  renderAssigneeOptions();
}

// Setzt das minimale auswählbare Datum im Datumsfeld auf heute
 
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
  if (!checkRequiredField("due-date", "error-due-date")) isFormValid = false;
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

  for (let index = 0; index < contacts.length; index++) {
    const assigneeLabel = createAssigneeLabel(contacts[index]);
    assigneeDropdown.appendChild(assigneeLabel);
  }
}

// Erstellt ein Label mit Checkbox für einen Assignee
 
function createAssigneeLabel(assigneeName) {
  const labelElement = document.createElement("label");
  labelElement.className = "checkbox-label";

  labelElement.innerHTML = `
    <span>${assigneeName}</span>
    <input type="checkbox" value="${assigneeName}" onchange="updateAssigneeDisplay()">
  `;

  return labelElement;
}

// Aktualisiert die Anzeige der ausgewählten Assignees
 
function updateAssigneeDisplay() {
  const selectedAssignees = getSelectedAssignees();
  const placeholderText = document.getElementById("selected-assignees-placeholder");
  const avatarContainer = document.getElementById("selected-assignee-avatars");

  avatarContainer.innerHTML = "";

  if (selectedAssignees.length === 0) {
    placeholderText.textContent = "Select contacts";
    return;
  }

  placeholderText.textContent = selectedAssignees.join(", ");
  renderAssigneeAvatars(selectedAssignees, avatarContainer);
}

// Gibt alle aktuell ausgewählten Assignees zurück
 
function getSelectedAssignees() {
  const checkboxElements = document.querySelectorAll("#assignee-dropdown input");
  const selectedNames = [];

  for (let index = 0; index < checkboxElements.length; index++) {
    if (checkboxElements[index].checked) {
      selectedNames.push(checkboxElements[index].value);
    }
  }

  return selectedNames;
}

// Rendert Initialen-Avatare für ausgewählte Assignees
 
function renderAssigneeAvatars(names, container) {
  for (let index = 0; index < names.length; index++) {
    const avatarElement = document.createElement("div");
    avatarElement.className = "avatar";
    avatarElement.textContent = getInitials(names[index]);
    container.appendChild(avatarElement);
  }
}

// Erstellt Initialen aus einem vollständigen Namen
 
function getInitials(fullName) {
  const nameParts = fullName.split(" ");
  let initials = "";

  for (let index = 0; index < nameParts.length; index++) {
    if (nameParts[index].length > 0) {
      initials += nameParts[index][0].toUpperCase();
    }
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

  if (categoryValue === "technical-task") {
    categoryPlaceholder.textContent = "Technical Task";
  } else if (categoryValue === "user-story") {
    categoryPlaceholder.textContent = "User Story";
  }

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

// Fügt einen neuen Subtask hinzu
 
function addSubtask() {
  const subtaskInput = document.getElementById("subtask");
  const subtaskText = subtaskInput.value.trim();

  if (!subtaskText) return;

  const listItem = document.createElement("li");
  listItem.className = "subtask-item";
  listItem.textContent = "• " + subtaskText;

  listItem.addEventListener("click", () => {
    listItem.remove();
  });

  document.getElementById("subtask-list").appendChild(listItem);
  subtaskInput.value = "";
}

// Setzt das komplette Formular zurück
 
function handleClear() {
  const taskForm = document.getElementById("taskForm");
  taskForm.reset();

  document.getElementById("subtask-list").innerHTML = "";

  const checkboxElements = document.querySelectorAll(
    '#assignee-dropdown input[type="checkbox"]'
  );

  checkboxElements.forEach((checkbox) => {
    checkbox.checked = false;
  });

  document.getElementById("selected-assignee-avatars").innerHTML = "";
  document.getElementById("selected-assignees-placeholder").textContent =
    "Select contacts";

  document.getElementById("category").value = "";
  document.getElementById("selected-category-placeholder").textContent =
    "Select category";
}

// Sammelt alle Eingabedaten aus dem Add-Task-Formular
function collectTaskData() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const dueDate = document.getElementById("due-date").value;
  const category = document.getElementById("category").value;

  // Ausgewählte Kontakte ermitteln
  const assignees = getSelectedAssignees();

  // Aktive Priorität aus den Radio-Buttons holen
  const priority = document.querySelector(
    'input[name="priority"]:checked'
  )?.value || "medium";

  // Subtasks aus der Liste sammeln
  const subtasks = [];
  document.querySelectorAll("#subtask-list .subtask-item").forEach(li => {
    subtasks.push({
      title: li.textContent.replace("• ", ""),
      done: false
    });
  });

  // Task-Objekt für Firebase zurückgeben
  return {
    title,
    description,
    dueDate,
    category,
    priority,
    assignees,
    subtasks,
    status: "todo",       // Startstatus für das Board
    createdAt: Date.now()
  };
}

// Speichert einen Task in der Firebase Realtime Database
async function saveTaskToFirebase(task) {
  await postData("tasks", task);
}

// Wird beim Absenden des Formulars aufgerufen
async function handleFormSubmit(event) {
  event.preventDefault();

  // Formular validieren
  if (!validateForm()) return;

  // Task-Daten sammeln
  const task = collectTaskData();

  // Task in Firebase speichern
  await saveTaskToFirebase(task);

  // Erfolgsfeedback
  alert("Task successfully saved!");

  // Formular und Subtasks zurücksetzen
  document.getElementById("taskForm").reset();
  document.getElementById("subtask-list").innerHTML = "";
}
