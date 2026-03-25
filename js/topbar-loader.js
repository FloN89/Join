const topbarContainer = document.getElementById("topbar-container");

if (!topbarContainer) {
  throw new Error("Topbar container not found");
}

guardGuestAccess();

fetch("../templates/topbar_template.html")
  .then((response) => {
    if (response.ok) {
      return response.text();
    }
    throw new Error("Failed to load topbar template (http ${response.status})");
  })
  .then((html) => {
  topbarContainer.innerHTML = html;
  setUserInitial();
  initUserOverlay();
  setGuestTopbarRestrictions();
  renderGuestSignupBanner();
})
  .catch(() => {
    // Silent error handling for production
  });

/**
 * Set user initial
 * @async
 */
async function setUserInitial() {
  const userInitialElement = document.getElementById("user-initial");
  if (!userInitialElement) {
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

/**
 * Init user overlay
 */
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

 // im guest login
function isGuestUser() {
  return (
    sessionStorage.getItem("userId") === "guest" ||
    sessionStorage.getItem("isGuest") === "true"
  );
}

function isGuestAllowedPage() {
  const currentPage = (window.location.pathname.split("/").pop() || "").toLowerCase();

  return (
    currentPage === "summary.html" ||
    currentPage === "add_task.html" ||
    currentPage === "board.html" ||
    currentPage === "contacts_default.html" ||
    currentPage === "help.html" ||
    currentPage === "sign-up.html" ||
    currentPage === "log_in.html" ||
    currentPage.includes("privacy") ||
    currentPage.includes("legal-notice") ||
    currentPage.includes("legal_notice")
  );
}

function guardGuestAccess() {
  if (isGuestUser() && !isGuestAllowedPage()) {
    window.location.replace("summary.html");
  }
}

function renderGuestSignupBanner() {
  const currentPage = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const isInfoPage =
    currentPage.includes("privacy") ||
    currentPage.includes("legal-notice") ||
    currentPage.includes("legal_notice");

  if (!isGuestUser() || !isInfoPage || document.querySelector(".guest-signup-banner")) {
    return;
  }

  const banner = document.createElement("div");
  banner.className = "guest-signup-banner";
  banner.innerHTML = `
    <div class="guest-signup-banner__text">
      Du kannst diese Datei nur ansehen und kommentieren.
    </div>
    <button class="guest-signup-banner__button" type="button">Log in</button>
    <button class="guest-signup-banner__close" type="button" aria-label="Schließen">×</button>
  `;

  document.body.appendChild(banner);

  banner
    .querySelector(".guest-signup-banner__button")
    .addEventListener("click", function () {
      window.location.href = "sign-up.html";
    });

  banner
    .querySelector(".guest-signup-banner__close")
    .addEventListener("click", function () {
      banner.remove();
    });
}
