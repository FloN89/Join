// start_page.js
window.addEventListener("load", () => {
  const logo = document.getElementById("logo");
  const fadeLayer = document.getElementById("fadeLayer");

  if (!logo || !fadeLayer) return;

  let hasRedirected = false;

  function goToLogin() {
    if (hasRedirected) return;
    hasRedirected = true;
    window.location.href = "./html/log_in.html";
  }

  setTimeout(() => {
    logo.classList.add("to-login-position");
    fadeLayer.classList.add("fade-out");
  }, 250);

  logo.addEventListener(
    "transitionend",
    (event) => {
      if (event.propertyName !== "width") return;

      requestAnimationFrame(() => {
        requestAnimationFrame(goToLogin);
      });
    },
    { once: true }
  );

  setTimeout(goToLogin, 1400);
});