function init() {
    loadData();
    // saveData("", {"username": "testUser", "mail": "testMail", "password": "testPassword"});
}

const BASE_URL = "https://join-db-473d0-default-rtdb.europe-west1.firebasedatabase.app/"

async function loadData() { //Daten bekommen
    let response = await fetch(BASE_URL + ".json");
    let responseToJson = await response.json();
    console.log(responseToJson);
}

async function saveData(path="", data={}) { //Daten speichern
    let response = await fetch(BASE_URL+ path + ".json", {
        method: "POST",
        header: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),

    }
    );
    return responseToJson = await response.json();
}