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
  })
  .catch((error) => {
    console.error("Error loading topbar:", error);
  });

function setUserInitial() {
  const userInitial = localStorage.getItem("userInitial");
  console.log(userInitial);

  const userInitialElement = document.getElementById("user-initial");

  userInitialElement.innerText = userInitial;
  console.log(userInitialElement);
}
