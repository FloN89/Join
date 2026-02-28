let guestTasks = {
  "guest-task-1": {
    title: "Build a landing page",
    description: "Create a responsive landing page with header, hero section and footer.",
    category: "user-story",
    priority: "urgent",
    dueDate: "2026-02-20",
    assignedTo: [
      { name: "Sofia Müller", color: "#ff7a00" },
      { name: "Max Mustermann", color: "#9327ff" }
    ],
    subtasks: [
      { title: "Create wireframe", done: true },
      { title: "Code HTML structure", done: false },
      { title: "Add CSS styling", done: false }
    ],
    status: "todo",
    createdAt: Date.now()
  },
  "guest-task-2": {
    title: "Fix login validation",
    description: "Add error messages when email or password fields are empty.",
    category: "technical-task",
    priority: "medium",
    dueDate: "2026-03-01",
    assignedTo: [
      { name: "Anna Schmidt", color: "#6e52ff" }
    ],
    subtasks: [
      { title: "Add email check", done: true },
      { title: "Add password check", done: true }
    ],
    status: "todo",
    createdAt: Date.now()
  },
  "guest-task-3": {
    title: "Design contact form",
    description: "Create a contact form with name, email and message fields.",
    category: "user-story",
    priority: "medium",
    dueDate: "2026-02-28",
    assignedTo: [
      { name: "Sofia Müller", color: "#ff7a00" },
      { name: "Anna Schmidt", color: "#6e52ff" }
    ],
    subtasks: [],
    status: "in-progress",
    createdAt: Date.now()
  },
  "guest-task-4": {
    title: "Write unit tests",
    description: "Write tests for the login and signup functions.",
    category: "technical-task",
    priority: "low",
    dueDate: "2026-03-10",
    assignedTo: [
      { name: "Max Mustermann", color: "#9327ff" }
    ],
    subtasks: [
      { title: "Test login function", done: true },
      { title: "Test signup function", done: false }
    ],
    status: "await-feedback",
    createdAt: Date.now()
  },
  "guest-task-5": {
    title: "Setup project structure",
    description: "Create folder structure and add base CSS files.",
    category: "technical-task",
    priority: "urgent",
    dueDate: "2026-02-15",
    assignedTo: [
      { name: "Sofia Müller", color: "#ff7a00" }
    ],
    subtasks: [
      { title: "Create folders", done: true },
      { title: "Add base CSS", done: true }
    ],
    status: "done",
    createdAt: Date.now()
  }
};

async function seedGuestTasks() {
  let existingData = await loadData("guest-tasks/");
  if (existingData) {
    return;
  }
  await saveData("guest-tasks", guestTasks);
}



// ===== GUEST CONTACTS (nur für Guest Login) =====

let guestContacts = {
  "guest-contact-1": { name: "Sofia Müller", color: "#ff7a00" },
  "guest-contact-2": { name: "Max Mustermann", color: "#9327ff" },
  "guest-contact-3": { name: "Anna Schmidt", color: "#6e52ff" }
};

async function seedGuestContacts() {
  let existingData = await loadData("guest-contacts/");
  if (existingData) return;

  await saveData("guest-contacts", guestContacts);
}