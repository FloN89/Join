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

  saveUserSession(matchingUser.userId);
  redirectToSummaryPage(matchingUser.user.name || "");
}

// Speichert Benutzer-ID in der Session
function saveUserSession(userId) {
  sessionStorage.setItem("userId", userId);
}

// Leitet zur Summary-Seite weiter
function redirectToSummaryPage(userName = "") {
  const isMobile480 = window.matchMedia("(max-width: 480px)").matches;

  // Desktop/Tablet: sofort weiter
  if (!isMobile480) {
    window.location.href = "summary.html";
    return;
  }

  // Mobile: SOFORT Login-UI weg + Overlay an
  forceShowWelcomeOverlay(userName);

  // Danach weiterleiten (Overlay bleibt sichtbar bis Redirect)
  setTimeout(function () {
    window.location.href = "summary.html";
  }, 1800);
}

function forceShowWelcomeOverlay(userName) {
  const overlay = document.getElementById("welcome-overlay");
  const nameEl = document.getElementById("welcome-name");

  // 1) Login-UI sofort entfernen (INLINE = höchste Priorität)
  const header = document.querySelector(".app-header");
  const main = document.querySelector(".main-area");
  const footer = document.querySelector(".site-footer");

  if (header) header.style.display = "none";
  if (main) main.style.display = "none";
  if (footer) footer.style.display = "none";

  // 2) Overlay sofort sichtbar machen (INLINE)
  if (overlay) {
    overlay.style.display = "flex";
    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
  }

  // 3) Name setzen (Guest -> keine Zeile)
  if (nameEl) {
    const trimmed = (userName || "").trim();
    nameEl.textContent = trimmed;
    nameEl.style.display = trimmed ? "block" : "none";
  }
}

 function showWelcomeOverlay(userName) {
  const overlay = document.getElementById("welcome-overlay");
  const nameEl = document.getElementById("welcome-name");
  if (!overlay || !nameEl) return;

  // 1) SOFORT: komplette Login-UI entfernen (kein Paint mehr möglich)
  document.body.classList.add("welcome-active");

  // 2) Name setzen (Guest -> keine zweite Zeile)
  const trimmed = (userName || "").trim();
  nameEl.textContent = trimmed;
  nameEl.style.display = trimmed ? "block" : "none";

  // 3) Nächster Frame: Overlay sichtbar schalten (verhindert Zwischenframe)
  requestAnimationFrame(function () {
    overlay.classList.remove("is-hide");
    overlay.classList.add("is-visible");
  });
}
function hideWelcomeOverlay() {
  const overlay = document.getElementById("welcome-overlay");
  if (!overlay) return;

  overlay.classList.add("is-hide");
  overlay.classList.remove("is-visible");
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
  // KEINE Logo-Animation mehr
  
  handleLogoTransition();
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

function guestLogin(event) {
  if (event) event.preventDefault();

  sessionStorage.setItem("userId", "guest");
  redirectToSummaryPage("");
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
