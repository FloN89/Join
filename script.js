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
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed);
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