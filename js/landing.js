const BASE_URL = "";

function startLogin() {
  hideError();
  const email = getInputValue('input[name="email"]');
  const password = getInputValue('input[name="password"]');
  if (!validateInputs(email, password)) return;
  fetchUsers(function (users) {
    const match = findUser(users, email, password);
    if (match) {
      saveSession(match.uid, match.user.name);
      goToSummary();
    } else {
      showError("E-Mail oder Passwort ist falsch.");
    }
  }, function () {
    showError("Ein Fehler ist aufgetreten. Bitte später erneut versuchen.");
  });
}

function getInputValue(selector) {
  const element = document.querySelector(selector);
  if (!element) return "";
  return (element.value || "").trim();
}

function validateInputs(email, password) {
  if (!email || !password) {
    showError("Bitte E-Mail und Passwort eingeben.");
    return false;
  }
  return true;
}

function fetchUsers(onSuccess, onError) {
  fetch(BASE_URL + "/users.json")
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(function (data) { onSuccess(data); })
    .catch(function () { onError(); });
}

function findUser(users, email, password) {
  const userIds = Object.keys(users || {});
  for (let i = 0; i < userIds.length; i++) {
    const uid = userIds[i];
    const candidate = users[uid];
    if (candidate && candidate.email === email && candidate.password === password) {
      return { uid: uid, user: candidate };
    }
  }
  return null;
}

function saveSession(uid, fullName) {
  const parts = (fullName || "").split(" ");
  let initials = "";
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) initials += parts[i][0];
  }
  localStorage.setItem("userInitial", (initials || "").toUpperCase());
  localStorage.setItem("userId", uid);
}

function goToSummary() {
  window.location.href = "";
}

function showError(message) {
  const errorBox = document.getElementById("login-error-box");
  if (!errorBox) return;
  errorBox.innerText = message;
  errorBox.style.display = "block";
}

function hideError() {
  const errorBox = document.getElementById("login-error-box");
  if (!errorBox) return;
  errorBox.innerText = "";
  errorBox.style.display = "none";
}

function makeVisible(element) {
  if (!element) return;
  element.style.opacity = "1";
  element.classList.add("is-visible");
}

function onLogoTransition() {
  const main = document.querySelector(".main-area");
  const footer = document.querySelector(".site-footer");
  const signup = document.querySelector(".signup-area");
  makeVisible(main); makeVisible(footer); makeVisible(signup);
}

function initPage() {
  document.body.classList.add("page-loaded");
  setTimeout(function () {
    makeVisible(document.querySelector(".main-area"));
    makeVisible(document.querySelector(".site-footer"));
    makeVisible(document.querySelector(".signup-area"));
  }, 50);
  const logo = document.querySelector(".app-logo");
  if (logo) logo.addEventListener("transitionend", onLogoTransition, { once: true });
}

window.addEventListener("load", initPage);