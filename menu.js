document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("site-header");
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("mobile-menu");

  if (!header || !toggle || !menu) return;

  const setMenuState = (open) => {
    header.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-open", open);

    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close menu" : "Open menu"
    );
  };

  toggle.addEventListener("click", () => {
    setMenuState(!header.classList.contains("menu-open"));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      setMenuState(false);
    }
  });
});
