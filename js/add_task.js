// Wartet, bis das DOM vollständig geladen ist, und initialisiert die Add-Task-Seite
document.addEventListener("DOMContentLoaded", initializeAddTaskPage);

let contacts = [];

async function loadContacts() {
  const userId = sessionStorage.getItem("userId");

  if (userId === "guest") {
    // Beispiel-User laden
    contacts = await loadData("guest-contacts/") || [];
  } else {
    // Echte registrierte User laden
    contacts = await loadData("users/") || [];
  }

  renderAssigneeOptions();
}

// Initialisiert alle notwendigen Funktionen auf der Seite
async function initializeAddTaskPage() {
  setMinimumDateToToday();
  initializeFormEvents();
  await loadContacts();
  initPriorityIconHandlers();
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

  for (let i = 0; i < contacts.length; i++) {
    const assigneeLabel = createAssigneeLabel(contacts[i]);
    assigneeDropdown.appendChild(assigneeLabel);
  }
}

// Erstellt ein Label mit Checkbox für einen Assignee (Name + Farbe als data-Attribute)
function createAssigneeLabel(contact) {
  const row = document.createElement("div");
  row.className = "assignee-row";

  const initials = getInitials(contact.name);

  row.innerHTML = `
    <div class="assignee-left" tabindex="0" role="button">
      <div class="assignee-initials" style="background-color: ${contact.color};">
        ${initials}
      </div>
      <span class="assignee-name">${contact.name}</span>
    </div>

    <input
      class="assignee-checkbox"
      type="checkbox"
      data-name="${contact.name}"
      data-color="${contact.color}"
    >
  `;

  const left = row.querySelector(".assignee-left");
  const checkbox = row.querySelector(".assignee-checkbox");

  // Klick auf Name/Avatar -> blau markieren (Checkbox NICHT togglen)
  const selectByName = () => {
    // wenn nur 1 Zeile blau sein soll:
    document
      .querySelectorAll("#assignee-dropdown .assignee-row.name-selected")
      .forEach((el) => el.classList.remove("name-selected"));

    row.classList.add("name-selected");
  };

 left.addEventListener("click", (e) => {
  e.stopPropagation();

  // Checkbox togglen
  checkbox.checked = !checkbox.checked;

  // Optional: visuelle Hervorhebung synchronisieren
  if (checkbox.checked) {
    row.classList.add("name-selected");
  } else {
    row.classList.remove("name-selected");
  }

  updateAssigneeDisplay();
});

  left.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectByName();
    }
  });

  // Klick auf Checkbox -> nur checkbox, NIE blau markieren
 left.addEventListener("click", (e) => {
  e.stopPropagation();

  checkbox.checked = !checkbox.checked;

  if (checkbox.checked) {
    row.classList.add("name-selected");
  } else {
    row.classList.remove("name-selected");
  }

  updateAssigneeDisplay();
});

  checkbox.addEventListener("change", () => {
    updateAssigneeDisplay();
  });

  return row;
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


function handleSubtaskKey(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addSubtask();
  }
}


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

function getSelectedAssignees() {
  const selected = [];

  document.querySelectorAll('#assignee-dropdown input[type="checkbox"]:checked')
    .forEach((checkbox) => {
      selected.push({
        name: checkbox.dataset.name,
        color: checkbox.dataset.color
      });
    });

  return selected;
}


async function handleFormSubmit(event) {
  event.preventDefault();

  console.log("✅ handleFormSubmit fired"); 

  if (!validateForm()) return;

  const task = collectTaskData();

  try {
    const result = await postData("task", task);
    console.log("✅ saved:", result);

    handleClear();
    showSuccessAndRedirect();
  } catch (err) {
    console.error("❌ Firebase save failed:", err);
   
    const toast = ensureSuccessToast();
    toast.textContent = "Saving failed";
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
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

function ensureSuccessToast() {
  let el = document.getElementById("task-success");
  if (el) return el;

  el = document.createElement("div");
  el.id = "task-success";
  el.className = "task-success";
  el.textContent = "Task added to board";
  document.body.appendChild(el);
  return el;
}

function showSuccessAndRedirect() {
  const toast = ensureSuccessToast();
  toast.classList.remove("show");         
  void toast.offsetWidth;                 
  toast.classList.add("show");

  setTimeout(() => {
    window.location.href = "board.html"; 
  }, 2500);
}
