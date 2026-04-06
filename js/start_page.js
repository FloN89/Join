 window.addEventListener("load", () => {
      const logo = document.getElementById("logo");
      const fadeLayer = document.getElementById("fadeLayer");

      // 0,30 sec Splash stehen lassen
      setTimeout(() => {
        // Logo fährt in die exakt gleiche Position wie im Login
        logo.classList.add("to-login-position");
        // Fade wie auf Login (nur hier: "weg-faden")
        fadeLayer.classList.add("fade-out");
        logo.classList.add("fade-out");
      }, 300);

      // Nach Ende der Animation -> direkt zur Login-Seite
      // 300ms warten + 800ms Animation = 1100ms
      setTimeout(() => {
       window.location.href = "./html/log_in.html";
      }, 1100);
    });
