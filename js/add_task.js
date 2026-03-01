// Wartet, bis das DOM vollständig geladen ist, und initialisiert die Add-Task-Seite
document.addEventListener("DOMContentLoaded", initializeAddTaskPage);

const GUEST_CONTACTS_FALLBACK = [
  { name: "Alex",  color: "#FF7A00" },
  { name: "Mina",  color: "#1FD7C1" },
  { name: "Chris", color: "#6E52FF" },
];


let contacts = [];

async function loadContacts() {
  const userId = sessionStorage.getItem("userId");
  const isGuest = (!userId || userId === "guest");

  const path = isGuest ? "guest-contacts/" : "contacts/";
  const raw = (await loadData(path)) || [];

  let list = Array.isArray(raw) ? raw : Object.values(raw);

  // ✅ Guest-Fallback, wenn DB leer
  if (isGuest && list.length === 0) {
    list = GUEST_CONTACTS_FALLBACK;
  }

  contacts = list
    .map((c) => ({
      name: c.name || c.contactName || "",
      color: c.color || "#CCCCCC",
    }))
    .filter((c) => c.name.trim().length > 0);

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


/* =========================
   SUBTASKS (X | Divider | ✓)
========================= */

let subtaskCollection = [];

/** Löscht den aktuell eingegebenen Subtask-Text im Eingabefeld. */
function clearSubtaskInput() {
  const subtaskInputElement = document.getElementById("subtask");
  if (!subtaskInputElement) return;
  subtaskInputElement.value = "";
}

/** Fügt Subtask per Enter hinzu und verhindert Formular-Submit. */
function handleSubtaskKey(keyboardEvent) {
  if (keyboardEvent.key !== "Enter") return;
  keyboardEvent.preventDefault();
  addSubtask();
}

/** Liest den Input aus, legt den Subtask an und rendert die Liste neu. */
function addSubtask() {
  const subtaskInputElement = document.getElementById("subtask");
  if (!subtaskInputElement) return;
  const subtaskTitle = getTrimmedValue(subtaskInputElement.value);
  if (!subtaskTitle) return;
  subtaskCollection.push(createSubtaskObject(subtaskTitle));
  renderSubtaskList();
  subtaskInputElement.value = "";
}

/** Schneidet Text sauber zu (Whitespace entfernen) und liefert leeren Text als "". */
function getTrimmedValue(textValue) {
  if (typeof textValue !== "string") return "";
  return textValue.trim();
}

/** Erstellt ein einheitliches Subtask-Objekt für Speicherung und Anzeige. */
function createSubtaskObject(subtaskTitle) {
  return { title: subtaskTitle, completed: false };
}

/** Rendert alle Subtasks wie im Screenshot (Punkt links, Icons rechts). */
function renderSubtaskList() {
  const subtaskListElement = document.getElementById("subtask-list");
  if (!subtaskListElement) return;
  subtaskListElement.innerHTML = buildSubtaskListMarkup();
  attachSubtaskActionHandlers(subtaskListElement);
}

/** Baut das komplette HTML-Markup für alle Subtasks. */
function buildSubtaskListMarkup() {
  return subtaskCollection.map((subtaskObject, subtaskIndex) => {
    return buildSingleSubtaskMarkup(subtaskObject, subtaskIndex);
  }).join("");
}

/** Baut das Markup für genau einen Subtask (inkl. Edit/Delete Buttons). */
function buildSingleSubtaskMarkup(subtaskObject, subtaskIndex) {
  const safeTitle = escapeHtmlText(subtaskObject.title);
  return `
    <li class="subtask-item" data-subtask-index="${subtaskIndex}">
      <div class="subtask-left">
        <span class="subtask-bullet">•</span>
        <span class="subtask-title">${safeTitle}</span>
      </div>
      <div class="subtask-actions">
        <button type="button" data-action="edit" aria-label="Edit subtask">
          <img src="../assets/icons/edit.svg" alt="Edit">
        </button>
        <button type="button" data-action="delete" aria-label="Delete subtask">
          <img src="../assets/icons/delete.svg" alt="Delete">
        </button>
      </div>
    </li>
  `;
}

/** Verhindert HTML-Injection und stellt Text sicher dar. */
function escapeHtmlText(unsafeText) {
  return String(unsafeText)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** Hängt Event-Handling für Edit/Delete an die Liste (Event Delegation). */
function attachSubtaskActionHandlers(subtaskListElement) {
  subtaskListElement.onclick = (mouseEvent) => handleSubtaskListClick(mouseEvent);
}

/** Verteilt Klicks auf Edit/Delete Buttons an die passenden Aktionen. */
function handleSubtaskListClick(mouseEvent) {
  const actionButtonElement = mouseEvent.target.closest("button[data-action]");
  if (!actionButtonElement) return;
  const listItemElement = mouseEvent.target.closest("li[data-subtask-index]");
  if (!listItemElement) return;
  const subtaskIndex = Number(listItemElement.dataset.subtaskIndex);
  runSubtaskAction(actionButtonElement.dataset.action, subtaskIndex);
}

/** Führt je nach Action entweder Bearbeiten oder Löschen aus. */
function runSubtaskAction(actionName, subtaskIndex) {
  if (actionName === "delete") deleteSubtask(subtaskIndex);
  if (actionName === "edit") editSubtask(subtaskIndex);
}

/** Löscht einen Subtask aus der Sammlung und rendert die Liste neu. */
function deleteSubtask(subtaskIndex) {
  if (!isValidSubtaskIndex(subtaskIndex)) return;
  subtaskCollection.splice(subtaskIndex, 1);
  renderSubtaskList();
}

/** Bearbeitet einen Subtask-Titel per Prompt und rendert die Liste neu. */
function editSubtask(subtaskIndex) {
  if (!isValidSubtaskIndex(subtaskIndex)) return;
  const currentTitle = subtaskCollection[subtaskIndex].title;
  const newTitle = prompt("Edit subtask:", currentTitle);
  applyEditedSubtaskTitle(subtaskIndex, newTitle);
}

/** Validiert Index gegen die aktuelle Sammlung. */
function isValidSubtaskIndex(subtaskIndex) {
  return Number.isInteger(subtaskIndex) && subtaskIndex >= 0 && subtaskIndex < subtaskCollection.length;
}

/** Übernimmt den neuen Titel, wenn er gültig ist, und rendert neu. */
function applyEditedSubtaskTitle(subtaskIndex, newTitle) {
  const cleanedTitle = getTrimmedValue(newTitle ?? "");
  if (!cleanedTitle) return;
  subtaskCollection[subtaskIndex].title = cleanedTitle;
  renderSubtaskList();
}

/** Setzt Subtasks komplett zurück (Sammlung + Anzeige). */
function resetSubtasks() {
  subtaskCollection = [];
  renderSubtaskList();
}


/* =========================
   INTEGRATION: handleClear + collectTaskData
   -> diese Teile bei dir ersetzen/anpassen
========================= */

/** Setzt das komplette Formular zurück und leert auch Subtasks korrekt. */
function handleClear() {
  const taskForm = document.getElementById("taskForm");
  if (taskForm) taskForm.reset();
  resetSubtasks();

  document.querySelectorAll('#assignee-dropdown input[type="checkbox"]')
    .forEach((checkboxElement) => checkboxElement.checked = false);

  document.getElementById("selected-assignee-avatars").innerHTML = "";
  document.getElementById("selected-assignees-placeholder").textContent = "Select contacts";

  document.getElementById("category").value = "";
  document.getElementById("selected-category-placeholder").textContent = "Select category";

  updatePriorityIcons();
}

/** Sammelt alle Task-Daten ein, inkl. Subtasks aus der Sammlung. */
function collectTaskData() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("category").value;

  const priority =
    document.querySelector('input[name="priority"]:checked')?.value || "medium";

  const assignedTo = getSelectedAssignees();

  return {
    category,
    title,
    description,
    priority,
    assignedTo,
    subtasks: structuredClone(subtaskCollection)
  };
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
