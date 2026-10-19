document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const themeButtons = document.querySelectorAll("[data-theme-toggle], #theme-toggle");

  const applyTheme = (theme, persist = true) => {
    const selected = theme === "light" ? "light" : "dark";
    root.setAttribute("data-theme", selected);

    themeButtons.forEach((button) => {
      const isDark = selected === "dark";
      button.textContent = isDark ? "☀️ Light" : "🌙 Dark";
      button.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
      button.setAttribute("aria-pressed", String(!isDark));
    });

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", selected === "light" ? "#f4f6f9" : "#07111f");
    }

    if (persist) {
      try {
        localStorage.setItem("entitlex-theme", selected);
      } catch (error) {
        // Theme switching remains available if storage is blocked.
      }
    }
  };

  let initialTheme = "dark";
  try {
    initialTheme = localStorage.getItem("entitlex-theme") || "dark";
  } catch (error) {
    // Keep dark mode as the default.
  }
  applyTheme(initialTheme, false);

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
  });

  // Existing mobile navigation behavior.
  const header = document.getElementById("site-header") || document.querySelector(".site-header");
  const menuToggle = header ? header.querySelector(".menu-toggle") : null;
  const menu = header ? header.querySelector("#mobile-menu") : null;

  if (!header || !menuToggle || !menu) return;

  const setMenuState = (open) => {
    header.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  menuToggle.addEventListener("click", () => {
    setMenuState(!header.classList.contains("menu-open"));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuState(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) setMenuState(false);
  });
});
