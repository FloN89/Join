let contacts = {};
let id = [];

async function fetchContacts() {
    contacts = await loadData("contacts/") || {};
    id = Object.keys(contacts).sort((a, b) => {
        return contacts[a].contactName
            .localeCompare(contacts[b].contactName);
    });
    renderContacts();
}

function renderContacts() {
    const contactListRef = document.getElementById("contact-list");
    contactListRef.innerHTML = "";

    let lastLetter = "";

    for (let i = 0; i < id.length; i++) {
        const contactInfo = contacts[id[i]];
        const contactIcon = getInitals(id[i]);

        let firstLetter = contactInfo.contactName.charAt(0).toUpperCase()
        if (firstLetter !== lastLetter) {
            contactListRef.innerHTML += generateGroupHeader(firstLetter)
            lastLetter = firstLetter
        }
        contactListRef.innerHTML += generateContact(contactInfo.contactName, contactInfo.contactMail, contactInfo.color, contactIcon, id[i]);
    }
}

function selectedContact(contactId) {
    let selectContact = document.getElementById("contact-content");
    selectContact.classList.remove("show");
    const contactInfo = contacts[contactId];
    const contactIcon = getInitals((contactId));
    changeBackgroundColor(contactId);

    
    selectContact.innerHTML = generateContactContent(contactInfo.contactName, contactInfo.contactMail, contactInfo.contactPhone, contactInfo.color, contactIcon, contactId);
    setTimeout(() => {
        selectContact.classList.add("show");
    }, 300);
}

function changeBackgroundColor(contactId) {
    removeBackgroundColor();
    let backgroundColor = document.getElementById("contact-icon-list-" + contactId);
    backgroundColor.classList.add("contact-icon-list-selected");
}

function removeBackgroundColor() {
    for (let index = 0; index < id.length; index++) {
        let backgroundColor = document.getElementById("contact-icon-list-" + id[index]);
        if (backgroundColor) {
            backgroundColor.classList.remove("contact-icon-list-selected");
        }
    }
}

function openCreateModal() {
    const modal = document.getElementById("newContactModal");
    modal.innerHTML = generateModalContent("Add contact", "Cancel", "Create contact", "Tasks are better with a team!", "createContact()");
    modal.classList.add("show");
}

function openEditContact(contactId) {
    const modal = document.getElementById("newContactModal");
    const contactInfo = contacts[contactId];
    modal.innerHTML = generateModalContent(
        "Edit contact",
        "Delete",
        "Save",
        "",
        `saveEditedContact('${contactId}')`
    );
    modal.classList.add("show");
    document.getElementById("contactNameInput").value = contactInfo.contactName;
    document.getElementById("contactMailInput").value = contactInfo.contactMail;
    document.getElementById("contactPhoneInput").value = contactInfo.contactPhone;
    const iconPreview = document.getElementById("icon-preview");
    iconPreview.innerHTML = getInitalsImg(contactInfo.color, contactId);
}

async function saveEditedContact(contactId) {
    const name = document.getElementById("contactNameInput").value;
    const mail = document.getElementById("contactMailInput").value;
    const phone = document.getElementById("contactPhoneInput").value;

    await saveData("contacts/" + contactId, {
        "contactName": name,
        "contactMail": mail,
        "contactPhone": phone,
        "color": contacts[contactId].color
    });
    toggleModal();
    await fetchContacts();
    selectedContact(contactId);
}

async function deleteContact(contactId) {
    await deleteData("contacts/" + contactId);
    await fetchContacts();
    let content = document.getElementById("contact-content")
    content.innerHTML = "";
}

function toggleModal() {
    let modalRef = document.getElementById("newContactModal");
    modalRef.classList.toggle('show');
}

async function createContact() {
    const name = document.getElementById("contactNameInput").value;
    const mail = document.getElementById("contactMailInput").value;
    const phone = document.getElementById("contactPhoneInput").value;

    await postData("contacts/", {
        "contactName": name,
        "contactMail": mail,
        "contactPhone": phone,
        "color": randomColor()
    });
    toggleModal();
    contactCreated();
    await fetchContacts();
}

function contactCreated() {
    let successRef = document.getElementById("successfulCreated");
    successRef.classList.add("show");
    setTimeout(() => {
        successRef.classList.remove("show");
    }, 1000);
}