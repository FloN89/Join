function togglePasswordVisibility(inputId, icon) {
    const password = document.getElementById(inputId);
    if (password.type === "password") {
        password.type = "text";
        if (password.value) {
            icon.src = "../assets/icons/visibility.svg";
        }
    } else {
        password.type = "password";
        if (password.value) {
            icon.src = "../assets/icons/visibility_off.svg";
        }
    }
}

function changeIcon(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.value.length > 0) {
        icon.src = "../assets/icons/visibility_off.svg";
    } else {
        icon.src = "../assets/icons/lock.svg";
    }
}

function checkPasswordMatch() {
    const password = document.getElementById("passwordInput")
    const confirmPassword = document.getElementById("confirmPasswordInput")
    let errorMessage = document.getElementById("errorMessage")

    if (password.value === confirmPassword.value) {
        errorMessage.classList.remove("errorMessage")
        errorMessage.textContent = "";
        return;

    } else {
        errorMessage.classList.add("errorMessage")
        errorMessage.textContent = "Your passwords don't match. Please try again.";
        return;
    }
}

function showSignUp() {
    const user = document.getElementById("usernameInput");
    const mail = document.getElementById("mailInput");
    const password = document.getElementById("passwordInput");
    const confirmPassword = document.getElementById("confirmPasswordInput");
    const signUpButton = document.getElementById("signUpButton");
    const checkbox = document.getElementById("privacyCheckbox");

    if (user.value.length > 0 && mail.value.length > 0 && password.value.length > 0 && confirmPassword.value.length > 0
        && password.value === confirmPassword.value && checkbox.checked) {
        signUpButton.classList.remove("d_none");
    } else {
        signUpButton.classList.add("d_none");
    }
}

async function signUp() {
    const user = document.getElementById("usernameInput").value;
    const mail = document.getElementById("mailInput").value;
    const password = document.getElementById("passwordInput").value;
    const errorMessage = document.getElementById("errorMessage");

    let existUser = await loadData("users/" + user);
    if (existUser) {
        errorMessage.classList.add("errorMessage")
        errorMessage.textContent = "Your username is already taken. Please choose another one.";
        return;

    } else {
        errorMessage.classList.remove("errorMessage")
        errorMessage.textContent = "";
    }

    await saveData("users/" + user, { "username": user, "mail": mail, "password": password });
}