const sidebarContainer = document.getElementById("sidebar-container");

if (!sidebarContainer) {
  throw new Error("Sidebar container not found");
}

fetch("/templates/sidebar_template.html")
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
    console.log("Sidebar: loaded");
    setActiveLink();
    setPublicSidebar();
  })
  .catch((error) => {
    console.error("Error loading sidebar:", error);
  });

function setPublicSidebar() {
  const isPublic = document.body.dataset.public === "true";
  const userId = sessionStorage.getItem("userId");

  if (isPublic && !userId) {
    const sidebarNav = document.querySelector("#sidebar .sidebar-nav ul");
    if (sidebarNav) {
      sidebarNav.innerHTML = `<li><a href="/html/log_in.html"><img src="/assets/icons/login.svg" alt="Login"><span class="label">Log In</span></a></li>`;
    }
  }
}

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
