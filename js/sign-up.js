/**
 * Toggle password visibility
 * @param {string} inputId - ID value
 * @param {string} iconId - ID value
 * @returns {void} Return value
 */
function togglePasswordVisibility(inputId, iconId) {
    const password = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (password.type === "password") {
        password.type = "text";
        if (password.value) {
            icon.src = "../assets/icons/visibility.svg";
        }
    } else {
        password.type = "password";
        if (password.value) {
            icon.src = "../assets/icons/visibility_off.svg";
        }
    }
}

/**
 * Change icon
 * @param {string} inputId - ID value
 * @param {string} iconId - ID value
 * @returns {void} Return value
 */
function changeIcon(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.value.length > 0) {
        icon.src = "../assets/icons/visibility_off.svg";
    } else {
        icon.src = "../assets/icons/lock.svg";
    }
}

/**
 * Check password match
 * @returns {boolean} Return value
 */
function checkPasswordMatch() {
    const password = document.getElementById("passwordInput")
    const confirmPassword = document.getElementById("confirmPasswordInput")
    let errorMessage = document.getElementById("errorMessage")

    if (password.value === confirmPassword.value) {
        errorMessage.classList.remove("errorMessage")
        errorMessage.textContent = "";
        confirmPassword.classList.remove("borderRed");
        return;
    } else {
        errorMessage.classList.add("errorMessage")
        errorMessage.textContent = "Your passwords don't match. Please try again.";
        confirmPassword.classList.add("borderRed");
        return;
    }
}

/**
 * Is valid email basic
 *  @param {string} email - Email value
 *  @returns {boolean} Return value
 */
function isValidEmailBasic(email) {
    const value = (email || "").trim();
    const atSymbol = value.indexOf("@");
    const dot = value.lastIndexOf(".");
    return atSymbol > 0 && dot > atSymbol;
}

/** * Validate email input
 * @returns {boolean} Return value
 */
function validateEmailInput() {
    const emailInput = document.getElementById("mailInput");
    const errorMessage = document.getElementById("errorMessage");
    const email = emailInput.value;
    if (email.length === 0) {
        clearInvalidEmail(emailInput, errorMessage);
        return true;
    }
    if (!isValidEmailBasic(email)) {
        showInvalidEmail(emailInput, errorMessage);
        return false;
    }
    clearInvalidEmail(emailInput, errorMessage);
    return true;
}

/**
 * Show invalid email
 * @param {*} emailInput - Emailinput value
 * @param {*} errorMessage - Errormessage value
 * @returns {void} Return value
 */
function showInvalidEmail(emailInput, errorMessage) {
    emailInput.classList.add("borderRed");
    errorMessage.classList.add("errorMessage");
    errorMessage.textContent = "Please enter a valid email address.";
}

/**
 * Clear invalid email
 * @param {*} emailInput - Emailinput value
 * @param {*} errorMessage - Errormessage value
 * @returns {void} Return value
 */
function clearInvalidEmail(emailInput, errorMessage) {
    emailInput.classList.remove("borderRed");
    if (errorMessage.textContent === "Please enter a valid email address.") {
        errorMessage.textContent = "";
    }
}

/**
 * Show sign up
 * @returns {void} Return value
 */
function showSignUp() {
    if (!validateEmailInput()) return;
    const user = document.getElementById("usernameInput");
    const mail = document.getElementById("mailInput");
    const password = document.getElementById("passwordInput");
    const confirmPassword = document.getElementById("confirmPasswordInput");
    const signUpButton = document.getElementById("signUpButton");
    const checkbox = document.getElementById("privacyCheckbox");

    if (user.value.length > 0 && mail.value.length > 0 && password.value.length > 0 && confirmPassword.value.length > 0
        && password.value === confirmPassword.value && checkbox.checked) {
        signUpButton.disabled = false;
    } else {
        signUpButton.disabled = true;
    }
}

/**
 * Successful sign up
 * @returns {void} Return value
 */
function successfulSignUp() {
    const successRef = document.getElementById("successfulSignUp");
    const overlayRef = document.getElementById("overlaySuccessful");
    successRef.classList.add("show");
    overlayRef.classList.add("show");

    setTimeout(() => {
        successRef.classList.remove("show");
        overlayRef.classList.remove("show");
        window.location.href = "./log_in.html";
    }, 1500);
}

/**
 * Sign up
 * @async
 * @returns {void} Return value
 */
async function signUp() {
    const user = document.getElementById("usernameInput").value;
    const mail = document.getElementById("mailInput").value;
    const password = document.getElementById("passwordInput").value;
    const errorMessage = document.getElementById("errorMessage");
    const initials = getInitials(user);

    const exists = await checkUser(errorMessage, user);
    if (exists) return;

    const userColor = randomColor();
    await postData("users/", { "username": user, "mail": mail, "password": password, "initials": initials, "color": userColor });
    successfulSignUp();
}

/**
 * Check user
 * @async
 * @param {*} errorMessage - Errormessage value
 * @param {*} user - User value
 * @returns {boolean} Return value
 */
async function checkUser(errorMessage, user) {
    const users = await loadData("users");
    if (!users) return false;

    const exists = Object.values(users)
        .some(u => u.username === user);

    if (exists) {
        errorMessage.classList.add("errorMessage");
        errorMessage.textContent = "Your username is already taken. Please choose another one.";
        return true;
    }
    errorMessage.textContent = "";
    return false;
}

/**
 * Get initials
 * @param {*} fullName = "" - Fullname = "" value
 * @returns {*} Return value
 */
function getInitials(fullName = "") {
    return fullName.trim().split(" ").map(part => part[0]).join("").toUpperCase();
}