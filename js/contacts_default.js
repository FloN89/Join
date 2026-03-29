let contacts = {};
let id = [];

/**
 * Checks whether current session belongs to a guest.
 * @returns {boolean} Return value
 */
function isGuestSessionUser() {
    const userId = sessionStorage.getItem("userId");
    return !userId || userId === "guest";
}

/**
 * Returns contacts collection path for current session.
 * @returns {string} Return value
 */
function getContactsCollectionPath() {
    return isGuestSessionUser() ? "guest-contacts/" : "contacts/";
}

/**
 * Returns single contact path for current session.
 * @param {string} contactId - ID value
 * @returns {string} Return value
 */
function getSingleContactPath(contactId) {
    return `${getContactsCollectionPath()}${contactId}`;
}

/**
 * Fetch contacts
 * @async
 * @returns {void} Return value
 */
async function fetchContacts() {
    contacts = await loadData(getContactsCollectionPath()) || {};
    await includeLoggedInUserInContacts();
    id = Object.keys(contacts).sort((a, b) => {
    return getContactNameById(a).localeCompare(getContactNameById(b));
});
    renderContacts();
}

/**
 * Include logged in user in contacts
 * @async
 * @returns {void} Return value
 */
async function includeLoggedInUserInContacts() {
    const userId = sessionStorage.getItem("userId");
    if (!userId || userId === "guest" || contacts[userId]) return;

    const user = await loadData("users/" + userId);
    if (!user) return;

    contacts[userId] = {
        contactName: String(user.username || user.name || "").trim(),
        contactMail: String(user.mail || "").trim(),
        contactPhone: String(user.phone || "").trim(),
        color: user.color || "#CCCCCC"
    };
}

/**
 * Get contact name by id
 * @param {string} contactId - ID value
 * @returns {*} Return value
 */
function getContactNameById(contactId) {
    const contact = contacts[contactId] || {};
    const name = String(contact.contactName || "").trim();
    return name || String(contact.contactMail || "").trim();
}

/**
 * Render contacts
 */
function renderContacts() {
    const contactListRef = document.getElementById("contact-list");
    contactListRef.innerHTML = "";
    let lastLetter = "";

    for (let i = 0; i < id.length; i++) {
        const contactInfo = contacts[id[i]];
        if (!contactInfo) continue;
        const contactIcon = getInitals(id[i]);

        const sortName = getContactNameById(id[i]);
        if (!sortName) continue;

        let firstLetter = sortName.charAt(0).toUpperCase();
        if (firstLetter !== lastLetter) {
            contactListRef.innerHTML += generateGroupHeader(firstLetter);
            lastLetter = firstLetter;
        }
        contactListRef.innerHTML += generateContact(
            sortName,
            contactInfo.contactMail,
            contactInfo.color,
            contactIcon,
            id[i]
        );
    }
}

/**
 * Selected contact
 * @param {string} contactId - ID value
 * @returns {void} Return value
 */
function selectedContact(contactId) {
    let selectContact = document.getElementById("contact-content");
    const wrapper = document.querySelector(".contact-wrapper");

    selectContact.classList.remove("show");
    const contactInfo = contacts[contactId];
    const contactIcon = getInitals(contactId);
    changeBackgroundColor(contactId);

    selectContact.innerHTML = generateContactContent(
        contactInfo.contactName,
        contactInfo.contactMail,
        contactInfo.contactPhone,
        contactInfo.color,
        contactIcon,
        contactId
    );
    renderActionButton(contactId);

    if (window.innerWidth <= 768) {
        wrapper.classList.add("show-detail");
    }

    setTimeout(() => {
        selectContact.classList.add("show");
    }, 300);
}

/**
 * Render action button
 * @param {string} contactId - ID value
 */
function renderActionButton(contactId) {
    const actionButton = document.getElementById("action-button");
    actionButton.innerHTML = generateActionButton(contactId);
}

/**
 * Back to contacts
 * @returns {void} Return value
 */
function backToContacts() {
    const wrapper = document.querySelector(".contact-wrapper");
    const actionButton = document.getElementById("action-button");
    const selectContact = document.getElementById("contact-content");

    wrapper.classList.remove("show-detail");
    actionButton.innerHTML = "";
    closeOverlay();

    if (window.innerWidth <= 768) {
        removeBackgroundColor();
        selectContact.classList.remove("show");
    }
}

/**
 * Change background color
 * @param {string} contactId - ID value
 * @returns {void} Return value
 */
function changeBackgroundColor(contactId) {
    removeBackgroundColor();
    let backgroundColor = document.getElementById("contact-icon-list-" + contactId);
    backgroundColor.classList.add("contact-icon-list-selected");
}

/**
 * Remove background color
 */
function removeBackgroundColor() {
    for (let index = 0; index < id.length; index++) {
        let backgroundColor = document.getElementById("contact-icon-list-" + id[index]);
        if (backgroundColor) {
            backgroundColor.classList.remove("contact-icon-list-selected");
        }
    }
}

/**
 * Open create modal
 */
