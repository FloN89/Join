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

function contactCreated() {

}