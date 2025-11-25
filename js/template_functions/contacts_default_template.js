function generateContact(name, mail, color, initials) {
    return `<div class="contact-first-letter" id="contact-first-letter">
                <div class="contact-icon-list">
                    <div class="contact-icon" style="background-color: ${color}">
                        ${initials}
                    </div>
                    <div class="contact-list" id="contact-list">
                        <div class="contact-name">
                            ${name}
                        </div>
                        <div class="contact-mail">
                            ${mail}
                        </div>
                    </div>
                </div>
            <div>
    `
}