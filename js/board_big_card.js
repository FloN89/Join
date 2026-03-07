// Render assignees
function renderAssignees(assignees) {
  if (!assignees || assignees.length === 0) return "";
  return assignees.map(person => generateTaskOverlayAssignee(person)).join("");
}

// Get template markup by id
function getTemplateMarkup(templateId) {
  const template = document.getElementById(templateId);
  return template ? template.innerHTML.trim() : "";
}

// Render subtasks
function renderSubtasks(subtasks, id) {
  if (!subtasks || subtasks.length === 0) return "";
  return subtasks.map((subtask, index) => generateTaskOverlaySubtask(subtask, index, id)).join("");
}

// Build database path for current user type
function getTaskPath(id) {
  const isGuest = sessionStorage.getItem("userId") === "guest";
  return (isGuest ? "guest-tasks/" : "task/") + id;
}

// Show task overlay and background
function setTaskOverlayVisible() {
  document.getElementById("task_overlay").style.display = "flex";
  document.getElementById("big-card-background").style.display = "block";
}

// Build large task overlay markup
function buildTaskOverlayHtml(taskItem, id, priorityColor) {
  return generateTaskOverlay(
    taskItem.category,
    taskItem.title,
    taskItem.description,
    taskItem.dueDate,
    taskItem.priority,
    priorityColor,
    taskItem.assignedTo,
    taskItem.subtasks,
    id
  );
}

// Open task overlay
function openTaskOverlay(id, priorityColor) {
  const overlay = document.getElementById("task_overlay");
  const taskItem = task[id];
  overlay.innerHTML = "";
  overlay.innerHTML = buildTaskOverlayHtml(taskItem, id, priorityColor);
  overlay.classList.add("active");
  setTaskOverlayVisible();
}

// Toggle done state in subtask list
function toggleSubtaskValue(subtasks, index) {
  subtasks[index].done = !subtasks[index].done;
  return subtasks;
}

// Toggle subtask completion
async function toggleSubtaskCompletion(id, subtaskIndex) {
  const subtasks = toggleSubtaskValue(task[id].subtasks || [], subtaskIndex);
  await saveData(getTaskPath(id), { ...task[id], subtasks: subtasks });
  openTaskOverlay(id, getPriorityColor(task[id].priority));
}

// Show edit overlay and hide details overlay
function showEditOverlay() {
  document.getElementById("edit_task_overlay").classList.add("active");
  document.getElementById("task_overlay").style.display = "none";
  document.getElementById("big-card-background").style.display = "block";
}

// Inject edit overlay HTML
function renderEditOverlayContent(id) {
  const editOverlay = document.getElementById("edit_task_overlay");
  const taskItem = task[id];
  editOverlay.innerHTML = "";
  editOverlay.innerHTML = generateEditTaskOverlay(taskItem.title, taskItem.description, taskItem.dueDate, id);
}

// Initialize edit form with task data
function initializeEditOverlayFields(id) {
  const taskItem = task[id];
  renderAssigneeOptions(taskItem.assignedTo || []);
  renderEditSubtasks(taskItem.subtasks || []);
  document.querySelector(`input[name="priority"][value="${taskItem.priority}"]`)?.setAttribute("checked", "true");
  initPriorityIconHandlers();
  renderEditAssignees(taskItem.assignedTo || []);
}

// Open edit task overlay
function openEditTaskOverlay(id) {
  showEditOverlay();
  renderEditOverlayContent(id);
  initializeEditOverlayFields(id);
}

// Get current task source (guest or user)
function getCurrentTask(id) {
  return (guestTasks && guestTasks[id]) || (task && task[id]);
}

// Read values from edit task form
function getEditFormValues() {
  return {
    title: document.getElementById("edit-title").value,
    description: document.getElementById("edit-description").value,
    dueDate: document.getElementById("edit-due-date").value,
    priority: document.querySelector('input[name="priority"]:checked')?.value,
    assignedTo: getSelectedAssignees(),
    subtasks: getEditedSubtasks()
  };
}

// Save task changes
async function saveChanges(id) {
  const payload = { ...getCurrentTask(id), ...getEditFormValues() };
  await saveData(getTaskPath(id), payload);
  await fetchTasks();
  closeTaskOverlay();
}

// Create one editable subtask row element
function createEditableSubtaskItem(title) {
  const li = document.createElement("li");
  li.className = "subtask-item";
  li.innerHTML = generateEditSubtaskItem(title) + getTemplateMarkup("subtask-actions-default-template");
  return li;
}

// Bind edit/delete events for one subtask row
function bindSubtaskRowEvents(li) {
  const editBtn = li.querySelector(".edit-subtask-btn");
  const deleteBtn = li.querySelector(".delete-subtask-btn");
  editBtn.addEventListener("click", () => enableSubtaskEdit(li));
  deleteBtn.addEventListener("click", () => li.remove());
}

// Append new subtask row and bind events
function appendSubtaskRow(list, title) {
  const li = createEditableSubtaskItem(title);
  list.appendChild(li);
  bindSubtaskRowEvents(li);
}

// Render editable subtasks
function renderEditSubtasks(subtasks = []) {
  const list = document.getElementById("edit-subtask-list");
  if (!list) return;
  list.innerHTML = "";
  subtasks.forEach(subtask => appendSubtaskRow(list, subtask.title));
}

