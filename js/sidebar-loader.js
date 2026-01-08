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
  })
  .catch((error) => {
    console.error("Error loading sidebar:", error);
  });

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
