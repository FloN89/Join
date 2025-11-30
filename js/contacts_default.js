let contacts = {};
let id = [];

async function fetchContacts() {
    contacts = await loadData("contacts/");
    id = Object.keys(contacts);
    renderContacts();
}

async function renderContacts() {
    const contactListRef = document.getElementById("contact-list");
    contactListRef.innerHTML = "";

    let lastLetter = "";

    for (let i = 0; i < id.length; i++) {
        const contactInfo = contacts[id[i]];
        const contactIcon = await getInitals(i)

        let firstLetter = contactInfo.contactName.charAt(0).toUpperCase()
        if (firstLetter !== lastLetter) {
            contactListRef.innerHTML += generateGroupHeader(firstLetter)
            lastLetter = firstLetter
        }
        contactListRef.innerHTML += generateContact(contactInfo.contactName, contactInfo.contactMail, contactInfo.color, contactIcon);
    }
}

function selectedContact() {
    let selectContact = document.getElementById("contact-content");
    selectContact.innerHTML = generateContactContent();
    console.log("contact selected");
}

function toggleModal() {
    let modalRef = document.getElementById("newContactModal");
    modalRef.classList.toggle("show");
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
    loadContacts();
}

function contactCreated() {
    let successRef = document.getElementById("successfulCreated");
    successRef.classList.add("show");
    setTimeout(() => {
        successRef.classList.remove("show");
    }, 1000);
}


async function getInitals(i) {
    const contacts = await loadData("contacts/");
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