function openCreateModal() {
    const modal = document.getElementById("newContactModal");
    const backgroundRef = document.querySelector(".add-contact-overlay-background");
    modal.classList.remove("edit-contact-mode");
    modal.innerHTML = generateModalContent(
        "Add contact",
        "Cancel",
        "Create contact",
        "Tasks are better with a team!",
        "",
        "createContact()",
        "toggleModal()"
    );
    modal.classList.add("show");
    backgroundRef.classList.add("show");
}

/**
 * Open edit contact
 * @param {string} contactId - ID value
 */
function openEditContact(contactId) {
    const modal = document.getElementById("newContactModal");
    const backgroundRef = document.querySelector(".add-contact-overlay-background");
    const contactInfo = contacts[contactId];
    modal.classList.add("edit-contact-mode");
    modal.innerHTML = generateModalContent(
        "Edit contact",
        "Delete",
        "Save",
        "",
        `${contactId}`,
        `saveEditedContact('${contactId}')`,
        `deleteContact('${contactId}')`
    );
    modal.classList.add("show");
    backgroundRef.classList.add("show");
    document.getElementById("contactNameInput").value = contactInfo.contactName;
    document.getElementById("contactMailInput").value = contactInfo.contactMail;
    document.getElementById("contactPhoneInput").value = contactInfo.contactPhone;
    const iconPreview = document.getElementById("icon-preview");
    iconPreview.innerHTML = getInitalsImg(contactInfo.color, contactId);
}

/**
 * Save edited contact
 * @async
 * @param {string} contactId - ID value
 * @returns {void} Return value
 */
async function saveEditedContact(contactId) {
    const formData = getValidatedContactFormData();
    if (!formData) return;

    await saveData(getSingleContactPath(contactId), {
        "contactName": formData.name,
        "contactMail": formData.mail,
        "contactPhone": formData.phone,
        "color": contacts[contactId].color
    });
    toggleModal();
    await fetchContacts();
    selectedContact(contactId);
}

/**
 * Delete contact
 * @async
 * @param {string} contactId - ID value
 * @returns {void} Return value
 */
async function deleteContact(contactId) {
    closeOverlay();

    const modalRef = document.getElementById("newContactModal");
    const backgroundRef = document.querySelector(".add-contact-overlay-background");
    if (modalRef.classList.contains("show")) {
        modalRef.classList.remove("show");
        backgroundRef.classList.remove("show");
    }

    await deleteData(getSingleContactPath(contactId));
    await fetchContacts();

    let content = document.getElementById("contact-content");
    content.innerHTML = "";

    if (window.innerWidth <= 768) {
        backToContacts();
    }
}

/**
 * Toggle modal
 * @returns {void} Return value
 */
function toggleModal() {
    const modalRef = document.getElementById("newContactModal");
    const backgroundRef = document.querySelector(".add-contact-overlay-background");

    modalRef.classList.remove("show");
    modalRef.classList.remove("edit-contact-mode");
    backgroundRef.classList.remove("show");
}

/**
 * Close overlay
 */
function closeOverlay() {
    const overlayRef = document.getElementById("overlay-edit-delete");
    const backgroundRef = document.querySelector(".overlay-background");

    overlayRef.classList.remove("active");
    backgroundRef.style.display = "none";
}

/**
 * Toggle overlay
 * @param {string} contactId - ID value
 * @returns {void} Return value
 */
function toggleOverlay(contactId) {
    const overlayRef = document.getElementById("overlay-edit-delete");
    const backgroundRef = document.querySelector(".overlay-background");

    if (overlayRef.classList.contains("active")) {
        closeOverlay();
    } else {
        overlayRef.innerHTML = generateOverlayEditDelete(contactId);
        overlayRef.classList.add("active");
        backgroundRef.style.display = "block";
    }
}

/**
 * Create contact
 * @async
 * @returns {*} Return value
 */
async function createContact() {
    const formData = getValidatedContactFormData();
    if (!formData) return;

    await postData(getContactsCollectionPath(), {
        "contactName": formData.name,
        "contactMail": formData.mail,
        "contactPhone": formData.phone,
        "color": randomColor()
    });
    toggleModal();
    contactCreated();
    await fetchContacts();
}

/**
 * Get validated contact form data
 * @returns {*} Return value
 */
function getValidatedContactFormData() {
    const nameInput = document.getElementById("contactNameInput");
    const mailInput = document.getElementById("contactMailInput");
    const phoneInput = document.getElementById("contactPhoneInput");

    if (!nameInput || !mailInput || !phoneInput) return null;

    if (!nameInput.reportValidity() || !mailInput.reportValidity() || !phoneInput.reportValidity()) {
        return null;
    }

    const name = nameInput.value.trim();
    const mail = mailInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !mail || !phone) {
        alert("Please fill in all fields.");
        return null;
    }

    return { name, mail, phone };
}

/**
 * Contact created
 * @returns {void} Return value
 */
function contactCreated() {
    let successRef = document.getElementById("successfulCreated");
    successRef.classList.add("show");
    setTimeout(() => {
        successRef.classList.remove("show");
    }, 1000);
}