// Add editable subtask
function addEditSubtask() {
  const input = document.getElementById("subtask");
  const text = input.value.trim();
  if (!text) return;
  appendSubtaskRow(document.getElementById("edit-subtask-list"), text);
  input.value = "";
}

// Convert subtask row to data object
function getSubtaskFromRow(li) {
  const title = li.querySelector(".subtask-title").textContent.trim();
  return title !== "" ? { title: title, done: false } : null;
}

// Get edited subtasks
function getEditedSubtasks() {
  const subtasks = [];
  document.querySelectorAll("#edit-subtask-list li").forEach(li => {
    const subtask = getSubtaskFromRow(li);
    if (subtask) subtasks.push(subtask);
  });
  return subtasks;
}

// Map checked assignee input to object
function mapCheckedAssignee(checkbox) {
  return { name: checkbox.dataset.name, color: checkbox.dataset.color };
}

// Get selected assignees
function getSelectedAssignees() {
  const assignees = [];
  document.querySelectorAll("#assignee-dropdown .assignee-checkbox:checked").forEach((checkbox) => {
    assignees.push(mapCheckedAssignee(checkbox));
  });
  return assignees;
}

// Render one assignee avatar element
function renderAssigneeAvatar(avatarsContainer, assignee) {
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = getInitials(assignee.name);
  avatar.style.backgroundColor = assignee.color;
  avatarsContainer.appendChild(avatar);
}

// Update assignee display
function updateAssigneeDisplay() {
  const avatarsContainer = document.getElementById("selected-assignee-avatars");
  const placeholder = document.getElementById("selected-assignees-placeholder");
  if (!avatarsContainer || !placeholder) return;
  avatarsContainer.innerHTML = "";
  getSelectedAssignees().forEach(assignee => renderAssigneeAvatar(avatarsContainer, assignee));
  placeholder.textContent = avatarsContainer.children.length ? "" : "Select contacts";
}

// Append one assignee option to dropdown
function appendAssigneeOption(assigneeDropdown, contact, taskAssignees) {
  const assigneeLabel = createAssigneeLabel(contact);
  if (taskAssignees.includes(contact)) assigneeLabel.querySelector("input").checked = true;
  assigneeDropdown.appendChild(assigneeLabel);
}

// Render edit assignees
function renderEditAssignees(taskAssignees = []) {
  const assigneeDropdown = document.getElementById("assignee-dropdown");
  if (!assigneeDropdown) return;
  assigneeDropdown.innerHTML = "";
  contacts.forEach(contact => appendAssigneeOption(assigneeDropdown, contact, taskAssignees));
  updateAssigneeDisplay();
}

// Delete task
async function deleteTask(taskId) {
  await deleteData(getTaskPath(taskId));
  closeTaskOverlay();
  await fetchTasks();
}

// Close task overlay
function closeTaskOverlay() {
  const taskOverlay = document.getElementById("task_overlay");
  const background = document.getElementById("big-card-background");
  const editOverlay = document.getElementById("edit_task_overlay");
  taskOverlay.classList.remove("active");
  taskOverlay.style.display = "none";
  background.style.display = "none";
  editOverlay.innerHTML = "";
}

// Handle delete button click in subtask list
function handleSubtaskDeleteClick(target) {
  const li = target.closest("li");
  if (li) li.remove();
}

// Handle edit button click in subtask list
function handleSubtaskEditClick(target) {
  const li = target.closest("li");
  if (!li) return;
  const title = li.querySelector(".subtask-title");
  const isEditing = title.getAttribute("contenteditable") === "true";
  title.setAttribute("contenteditable", isEditing ? "false" : "true");
  if (isEditing) title.blur(); else title.focus();
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-subtask-btn")) handleSubtaskDeleteClick(e.target);
  if (e.target.classList.contains("edit-subtask-btn")) handleSubtaskEditClick(e.target);
});

// Replace subtask action buttons with template
function setSubtaskActions(li, templateId) {
  let actionsDiv = li.querySelector(".subtask-actions");
  actionsDiv.outerHTML = getTemplateMarkup(templateId);
  return li.querySelector(".subtask-actions");
}

// Bind save/delete actions for editable subtask row
function bindSaveAndDeleteActions(li, titleSpan, actionsDiv) {
  const saveBtn = actionsDiv.querySelector(".save-subtask-btn");
  const deleteBtn = actionsDiv.querySelector(".delete-subtask-btn");
  saveBtn.addEventListener("click", () => {
    titleSpan.setAttribute("contenteditable", "false");
    const nextActions = setSubtaskActions(li, "subtask-actions-default-template");
    nextActions.querySelector(".edit-subtask-btn").addEventListener("click", () => enableSubtaskEdit(li));
    nextActions.querySelector(".delete-subtask-btn").addEventListener("click", () => li.remove());
  });
  deleteBtn.addEventListener("click", () => li.remove());
}

// Enable subtask edit mode
function enableSubtaskEdit(li) {
  const titleSpan = li.querySelector(".subtask-title");
  titleSpan.setAttribute("contenteditable", "true");
  titleSpan.focus();
  const actionsDiv = setSubtaskActions(li, "subtask-actions-editable-template");
  bindSaveAndDeleteActions(li, titleSpan, actionsDiv);
}

// Save subtask edit mode
function saveSubtaskEdit(li) {
  const title = li.querySelector(".subtask-title");
  title.setAttribute("contenteditable", "false");
  title.blur();
  setSubtaskActions(li, "subtask-actions-default-template");
}
