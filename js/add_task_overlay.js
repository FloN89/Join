document.addEventListener("DOMContentLoaded", initAddTaskPage);

var contacts = ["Enrico Hof", "Osman A", "Florian Narr"];

function initAddTaskPage() {
  setMinDateToday();
  initFormEvents();
  renderAssigneeOptions();
}


function openAddTaskOverlay() {
  var overlay = document.getElementById("add-task-overlay");
  if (overlay) {
    overlay.classList.add("active");
  }
}

function closeAddTaskOverlay() {
  var overlay = document.getElementById("add-task-overlay");
  if (overlay) {
    overlay.classList.remove("active");
  }
}

function setMinDateToday() {
  var input = document.getElementById("due-date");
  if (!input) return;
  var today = new Date().toISOString().split("T")[0];
  input.min = today;
}

function initFormEvents() {
  var form = document.getElementById("taskForm");
  if (!form) return;
  form.addEventListener("submit", handleFormSubmit);
}

function handleFormSubmit(event) {
  event.preventDefault();
  if (validateForm()) {
    alert("Task created successfully!");
    var form = document.getElementById("taskForm");
    form.reset();
    document.getElementById("subtask-list").innerHTML = "";
  }
}

function validateForm() {
  var ok = true;
  if (!checkRequiredField("title", "error-title")) ok = false;
  if (!checkRequiredField("due-date", "error-due-date")) ok = false;
  if (!validateCategoryField()) ok = false;
  return ok;
}

function validateCategoryField() {
  var category = document.getElementById("category");
  var error = document.getElementById("error-category");
  if (!category.value.trim()) {
    error.classList.add("active");
    return false;
  }
  error.classList.remove("active");
  return true;
}

function checkRequiredField(inputId, errorId) {
  var input = document.getElementById(inputId);
  var error = document.getElementById(errorId);
  if (!input.value.trim()) {
    input.classList.add("input-error");
    error.classList.add("active");
    return false;
  }
  input.classList.remove("input-error");
  error.classList.remove("active");
  return true;
}

function renderAssigneeOptions() {
  var container = document.getElementById("assignee-dropdown");
  if (!container) return;
  container.innerHTML = "";
  for (var i = 0; i < contacts.length; i++) {
    var label = createAssigneeLabel(contacts[i]);
    container.appendChild(label);
  }
}

function createAssigneeLabel(name) {
  var label = document.createElement("label");
  label.className = "checkbox-label";
  var html = "<span>" + name + "</span>";
  html += '<input type="checkbox" value="' + name + '"';
  html += ' onchange="updateAssigneeDisplay()">';
  label.innerHTML = html;
  return label;
}

function updateAssigneeDisplay() {
  var names = getSelectedAssignees();
  var placeholder = document.getElementById("selected-assignees-placeholder");
  var box = document.getElementById("selected-assignee-avatars");
  box.innerHTML = "";
  if (names.length === 0) {
    placeholder.textContent = "Select contacts";
    return;
  }
  placeholder.textContent = names.join(", ");
  renderAssigneeAvatars(names, box);
}

function getSelectedAssignees() {
  var checks = document.querySelectorAll("#assignee-dropdown input");
  var selected = [];
  for (var i = 0; i < checks.length; i++) {
    if (checks[i].checked) selected.push(checks[i].value);
  }
  return selected;
}

function renderAssigneeAvatars(names, box) {
  for (var i = 0; i < names.length; i++) {
    var div = document.createElement("div");
    div.className = "avatar";
    div.textContent = getInitials(names[i]);
    box.appendChild(div);
  }
}

function getInitials(name) {
  var parts = name.split(" ");
  var initials = "";
  for (var i = 0; i < parts.length; i++) {
    if (parts[i].length > 0) initials += parts[i][0].toUpperCase();
  }
  return initials;
}

function toggleAssigneeDropdown() {
  var box = document.getElementById("assignee-dropdown");
  box.classList.toggle("d-none");
  var cat = document.getElementById("category-dropdown");
  if (cat && !cat.classList.contains("d-none")) cat.classList.add("d-none");
}

function toggleCategoryDropdown() {
  var box = document.getElementById("category-dropdown");
  box.classList.toggle("d-none");
  var ass = document.getElementById("assignee-dropdown");
  if (ass && !ass.classList.contains("d-none")) ass.classList.add("d-none");
}

function selectCategory(value) {
  var hidden = document.getElementById("category");
  var text = document.getElementById("selected-category-placeholder");
  hidden.value = value;
  if (value === "technical-task") text.textContent = "Technical Task";
  else if (value === "user-story") text.textContent = "User Story";
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
  var input = document.getElementById("subtask");
  var text = input.value.trim();
  if (!text) return;
  var li = document.createElement("li");
  li.className = "subtask-item";
  li.textContent = "• " + text;
  li.addEventListener("click", function () {
    li.remove();
  });
  document.getElementById("subtask-list").appendChild(li);
  input.value = "";
}

function handleClear() {
  var form = document.getElementById("taskForm");
  form.reset();

  document.getElementById("subtask-list").innerHTML = "";

  var checks = document.querySelectorAll('#assignee-dropdown input[type="checkbox"]');
  checks.forEach(function (c) { c.checked = false; });

  document.getElementById("selected-assignee-avatars").innerHTML = "";
  document.getElementById("selected-assignees-placeholder").textContent = "Select contacts";

  document.getElementById("category").value = "";
  document.getElementById("selected-category-placeholder").textContent = "Select category";
}

function openAddTaskOverlay() {
  var overlay = document.getElementById("add-task-overlay");
  if (!overlay) return;
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");
}

function closeAddTaskOverlay() {
  var overlay = document.getElementById("add-task-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overlay-open");
}

function stopOverlayClick(event) {
  event.stopPropagation();
}
