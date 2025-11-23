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
        "contactPhone": phone
    });
    toggleModal();
    contactCreated();
}

// async function checkContactExists(errorMessage, user) {
//     const existName = await loadData("contacts/" + name);
//     const existMail = await loadData("contacts/" + mail);
//     const existPhone = await loadData("contacts/" + phone);
//     if (existName || existMail || existPhone) {
//         // errorMessage.classList.add("errorMessage")
//         // errorMessage.textContent = "Your username is already taken. Please choose another one.";
//         return;
//     } else {
//         // errorMessage.classList.remove("errorMessage")
//         // errorMessage.textContent = "";
//         return;
//     }
// }

function contactCreated() {
    let successRef = document.getElementById("successfulCreated");
    successRef.classList.add("show");
    setTimeout(() => {
        successRef.classList.remove("show");
    }, 1000);
}


async function getInitals() {
    const contacts = await loadData("contacts/");
    const name = Object.keys(contacts)[0];
    let rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');
    let initials = [...name.matchAll(rgx)] || [];
    initials = (
        (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
    ).toUpperCase();

    console.log(initials);
}