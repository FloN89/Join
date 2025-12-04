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
        <div class="contact-content">

        <div class="contact-content-header">
            <div class="contact-icon-large" style="background-color: ${color}">
                ${initials}
            </div>

            <div class="contact-header-info">
                <h1 class="contact-name">${name}</h1>

                <div class="contact-actions">
                    <div class="action edit" onclick="openEditContact()">
                        <img src="../assets/icons/edit.svg" alt="edit">
                        <span>Edit</span>
                    </div>
                    <div class="action delete" onclick="deleteContact()">
                        <img src="../assets/icons/delete.svg" alt="delete">
                        <span>Delete</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="contact-info-section">
            <h2>Contact Information</h2>

            <div class="info-block">
                <h3>Email</h3>
                <a href="mailto:${mail}" class="contact-mail">${mail}</a>
            </div>

            <div class="info-block">
                <h3>Phone</h3>
                <p class="contact-phone">${number}</p>
            </div>
        </div>

    </div>
        `
}