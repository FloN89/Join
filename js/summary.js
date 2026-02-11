async function initSummary() {
  let tasks = await loadSummaryTasks();
  let metrics = calculateMetrics(tasks);
  updateMetricsDOM(metrics);
  await loadGreeting();
}

async function loadSummaryTasks() {
  let userId = sessionStorage.getItem("userId");

  if (userId === "guest") {
    await seedGuestTasks();
    let data = await loadData("guest-tasks/");
    return data || {};
  } else {
    let data = await loadData("task/");
    return data || {};
  }
}

function calculateMetrics(tasks) {
  let taskList = Object.values(tasks);
  let todoCount = 0;
  let doneCount = 0;
  let urgentCount = 0;
  let progressCount = 0;
  let feedbackCount = 0;
  let nearestDeadline = null;

  for (let i = 0; i < taskList.length; i++) {
    let currentTask = taskList[i];

    if (currentTask.status === "todo") {
      todoCount++;
    }
    if (currentTask.status === "done") {
      doneCount++;
    }
    if (currentTask.status === "in-progress") {
      progressCount++;
    }
    if (currentTask.status === "await-feedback") {
      feedbackCount++;
    }
    if (currentTask.priority === "urgent") {
      urgentCount++;

      if (currentTask.dueDate) {
        if (nearestDeadline === null || currentTask.dueDate < nearestDeadline) {
          nearestDeadline = currentTask.dueDate;
        }
      }
    }
  }

  return {
    todo: todoCount,
    done: doneCount,
    urgent: urgentCount,
    board: taskList.length,
    progress: progressCount,
    feedback: feedbackCount,
    deadline: nearestDeadline
  };
}

function updateMetricsDOM(metrics) {
  document.getElementById("count-todo").innerText = metrics.todo;
  document.getElementById("count-done").innerText = metrics.done;
  document.getElementById("count-urgent").innerText = metrics.urgent;
  document.getElementById("count-board").innerText = metrics.board;
  document.getElementById("count-progress").innerText = metrics.progress;
  document.getElementById("count-feedback").innerText = metrics.feedback;

  let deadlineElement = document.getElementById("deadline-date");
  if (metrics.deadline) {
    deadlineElement.innerText = formatDate(metrics.deadline);
  } else {
    deadlineElement.innerText = "No deadline";
  }
}

function formatDate(dateString) {
  let date = new Date(dateString);
  let months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  let month = months[date.getMonth()];
  let day = date.getDate();
  let year = date.getFullYear();
  return month + " " + day + ", " + year;
}

async function loadGreeting() {
  let userId = sessionStorage.getItem("userId");
  let greetingText = document.getElementById("greeting-text");
  let greetingName = document.getElementById("greeting-name");

  if (!userId || userId === "guest") {
    greetingText.innerText = "Good morning!";
    greetingName.innerText = "";
    return;
  }

  let user = await loadData("users/" + userId);
  if (user && user.username) {
    greetingText.innerText = "Good morning,";
    greetingName.innerText = user.username;
  } else {
    greetingText.innerText = "Good morning!";
    greetingName.innerText = "";
  }
}

document.addEventListener("DOMContentLoaded", initSummary);
