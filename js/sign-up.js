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

const COUNTRY_TLDS = {
    at: "Austria",
    ch: "Switzerland",
    de: "Germany",
    fr: "France",
    it: "Italy",
    es: "Spain",
    nl: "Netherlands",
    be: "Belgium",
    pl: "Poland",
    cz: "Czechia",
    sk: "Slovakia",
    hu: "Hungary",
    se: "Sweden",
    no: "Norway",
    dk: "Denmark",
    fi: "Finland",
    uk: "United Kingdom",
    ie: "Ireland",
    pt: "Portugal",
    gr: "Greece",
    ro: "Romania",
    bg: "Bulgaria",
    hr: "Croatia",
    si: "Slovenia",
    rs: "Serbia",
    tr: "Turkey",
    us: "United States",
    ca: "Canada",
    au: "Australia",
    nz: "New Zealand",
    br: "Brazil",
    ar: "Argentina",
    mx: "Mexico",
    cl: "Chile",
    co: "Colombia",
    pe: "Peru",
    za: "South Africa",
    eg: "Egypt",
    ma: "Morocco",
    ae: "United Arab Emirates",
    sa: "Saudi Arabia",
    in: "India",
    pk: "Pakistan",
    bd: "Bangladesh",
    lk: "Sri Lanka",
    cn: "China",
    jp: "Japan",
    kr: "South Korea",
    tw: "Taiwan",
    hk: "Hong Kong",
    sg: "Singapore",
    my: "Malaysia",
    th: "Thailand",
    vn: "Vietnam",
    ph: "Philippines",
    id: "Indonesia",
};

/**
 * Get country from email ccTLD
 * @param {string} email - Email value
 * @returns {string|null} Return value
 */
function getCountryFromEmail(email) {
    const value = (email || "").trim().toLowerCase();
    const atSymbol = value.lastIndexOf("@");
    if (atSymbol === -1) return null;
    const domain = value.slice(atSymbol + 1);
    const parts = domain.split(".").filter(Boolean);
    if (parts.length < 2) return null;
    const tld = parts[parts.length - 1];
    if (tld.length !== 2) return "";
    return COUNTRY_TLDS[tld] || null;
}

/**
 * Is valid email basic
 *  @param {string} email - Email value
 *  @returns {boolean} Return value
 */
function isValidEmailBasic(email) {
    const value = (email || "").trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

/** * Validate email input
 * @returns {boolean} Return value
 */
function validateEmailInput() {
    const emailInput = document.getElementById("mailInput");
    const errorMessage = document.getElementById("errorMessage");
    const email = emailInput.value;
    if (email.length === 0) return handleEmptyEmail(emailInput, errorMessage);
    if (!isValidEmailBasic(email)) return handleInvalidEmail(emailInput, errorMessage);
    const country = getCountryFromEmail(email);
    if (country === null) return handleUnknownCountryEmail(emailInput, errorMessage);
    applyEmailCountry(emailInput, country);
    clearInvalidEmail(emailInput, errorMessage);
    return true;
}

/**
 * Handle empty email
 * @param {*} emailInput - Emailinput value
 * @param {*} errorMessage - Errormessage value
 * @returns {boolean} Return value
 */
function handleEmptyEmail(emailInput, errorMessage) {
    clearInvalidEmail(emailInput, errorMessage);
    emailInput.removeAttribute("data-country");
    return true;
}

/**
 * Handle invalid email
 * @param {*} emailInput - Emailinput value
 * @param {*} errorMessage - Errormessage value
 * @returns {boolean} Return value
 */
function handleInvalidEmail(emailInput, errorMessage) {
    showInvalidEmail(emailInput, errorMessage);
    return false;
}

/**
 * Handle unknown country email
 * @param {*} emailInput - Emailinput value
 * @param {*} errorMessage - Errormessage value
 * @returns {boolean} Return value
 */
function handleUnknownCountryEmail(emailInput, errorMessage) {
    emailInput.classList.add("borderRed");
    errorMessage.classList.add("errorMessage");
    errorMessage.textContent = "Unknown country code in email domain.";
    return false;
}

/**
 * Apply email country
 * @param {*} emailInput - Emailinput value
 * @param {string} country - Country value
 * @returns {void} Return value
 */
function applyEmailCountry(emailInput, country) {
    if (country) {
        emailInput.setAttribute("data-country", country);
    } else {
        emailInput.removeAttribute("data-country");
    }
}

/**
 * Is valid password
 * @param {string} password - Password value
 * @returns {boolean} Return value
 */
function isValidPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

/**
 * Validate password input
 * @returns {boolean} Return value
 */
function validatePasswordInput() {
    const passwordInput = document.getElementById("passwordInput");
    const errorMessage = document.getElementById("errorMessage");
    const password = passwordInput.value;
    if (password.length === 0) {
        clearInvalidPassword(passwordInput, errorMessage);
        return true;
    }
    if (!isValidPassword(password)) {
        showInvalidPassword(passwordInput, errorMessage);
        return false;
    }
    clearInvalidPassword(passwordInput, errorMessage);
    return true;
}

/**
 * Show invalid password
 * @param {*} passwordInput - Passwordinput value
 * @param {*} errorMessage - Errormessage value
 * @returns {void} Return value
 */
function showInvalidPassword(passwordInput, errorMessage) {
    passwordInput.classList.add("borderRed");
    errorMessage.classList.add("errorMessage");
    errorMessage.textContent = "Password must be at least 8 characters, include uppercase, lowercase and a number.";
}

/**
 * Clear invalid password
 * @param {*} passwordInput - Passwordinput value
 * @param {*} errorMessage - Errormessage value
 * @returns {void} Return value
 */
function clearInvalidPassword(passwordInput, errorMessage) {
    passwordInput.classList.remove("borderRed");
    if (errorMessage.textContent === "Password must be at least 8 characters, include uppercase, lowercase and a number.") {
        errorMessage.textContent = "";
    }
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
        && password.value === confirmPassword.value && isValidPassword(password.value) && checkbox.checked) {
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
