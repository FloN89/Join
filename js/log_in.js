// Firebase Realtime Database URL mit allen registrierten Usern
const databaseUrl =
  "https://join-8b0fa-default-rtdb.europe-west1.firebasedatabase.app/users.json";

// Startet den Login-Vorgang beim Klick auf den Login-Button
function startLogin() {
  hideErrorMessage();

  const usernameValue = readInputValue('input[name="username"]');
  const passwordValue = readInputValue('input[name="password"]');

  if (!areInputsValid(usernameValue, passwordValue)) {
    return;
  }

  verifyLogin(usernameValue, passwordValue);
}

// Liest den Wert eines Input-Feldes anhand eines CSS-Selectors aus
function readInputValue(selector) {
  const inputElement = document.querySelector(selector);
  return inputElement ? inputElement.value.trim() : "";
}

// Prüft, ob Username und Passwort eingegeben wurden
function areInputsValid(usernameValue, passwordValue) {
  if (usernameValue === "" || passwordValue === "") {
    showErrorMessage("Bitte Username und Passwort eingeben.");
    return false;
  }
  return true;
}

// Startet die Überprüfung der Login-Daten mit den Daten aus Firebase
function verifyLogin(usernameValue, passwordValue) {
  loadUsersFromDatabase(
    function (usersFromDatabase) {
      handleLoginResponse(usersFromDatabase, usernameValue, passwordValue);
    },
    function () {
      showErrorMessage("Fehler beim Laden der Benutzerdaten.");
    }
  );
}

// Lädt alle User aus der Firebase Realtime Database
function loadUsersFromDatabase(onSuccess, onError) {
  fetch(databaseUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (usersFromDatabase) {
      onSuccess(usersFromDatabase);
    })
    .catch(function () {
      onError();
    });
}

// Verarbeitet das Ergebnis der Login-Prüfung
function handleLoginResponse(usersFromDatabase, usernameValue, passwordValue) {
  const matchingUser = findMatchingUser(
    usersFromDatabase,
    usernameValue,
    passwordValue
  );

  if (!matchingUser) {
    showErrorMessage("Username oder Passwort ist falsch.");
    return; // ❗ KEINE Weiterleitung bei falschen Daten
  }

  saveUserSession(
    matchingUser.userId,
    matchingUser.user.username,
    matchingUser.user.initials
  );

  redirectToSummaryPage(); // ✅ Nur bei korrektem Login
}

// Sucht einen User mit passendem Username und Passwort
function findMatchingUser(usersObject, usernameValue, passwordValue) {
  const userIds = Object.keys(usersObject || {});

  for (let index = 0; index < userIds.length; index++) {
    const currentUserId = userIds[index];
    const currentUser = usersObject[currentUserId];

    if (
      currentUser.username === usernameValue &&
      currentUser.password === passwordValue
    ) {
      return { userId: currentUserId, user: currentUser };
    }
  }

  return null;
}

// Speichert wichtige User-Daten für die aktuelle Sitzung im LocalStorage
function saveUserSession(userId, username, initialsFromDatabase) {
  const userInitials = getUserInitials(username, initialsFromDatabase);
  localStorage.setItem("userId", userId);
  localStorage.setItem("userInitial", userInitials);
}

// Ermittelt die Initialen des Users (aus DB oder berechnet)
function getUserInitials(username, initialsFromDatabase) {
  if (initialsFromDatabase && initialsFromDatabase.trim() !== "") {
    return initialsFromDatabase.toUpperCase();
  }

  let initials = "";
  const nameParts = username.split(" ");

  for (let index = 0; index < nameParts.length; index++) {
    initials += nameParts[index][0];
  }

  return initials.toUpperCase();
}

// Leitet den User zur Summary-Seite weiter
function redirectToSummaryPage() {
  window.location.href = "../html/summary.html";
}

// Zeigt eine Fehlermeldung unter dem Login-Formular an
function showErrorMessage(messageText) {
  const errorElement = document.getElementById("error-message");
  if (errorElement) {
    errorElement.innerText = messageText;
    errorElement.classList.remove("d-none");
  }
}

// Versteckt die Fehlermeldung (z. B. beim neuen Login-Versuch)
function hideErrorMessage() {
  const errorElement = document.getElementById("error-message");
  if (errorElement) {
    errorElement.classList.add("d-none");
  }
}
