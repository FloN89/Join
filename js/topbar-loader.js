const topbarContainer = document.getElementById("topbar-container");

if (!topbarContainer) {
  throw new Error("Topbar container not found");
}

fetch("/templates/topbar_template.html")
  .then((response) => {
    if (response.ok) {
      return response.text();
    }
    throw new Error("Failed to load topbar template (http ${response.status})");
  })
  .then((html) => {
    topbarContainer.innerHTML = html;
    console.log("Topbar: loaded");
    setUserInitial();
    initUserOverlay();
  })
  .catch((error) => {
    console.error("Error loading topbar:", error);
  });

async function setUserInitial() {
  const userInitialElement = document.getElementById("user-initial");
  if (!userInitialElement) {
    console.error("User initial element not found");
    return;
  }

  const userId = sessionStorage.getItem("userId");
  const isPublic = document.body.dataset.public === "true";

  if (!userId) {
    if (isPublic) {
      userInitialElement.style.display = "none";
      const overlay = document.getElementById("user-overlay");
      if (overlay) overlay.style.display = "none";
      return;
    }
    window.location.href = "../html/log_in.html";
    return;
  }

  if (userId === "guest") {
    userInitialElement.innerText = "G";
    userInitialElement.classList.add("guest-badge");
    return;
  }

  const user = await loadData("users/" + userId);
  if (user && user.initials) {
    userInitialElement.innerText = user.initials;
    if (user.color) {
      userInitialElement.style.backgroundColor = user.color;
    }
  }
}

function initUserOverlay() {
  // Hole das User-Kürzel Element
  const userInitial = document.getElementById("user-initial");
  // Hole das Overlay Element
  const overlay = document.getElementById("user-overlay");

  // Füge einen Click-Listener zum User-Kürzel hinzu
  userInitial.addEventListener("click", function () {
    overlay.classList.toggle("active");
  });

  // Schließe das Overlay wenn man außerhalb klickt
  document.addEventListener("click", function (event) {
    // Prüfe ob der Klick NICHT auf dem User-Kürzel oder im Overlay war
    if (
      !userInitial.contains(event.target) &&
      !overlay.contains(event.target)
    ) {
      overlay.classList.remove("active");
    }
  });
}
