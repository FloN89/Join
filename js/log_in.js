const databaseBaseAddress =
  "https://join-db-473d0-default-rtdb.europe-west1.firebasedatabase.app/";

// Startet den Login-Vorgang
function startLogin(event) {
  if (event) {
    event.preventDefault();
  }

  hideErrorMessage();

  const emailValue = readInputValue('input[name="email"]');
  const passwordValue = readInputValue('input[name="password"]');

  if (!areInputsValid(emailValue, passwordValue)) {
    return;
  }

  verifyLogin(emailValue, passwordValue);
}

// Liest und trimmt den Wert eines Input-Feldes
function readInputValue(selectorText) {
  const inputElement = document.querySelector(selectorText);

  if (!inputElement) {
    return "";
  }

  const rawValue = inputElement.value || "";
  return rawValue.trim();
}

// Prüft ob E-Mail und Passwort vorhanden sind
function areInputsValid(emailValue, passwordValue) {
  if (!emailValue || !passwordValue) {
    showErrorMessage("Bitte E-Mail und Passwort eingeben.");
    return false;
  }

  return true;
}

// Startet die Überprüfung der Login-Daten
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

// Verarbeitet die Antwort aus der Datenbank
function handleLoginResponse(usersFromDatabase, emailValue, passwordValue) {
  const matchingUser = findMatchingUser(
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

// Speichert Benutzerdaten in der Session
function saveUserSession(userId, fullName) {
  const fullNameText = fullName || "";
  const nameParts = fullNameText.split(" ");
  let userInitials = "";

  for (let index = 0; index < nameParts.length; index++) {
    const currentPart = nameParts[index];
    if (currentPart) {
      userInitials += currentPart[0];
    }
  }

  localStorage.setItem("userInitial", userInitials.toUpperCase());
  localStorage.setItem("userId", userId);
}

// Leitet zur Summary-Seite weiter
function redirectToSummaryPage() {
  window.location.href = "summary.html";
}

// Zeigt eine Fehlermeldung an
function showErrorMessage(messageText) {
  const errorBoxElement = document.getElementById("login-error-box");

  if (!errorBoxElement) {
    return;
  }

  errorBoxElement.innerText = messageText;
  errorBoxElement.style.display = "block";
}

// Blendet die Fehlermeldung aus
function hideErrorMessage() {
  const errorBoxElement = document.getElementById("login-error-box");

  if (!errorBoxElement) {
    return;
  }

  errorBoxElement.innerText = "";
  errorBoxElement.style.display = "none";
}

// Macht ein Element sichtbar (Animation)
function makeElementVisible(targetElement) {
  if (!targetElement) {
    return;
  }

  targetElement.style.opacity = "1";
  targetElement.classList.add("is-visible");
}

// Führt die Logo-Übergangsanimation aus
function handleLogoTransition() {
  const mainAreaElement = document.querySelector(".main-area");
  const footerElement = document.querySelector(".site-footer");
  const signupAreaElement = document.querySelector(".signup-area");

  makeElementVisible(mainAreaElement);
  makeElementVisible(footerElement);
  makeElementVisible(signupAreaElement);
}

// Initialisiert die Seite nach dem Laden
function initializePage() {
  document.body.classList.add("page-loaded");

  const logoElement = document.querySelector(".app-logo");

  if (logoElement) {
    logoElement.addEventListener("transitionend", handleLogoTransition, {
      once: true,
    });
  } else {
    handleLogoTransition();
  }

  initializePasswordToggle();
}

// Initialisiert den Passwort-Sichtbarkeits-Button
function initializePasswordToggle() {
  const passwordInputElement = document.querySelector(".input-password");
  const passwordToggleButtonElement =
    document.querySelector(".password-toggle");

  if (!passwordInputElement || !passwordToggleButtonElement) {
    return;
  }

  setPasswordIconMode("locked", passwordToggleButtonElement);

  passwordToggleButtonElement.addEventListener("click", function () {
    togglePasswordVisibility(
      passwordInputElement,
      passwordToggleButtonElement
    );
  });

  // Reagiert auf Eingaben im Passwortfeld
  passwordInputElement.addEventListener("input", function () {
    updatePasswordIconOnInput(
      passwordInputElement,
      passwordToggleButtonElement
    );
  });
}


// Aktualisiert das Passwort-Icon abhängig vom Eingabestatus
function updatePasswordIconOnInput(
  passwordInputElement,
  passwordToggleButtonElement
) {
  if (passwordInputElement.value.length === 0) {
    passwordInputElement.type = "password";
    setPasswordIconMode("locked", passwordToggleButtonElement);
  } else if (passwordInputElement.type === "password") {
    setPasswordIconMode("hidden", passwordToggleButtonElement);
  }
}


// Wechselt zwischen sichtbarem und verstecktem Passwort
function togglePasswordVisibility(
  passwordInputElement,
  passwordToggleButtonElement
) {
  const isCurrentlyHidden = passwordInputElement.type === "password";

  if (isCurrentlyHidden) {
    passwordInputElement.type = "text";
    setPasswordIconMode("visible", passwordToggleButtonElement);
  } else {
    passwordInputElement.type = "password";
    setPasswordIconMode("hidden", passwordToggleButtonElement);
  }

  passwordInputElement.focus();
}

// Setzt das passende Icon für den Passwortstatus
function setPasswordIconMode(mode, passwordToggleButtonElement) {
  passwordToggleButtonElement.classList.remove(
    "is-lock",
    "is-off",
    "is-on"
  );

  if (mode === "visible") {
    passwordToggleButtonElement.classList.add("is-on");
  } else if (mode === "hidden") {
    passwordToggleButtonElement.classList.add("is-off");
  } else {
    passwordToggleButtonElement.classList.add("is-lock");
  }
}

function guestLogin() {
  // Initiale für Guest setzen
  localStorage.setItem("userInitial", "G");

  // Optional: Guest-ID setzen
  localStorage.setItem("userId", "guest");

  // Weiterleitung zur Guest Summary
  window.location.href = "summary_guest.html";
}


// Lädt alle Benutzer aus der Datenbank
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

// Sucht einen passenden Benutzer anhand der Login-Daten
function findMatchingUser(allUsers, emailValue, passwordValue) {
  const userIds = Object.keys(allUsers || {});

  for (let index = 0; index < userIds.length; index++) {
    const userId = userIds[index];
    const currentUser = allUsers[userId];

    if (
      currentUser &&
      currentUser.mail === emailValue &&
      currentUser.password === passwordValue
    ) {
      return { userId: userId, user: currentUser };
    }
  }

  return null;
}

// Startpunkt beim Laden der Seite
window.addEventListener("load", initializePage);
