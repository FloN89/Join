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
  })
  .catch((error) => {
    console.error("Error loading sidebar:", error);
  });
