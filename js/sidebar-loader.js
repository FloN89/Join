const sidebarContainer = document.getElementById("sidebar-container");

if (!sidebarContainer) {
  throw new Error("Sidebar container not found");
}

fetch("../templates/sidebar_template.html")
  .then((response) => {
    if (response.ok) {
      return response.text();
    }
    throw new Error(
      "Failed to load sidebar template (http ${response.status})"
    );
  })
  .then((html) => {
  sidebarContainer.innerHTML = html;
  setActiveLink();

  // NEU:
  // Auf Public-Seiten (Privacy / Legal Notice) die normale Navigation
  // durch einen Log-In-Eintrag ersetzen
  setPublicSidebar();

})
  .catch((error) => {
    console.error("Error loading sidebar:", error);
  });

/**
 * Set public sidebar
 */
/**
 * Set active link
 */
function setActiveLink() {
  // Hole den aktuellen Pfad
  const currentPath = window.location.pathname;

  // Hole alle Links in der Sidebar
  const sidebarLinks = document.querySelectorAll('#sidebar a');

  // Gehe durch alle Links und setze die active Klasse
  sidebarLinks.forEach(link => {
    const linkPath = link.getAttribute('href');

    // Prüfe ob der Link-Pfad mit dem aktuellen Pfad übereinstimmt
    if (currentPath.includes(linkPath)) {
      link.classList.add('active');
    }
  });
}

// NEU:
// Prüft, ob gerade ein Guest eingeloggt ist
function isGuestUser() {
  return (
    sessionStorage.getItem("userId") === "guest" ||
    sessionStorage.getItem("isGuest") === "true"
  );
}

// NEU:
// Prüft, ob es eine öffentliche Infoseite ist
// (z. B. Privacy Policy / Legal Notice mit <body data-public="true">)
function isPublicInfoPage() {
  return document.body.dataset.public === "true";
}

// NEU:
// Ersetzt auf Public-Seiten die normale Sidebar-Navigation
// durch den Log-In-Button
function setPublicSidebar() {
  const userId = sessionStorage.getItem("userId");
  const shouldRenderPublicSidebar =
    isPublicInfoPage() && (!userId || isGuestUser());

  if (!shouldRenderPublicSidebar) return;

  const sidebar = document.querySelector("#sidebar");
  const sidebarNav = document.querySelector("#sidebar .sidebar-nav ul");

  if (sidebarNav) {
    sidebarNav.innerHTML = `
      <li>
        <a href="log_in.html">
          <img src="../assets/icons/login.svg" alt="Login">
          <span class="label">Log In</span>
        </a>
      </li>
    `;
  }

  // Klasse für spezielles Styling auf Public-Seiten
  if (sidebar) {
    sidebar.classList.add("public-page");
  }
}
