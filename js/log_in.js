/**
 * Basis-URL deiner Firebase Realtime Database.
 */
const databaseBaseUrl =
  "https://join-db-473d0-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Einstiegspunkt: Login starten.
 * - Validiert Inputs
 * - Prüft Nutzer in der Datenbank
 * - Speichert Session und leitet weiter
 */
function startLogin(event) {
  if (event) event.preventDefault();

  hideErrorMessage();

  const email = readTrimmedInputValue('input[name="email"]');
  const password = readTrimmedInputValue('input[name="password"]');

  if (!areLoginInputsValid(email, password)) return;

  verifyLoginCredentials(email, password);
}

/**
 * Einstiegspunkt: Gast-Login starten.
 */
function startGuestLogin(event) {
  if (event) event.preventDefault();

  saveUserSession("guest");
  redirectToSummaryPage("");
}

/**
 * Liest einen Input-Wert per Selector und entfernt Leerzeichen.
 */
function readTrimmedInputValue(selectorText) {
  const inputElement = document.querySelector(selectorText);
  const rawValue = inputElement ? inputElement.value : "";
  return String(rawValue).trim();
}

/**
 * Prüft, ob E-Mail und Passwort gefüllt sind.
 */
function areLoginInputsValid(email, password) {
  if (email && password) return true;
  showErrorMessage("Bitte E-Mail und Passwort eingeben.");
  return false;
}

/**
 * Startet die Prüfung der Zugangsdaten gegen die Datenbank.
 */
function verifyLoginCredentials(email, password) {
  loadUsersFromDatabase(
    function (usersFromDatabase) {
      handleLoginResponse(usersFromDatabase, email, password);
    },
    function () {
      showErrorMessage("Ein Fehler ist aufgetreten. Bitte später erneut versuchen.");
    }
  );
}

/**
 * Verarbeitet Datenbank-Antwort: findet passenden Nutzer oder zeigt Fehler.
 */
function handleLoginResponse(usersFromDatabase, email, password) {
  const matchingUser = findMatchingUser(usersFromDatabase, email, password);
  if (!matchingUser) return showErrorMessage("E-Mail oder Passwort ist falsch.");

  saveUserSession(matchingUser.userId);

  const userName = getUserDisplayName(matchingUser.user);
  redirectToSummaryPage(userName);
}

/**
 * Ermittelt einen Anzeigenamen aus verschiedenen möglichen Feldern.
 */
function getUserDisplayName(userObject) {
  const userNameValue =
    (userObject && (userObject.username || userObject.userName || userObject.name)) || "";
  return String(userNameValue).trim();
}

/**
 * Speichert die Nutzer-ID in der Session (für spätere Seiten).
 */
function saveUserSession(userId) {
  sessionStorage.setItem("userId", String(userId));
}

/**
 * Weiterleitung zur summary.html:
 * - Desktop/Tablet: sofort
 * - Mobile <= 480px: Welcome Overlay kurz anzeigen
 */
function redirectToSummaryPage(userName) {
  if (!isMobileScreen()) return navigateToSummary();

  showWelcomeOverlayImmediately(userName);

  setTimeout(function () {
    navigateToSummary();
  }, 1800);
}

/**
 * Prüft, ob die Seite im Mobile-Breakpoint (<= 480px) läuft.
 */
function isMobileScreen() {
  return window.matchMedia("(max-width: 480px)").matches;
}

/**
 * Leitet zur Summary-Seite weiter.
 */
function navigateToSummary() {
  window.location.href = "summary.html";
}

/**
 * Zeigt das Welcome Overlay ohne "Zwischen-Frame" an:
 * - Login-Bereiche werden ausgeblendet
 * - Overlay wird per Inline-Styles sofort sichtbar
 */
function showWelcomeOverlayImmediately(userName) {
  hideLoginLayoutImmediately();
  showOverlayImmediately();
  setWelcomeNameLine(userName);
}

/**
 * Blendet Header/Main/Footer sofort aus, damit nichts mehr "aufflackert".
 */
function hideLoginLayoutImmediately() {
  const headerElement = document.querySelector(".app-header");
  const mainElement = document.querySelector(".main-area");
  const footerElement = document.querySelector(".site-footer");

  if (headerElement) headerElement.style.display = "none";
  if (mainElement) mainElement.style.display = "none";
  if (footerElement) footerElement.style.display = "none";
}

/**
 * Schaltet das Overlay sofort sichtbar.
 */
function showOverlayImmediately() {
  const welcomeOverlayElement = document.getElementById("welcome-overlay");
  if (!welcomeOverlayElement) return;

  welcomeOverlayElement.style.display = "flex";
  welcomeOverlayElement.style.opacity = "1";
  welcomeOverlayElement.style.pointerEvents = "auto";

  document.body.classList.add("welcome-active");
}

/**
 * Setzt den Namen im Overlay:
 * - Wenn leer (Gast): Namenszeile ausblenden
 */
function setWelcomeNameLine(userName) {
  const welcomeNameElement = document.getElementById("welcome-name");
  if (!welcomeNameElement) return;

  const trimmedName = String(userName || "").trim();
  welcomeNameElement.textContent = trimmedName;
  welcomeNameElement.style.display = trimmedName ? "block" : "none";
}

