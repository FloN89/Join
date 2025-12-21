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
  })
  .catch((error) => {
    console.error("Error loading topbar:", error);
  });

function setUserInitial() {
  const userInitial = localStorage.getItem("userInitial");

  const userInitialElement = document.getElementById("user-initial");

  if (!userInitialElement) {
    console.error("User initial element not found");
    return;
  }

  userInitialElement.innerText = userInitial;
}
