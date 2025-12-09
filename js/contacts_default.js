let contacts = {};
let id = [];

async function fetchContacts() {
    contacts = await loadData("contacts/");
    id = Object.keys(contacts);
    renderContacts();
}

function renderContacts() {
    const contactListRef = document.getElementById("contact-list");
    contactListRef.innerHTML = "";

    let lastLetter = "";

    for (let i = 0; i < id.length; i++) {
        const contactInfo = contacts[id[i]];
        const contactIcon = getInitals(i)

        let firstLetter = contactInfo.contactName.charAt(0).toUpperCase()
        if (firstLetter !== lastLetter) {
            contactListRef.innerHTML += generateGroupHeader(firstLetter)
            lastLetter = firstLetter
        }
        contactListRef.innerHTML += generateContact(contactInfo.contactName, contactInfo.contactMail, contactInfo.color, contactIcon, id[i]);
    }
}

function selectedContact(contactId) {
    const contactInfo = contacts[contactId];
    const contactIcon = getInitals(id.indexOf(contactId));
    changeBackgroundColor(contactId);

    let selectContact = document.getElementById("contact-content");
    selectContact.innerHTML = generateContactContent(contactInfo.contactName, contactInfo.contactMail, contactInfo.contactPhone, contactInfo.color, contactIcon);

    selectContact.classList.add("show");
}

function changeBackgroundColor(contactId) {
    removeBackgroundColor();
    let backgroundColor = document.getElementById("contact-icon-list-" + contactId);
    backgroundColor.classList.add("contact-icon-list-selected");
}

function removeBackgroundColor() {
    for (let index = 0; index < id.length; index++) {
        let backgroundColor = document.getElementById("contact-icon-list-" + id[index]);
        backgroundColor.classList.remove("contact-icon-list-selected");
    }
}

function openCreateModal() {
    const modal = document.getElementById("newContactModal");
    modal.innerHTML = generateModalContent("Add contact", "Cancel", "Create contact", "Tasks are better with a team!");
    modal.classList.add("show");
}

function openEditContact() {
    const modal = document.getElementById("newContactModal");
    modal.innerHTML = generateModalContent("Edit contact", "Delete", "Save", "");
    modal.classList.add("show");
}

function toggleModal() {
    let modalRef = document.getElementById("newContactModal");
    modalRef.classList.toggle('show');
}

async function createContact() {
    const name = document.getElementById("contactNameInput").value;
    const mail = document.getElementById("contactMailInput").value;
    const phone = document.getElementById("contactPhoneInput").value;

    await saveData("contacts/" + name, {
        "contactName": name,
        "contactMail": mail,
        "contactPhone": phone,
        "color": randomColor()
    });
    toggleModal();
    contactCreated();
    renderContacts();
}

function contactCreated() {
    let successRef = document.getElementById("successfulCreated");
    successRef.classList.add("show");
    setTimeout(() => {
        successRef.classList.remove("show");
    }, 1000);
}


function getInitals(i) {
    const firstKey = Object.keys(contacts)[i];
    const name = contacts[firstKey].contactName;

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