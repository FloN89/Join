const BASE_URL = "https://join-db-473d0-default-rtdb.europe-west1.firebasedatabase.app/"

/**
 * Load data
 * @async
 * @param {*} path = "" - Path = "" value
 * @returns {void} Return value
 */
async function loadData(path = "") { //Daten bekommen
    let response = await fetch(BASE_URL + path + ".json");
    let responseToJson = await response.json();
    return responseToJson;
}

/**
 * Post data
 * @async
 * @param {*} path = "" - Path = "" value
 * @param {*} data = {} - Data object
 * @returns {void} Return value
 */
async function postData(path = "", data = {}) { //Daten posten
    let response = await fetch(BASE_URL + path + ".json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    }
    );
    const responseToJson = await response.json();
    return responseToJson;
}

/**
 * Save data
 * @async
 * @param {*} path = "" - Path = "" value
 * @param {*} data = {} - Data object
 * @returns {void} Return value
 */
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

/**
 * Delete data
 * @async
 * @param {*} path = "" - Path = "" value
 * @returns {void} Return value
 */
async function deleteData(path = "") { //Daten löschen
    let response = await fetch(BASE_URL + path + ".json", {
        method: "DELETE",
    }
    );
    const responseToJson = await response.json();
    return responseToJson;
}