/**
 * Zeigt eine Fehlermeldung im UI.
 */
function showErrorMessage(messageText) {
  const errorBoxElement = document.getElementById("login-error-box");
  if (!errorBoxElement) return;

  errorBoxElement.innerText = String(messageText);
  errorBoxElement.style.display = "block";
}

/**
 * Blendet die Fehlermeldung aus.
 */
function hideErrorMessage() {
  const errorBoxElement = document.getElementById("login-error-box");
  if (!errorBoxElement) return;

  errorBoxElement.innerText = "";
  errorBoxElement.style.display = "none";
}

/**
 * Macht ein Element sichtbar (Opacity + Klasse für Fade-In).
 */
function makeElementVisible(targetElement) {
  if (!targetElement) return;
  targetElement.style.opacity = "1";
  targetElement.classList.add("is-visible");
}

/**
 * Führt die Fade-In-Animation für die Startseite aus.
 */
function animatePageElements() {
  makeElementVisible(document.querySelector(".main-area"));
  makeElementVisible(document.querySelector(".site-footer"));
  makeElementVisible(document.querySelector(".signup-area"));
}

/**
 * Initialisiert die Seite nach dem Laden:
 * - Animation
 * - Passwort-Sichtbarkeit
 */
function initializePage() {
  animatePageElements();
  initializePasswordToggle();
}

/**
 * Initialisiert den Button, der die Passwortsichtbarkeit toggelt.
 */
function initializePasswordToggle() {
  const passwordInputElement = document.querySelector(".input-password");
  const passwordToggleButtonElement = document.querySelector(".password-toggle");
  if (!passwordInputElement || !passwordToggleButtonElement) return;

  setPasswordIconMode("locked", passwordToggleButtonElement);
  bindPasswordToggleClick(passwordInputElement, passwordToggleButtonElement);
  bindPasswordInputListener(passwordInputElement, passwordToggleButtonElement);
}

/**
 * Klick-Listener für das Umschalten (sichtbar/versteckt).
 */
function bindPasswordToggleClick(passwordInputElement, passwordToggleButtonElement) {
  passwordToggleButtonElement.addEventListener("click", function () {
    togglePasswordVisibility(passwordInputElement, passwordToggleButtonElement);
  });
}

/**
 * Input-Listener: Icon-Zustand abhängig vom Inhalt.
 */
function bindPasswordInputListener(passwordInputElement, passwordToggleButtonElement) {
  passwordInputElement.addEventListener("input", function () {
    updatePasswordIconOnInput(passwordInputElement, passwordToggleButtonElement);
  });
}

/**
 * Passt Icon und Typ an, wenn das Passwortfeld leer wird oder gefüllt ist.
 */
function updatePasswordIconOnInput(passwordInputElement, passwordToggleButtonElement) {
  if (passwordInputElement.value.length === 0) {
    passwordInputElement.type = "password";
    return setPasswordIconMode("locked", passwordToggleButtonElement);
  }

  if (passwordInputElement.type === "password") {
    setPasswordIconMode("hidden", passwordToggleButtonElement);
  }
}

/**
 * Wechselt zwischen sichtbarem und verstecktem Passwort.
 */
function togglePasswordVisibility(passwordInputElement, passwordToggleButtonElement) {
  const isHiddenNow = passwordInputElement.type === "password";

  passwordInputElement.type = isHiddenNow ? "text" : "password";
  setPasswordIconMode(isHiddenNow ? "visible" : "hidden", passwordToggleButtonElement);

  passwordInputElement.focus();
}

/**
 * Setzt das passende Icon (CSS-Klasse) für den Passwortstatus.
 */
function setPasswordIconMode(mode, passwordToggleButtonElement) {
  passwordToggleButtonElement.classList.remove("is-lock", "is-off", "is-on");

  if (mode === "visible") return passwordToggleButtonElement.classList.add("is-on");
  if (mode === "hidden") return passwordToggleButtonElement.classList.add("is-off");

  passwordToggleButtonElement.classList.add("is-lock");
}

/**
 * Lädt alle Benutzer aus der Datenbank.
 */
function loadUsersFromDatabase(onSuccess, onError) {
  fetch(databaseBaseUrl + "/users.json")
    .then(function (response) {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then(function (data) {
      onSuccess(data);
    })
    .catch(function () {
      onError();
    });
}

/**
 * Sucht einen Benutzer, dessen E-Mail und Passwort übereinstimmen.
 */
function findMatchingUser(allUsers, email, password) {
  const userIds = Object.keys(allUsers || {});

  for (let index = 0; index < userIds.length; index++) {
    const userId = userIds[index];
    const currentUser = allUsers[userId];

    if (isUserCredentialsMatching(currentUser, email, password)) {
      return { userId: userId, user: currentUser };
    }
  }

  return null;
}

/**
 * Prüft, ob Nutzerobjekt und Credentials zusammenpassen.
 */
function isUserCredentialsMatching(userObject, email, password) {
  if (!userObject) return false;
  return userObject.mail === email && userObject.password === password;
}

/**
 * Startpunkt beim Laden der Seite.
 */
window.addEventListener("load", initializePage);