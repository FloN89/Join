function getInitals(contactId) {
    const name = contacts[contactId].contactName;

    let rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');
    let initials = [...name.matchAll(rgx)] || [];
    initials = (
        (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
    ).toUpperCase();

    return initials;
}

let color = ["#ff7a00", "#9327ff", "#6e52ff", "#fc71ff", "#ffbb2b", "#1fd7c1", "#462f8a", "#ff4646"]
function randomColor() {
    let getRandomColor = Math.floor(Math.random() * color.length);
    let pickedColor = color[getRandomColor];
    document.documentElement.style.setProperty('--meine-farbe', pickedColor)
    return pickedColor;
}

function eventBubbling(event) {
    event.stopPropagation();
}

function validateEmailValue(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) return false;
    return isValidEmailBasic(trimmed);
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
    me: "Montenegro",
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
 * @param {string} email - Email value
 * @returns {boolean} Return value
 */
function isValidEmailBasic(email) {
    const value = (email || "").trim();
    return /^(?!.*\.\.)(?!\.)(?!.*\.$)[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,}$/i.test(value);
}

/**
 * Validate email input field
 * @param {HTMLInputElement} emailInput - Email input value
 * @param {HTMLElement} errorMessage - Errormessage value
 * @returns {boolean} Return value
 */
function validateEmailInputField(emailInput, errorMessage) {
    if (!emailInput) return true;
    const email = emailInput.value;
    const errorRef = errorMessage || null;

    if (email.length === 0) return handleEmptyEmail(emailInput, errorRef);
    if (!isValidEmailBasic(email)) return handleInvalidEmail(emailInput, errorRef);
    const country = getCountryFromEmail(email);
    if (country === null) return handleUnknownCountryEmail(emailInput, errorRef);
    applyEmailCountry(emailInput, country);
    clearInvalidEmail(emailInput, errorRef);
    return true;
}

/**
 * Validate email input (sign-up usage)
 * @returns {boolean} Return value
 */
function validateEmailInput() {
    const emailInput = document.getElementById("mailInput");
    const errorMessage = document.getElementById("errorMessage");
    return validateEmailInputField(emailInput, errorMessage);
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
    if (errorMessage) {
        errorMessage.classList.add("errorMessage");
        errorMessage.textContent = "Unknown country code in email domain.";
    }
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
 * Show invalid email
 * @param {*} emailInput - Emailinput value
 * @param {*} errorMessage - Errormessage value
 * @returns {void} Return value
 */
function showInvalidEmail(emailInput, errorMessage) {
    emailInput.classList.add("borderRed");
    if (errorMessage) {
        errorMessage.classList.add("errorMessage");
        errorMessage.textContent = "Please enter a valid email address.";
    }
}

/**
 * Clear invalid email
 * @param {*} emailInput - Emailinput value
 * @param {*} errorMessage - Errormessage value
 * @returns {void} Return value
 */
function clearInvalidEmail(emailInput, errorMessage) {
    emailInput.classList.remove("borderRed");
    if (errorMessage && errorMessage.textContent === "Please enter a valid email address.") {
        errorMessage.textContent = "";
    }
    if (errorMessage && errorMessage.textContent === "Unknown country code in email domain.") {
        errorMessage.textContent = "";
    }
}

function validateRequiredValue(value) {
    return (value || '').toString().trim().length > 0;
}

function validateFormFields(form, config = {}) {
    if (!form) return { isValid: true, errors: [] };
    const requiredSelector = config.requiredSelector || '[data-required="true"]';
    const emailSelector = config.emailSelector || '[data-validate="email"]';
    const fields = Array.from(form.querySelectorAll(`${requiredSelector}, ${emailSelector}`));
    const errors = [];
    fields.forEach((field) => {
        const value = field.value;
        if (field.matches(requiredSelector) && !validateRequiredValue(value)) {
            errors.push({ field, type: 'required' });
        } else if (field.matches(emailSelector) && value && !validateEmailValue(value)) {
            errors.push({ field, type: 'email' });
        }
    });
    return { isValid: errors.length === 0, errors };
}
