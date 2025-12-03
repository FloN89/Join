function generateContact(name, mail, color, initials, contactId) {
    return `<div class="contact-first-letter" id="contact-first-letter">
                <div class="contact-icon-list" onclick="selectedContact('${contactId}')" id="contact-icon-list-${contactId}">
                    <div class="contact-icon" style="background-color: ${color}">
                        ${initials}
                    </div>
                    <div class="contact-list">
                        <div class="contact-name">
                            ${name}
                        </div>
                        <div class="contact-mail">
                            ${mail}
                        </div>
                    </div>
                </div>
            </div>
    `
}

function generateGroupHeader(letter) {
    return `
        <div class="contact-group-header">${letter}</div>
    `;
}

function generateContactContent(name, mail, number, color, initials) {
    return `
        <div>
            <div class="contact-content-header">
                <div class="contact-icon-large" style="background-color: ${color}">
                ${initials}
                </div>
                <div>
                    <div class="contact-content-name">
                        <div>${name}
                        </div>
                    </div>
                    <div class="contact-content-edit-delete>
                        <button class="contact-edit-button">Edit</button>
                        <button class="contact-delete-button">Delete</button>
                    </div>
                </div>
            </div>
        </div>
        `
}