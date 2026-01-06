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

function generateContactContent(name, mail, number, color, initials, contactId) {
    return `
        <div class="contact-content-header">
            <div class="contact-icon-content" style="background-color: ${color}">
                ${initials}
            </div>

            <div class="contact-header-info">
                <h1 class="contact-name">${name}</h1>

                <div class="contact-actions">
                    <div class="action edit" onclick="openEditContact('${contactId}')">
                        <img src="../assets/icons/edit.svg" alt="edit">
                        <span>Edit</span>
                    </div>
                    <div class="action delete" onclick="deleteContact('${contactId}')">
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
        `
}

function generateModalContent(header, button1, button2, underheader, functionCall) {
    return `
                <div class="modal-content">
                    <header class="title">
                        <img src="../assets/icons/Capa 2_white.svg" alt="">
                        <h1>${header}</h1>
                        <h2>${underheader}</h2>
                    </header>
                    
                    <div class="person" id="icon-preview">
                        <img src="../assets/icons/person_white.svg" alt="">
                    </div>
                    
                    <div class="input-group">
                        <span class="close" onclick="toggleModal()">&times;</span>
                        <label class="input-wrapper">
                            <input type="text" placeholder="Name" required id="contactNameInput">
                            <img src="../assets/icons/person.svg" alt="" class="field-icon">
                        </label>

                        <label class="input-wrapper">
                            <input type="email" placeholder="Email" required id="contactMailInput">
                            <img src="../assets/icons/mail.svg" alt="" class="field-icon">
                        </label>

                        <label class="input-wrapper">
                            <input type="tel" placeholder="Phone" required id="contactPhoneInput">
                            <img src="../assets/icons/call.svg" alt="" class="field-icon">
                        </label>

                        <div class="buttons">
                            <button type="button" class="cancel-btn" onclick="toggleModal()">
                                <span>${button1}</span>
                                <span class="close-icon">&times;</span>
                            </button>

                            <button type="button" class="create-btn" onclick="${functionCall}">
                                ${button2}
                                <img src="../assets/icons/check_white.svg" alt="">
                            </button>
                        </div>
                    </div>
    `
}

function getInitalsImg(color, contactId) {
    return `
    <div class="contact-icon-large" style = "background-color: ${color}">
        ${getInitals((contactId))}
    </div > `
}
