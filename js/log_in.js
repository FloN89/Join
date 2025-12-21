const databaseBaseAddress =
  "https://join-db-473d0-default-rtdb.europe-west1.firebasedatabase.app/";

function startLogin() {
  hideErrorMessage();
  var emailValue = readInputValue('input[name="email"]');
  var passwordValue = readInputValue('input[name="password"]');
  if (!areInputsValid(emailValue, passwordValue)) {
    return;
  }
  verifyLogin(emailValue, passwordValue);
}

function readInputValue(selectorText) {
  var inputElement = document.querySelector(selectorText);
  if (!inputElement) {
    return "";
  }
  var rawValue = inputElement.value || "";
  return rawValue.trim();
}

function areInputsValid(emailValue, passwordValue) {
  if (!emailValue || !passwordValue) {
    showErrorMessage("Bitte E-Mail und Passwort eingeben.");
    return false;
  }
  return true;
}

function verifyLogin(emailValue, passwordValue) {
  loadUsersFromDatabase(
    function (usersFromDatabase) {
      handleLoginResponse(usersFromDatabase, emailValue, passwordValue);
    },
    function () {
      showErrorMessage(
        "Ein Fehler ist aufgetreten. Bitte später erneut versuchen."
      );
    }
  );
}

function handleLoginResponse(usersFromDatabase, emailValue, passwordValue) {
  var matchingUser = findMatchingUser(
    usersFromDatabase,
    emailValue,
    passwordValue
  );
  if (!matchingUser) {
    showErrorMessage("E-Mail oder Passwort ist falsch.");
    return;
  }
  saveUserSession(matchingUser.userId, matchingUser.user.username);
  redirectToSummaryPage();
}

function saveUserSession(userId, fullName) {
  var fullNameText = fullName || "";
  var nameParts = fullNameText.split(" ");
  var userInitials = "";
  for (var index = 0; index < nameParts.length; index++) {
    var currentPart = nameParts[index];
    if (currentPart) {
      userInitials += currentPart[0];
    }
  }
  localStorage.setItem("userInitial", userInitials.toUpperCase());
  localStorage.setItem("userId", userId);
}

function redirectToSummaryPage() {
  window.location.href = "summary.html";
}

function showErrorMessage(messageText) {
  var errorBoxElement = document.getElementById("login-error-box");
  if (!errorBoxElement) {
    return;
  }
  errorBoxElement.innerText = messageText;
  errorBoxElement.style.display = "block";
}

function hideErrorMessage() {
  var errorBoxElement = document.getElementById("login-error-box");
  if (!errorBoxElement) {
    return;
  }
  errorBoxElement.innerText = "";
  errorBoxElement.style.display = "none";
}

function makeElementVisible(targetElement) {
  if (!targetElement) {
    return;
  }
  targetElement.style.opacity = "1";
  targetElement.classList.add("is-visible");
}

function handleLogoTransition() {
  var mainAreaElement = document.querySelector(".main-area");
  var footerElement = document.querySelector(".site-footer");
  var signupAreaElement = document.querySelector(".signup-area");
  makeElementVisible(mainAreaElement);
  makeElementVisible(footerElement);
  makeElementVisible(signupAreaElement);
}

function initializePage() {
  document.body.classList.add("page-loaded");
  var logoElement = document.querySelector(".app-logo");
  if (logoElement) {
    logoElement.addEventListener("transitionend", handleLogoTransition, {
      once: true,
    });
  } else {
    handleLogoTransition();
  }
  initializePasswordToggle();
}

function initializePasswordToggle() {
  var passwordInputElement = document.querySelector(".input-password");
  var passwordToggleButtonElement = document.querySelector(".password-toggle");
  if (!passwordInputElement || !passwordToggleButtonElement) {
    return;
  }
  setPasswordIconMode("locked", passwordToggleButtonElement);
  passwordToggleButtonElement.addEventListener("click", function () {
    togglePasswordVisibility(passwordInputElement, passwordToggleButtonElement);
  });
}

function togglePasswordVisibility(
  passwordInputElement,
  passwordToggleButtonElement
) {
  var isCurrentlyHidden = passwordInputElement.type === "password";
  if (isCurrentlyHidden) {
    passwordInputElement.type = "text";
    setPasswordIconMode("visible", passwordToggleButtonElement);
  } else {
    passwordInputElement.type = "password";
    setPasswordIconMode("hidden", passwordToggleButtonElement);
  }
  passwordInputElement.focus();
}

function setPasswordIconMode(mode, passwordToggleButtonElement) {
  passwordToggleButtonElement.classList.remove("is-lock", "is-off", "is-on");
  if (mode === "visible") {
    passwordToggleButtonElement.classList.add("is-on");
  } else if (mode === "hidden") {
    passwordToggleButtonElement.classList.add("is-off");
  } else {
    passwordToggleButtonElement.classList.add("is-lock");
  }
}

function loadUsersFromDatabase(onSuccess, onError) {
  fetch(databaseBaseAddress + "/users.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      onSuccess(data);
    })
    .catch(function () {
      onError();
    });
}

function findMatchingUser(allUsers, emailValue, passwordValue) {
  var userIds = Object.keys(allUsers || {});
  for (var index = 0; index < userIds.length; index++) {
    var userId = userIds[index];
    var currentUser = allUsers[userId];
    if (
      currentUser &&
      currentUser.email === emailValue &&
      currentUser.password === passwordValue
    ) {
      return { userId: userId, user: currentUser };
    }
  }
  return null;
}

window.addEventListener("load", initializePage);
