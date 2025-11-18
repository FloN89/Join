const BASE_URL = "https://join-db-473d0-default-rtdb.europe-west1.firebasedatabase.app/"

async function loadData(path = "") { //Daten bekommen
    let response = await fetch(BASE_URL + path + ".json");
    let responseToJson = await response.json();
    return responseToJson;
}

async function saveData(path = "", data = {}) { //Daten speichern
    let response = await fetch(BASE_URL + path + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    }
    );
    const responseToJson = await response.json();
    return responseToJson;
}