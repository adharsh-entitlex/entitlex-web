/* EntitleX — site interactions */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Theme ---------- */
  var themeButtons = document.querySelectorAll("[data-theme-toggle]");
  var metaTheme = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    var light = theme === "light";
    root.setAttribute("data-theme", light ? "light" : "dark");
    themeButtons.forEach(function (btn) {
      btn.innerHTML = light
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
      btn.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
      btn.setAttribute("title", light ? "Switch to dark theme" : "Switch to light theme");
    });
    if (metaTheme) metaTheme.setAttribute("content", light ? "#f6f8fc" : "#05090f");
  }

  themeButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
      try {
        localStorage.setItem("entitlex-theme", root.getAttribute("data-theme"));
      } catch (e) {}
    });
  });

  /* ---------- Header + scroll progress ---------- */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  var backTop = document.querySelector(".back-top");

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    if (backTop) backTop.classList.toggle("show", y > 700);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (backTop) backTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.querySelector(".menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");

  function setMenu(open) {
    if (!header) return;
    header.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-open", open);
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  }
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(!header.classList.contains("menu-open"));
    });
  }
  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      setMenu(false);
      document.querySelectorAll(".nav-item.is-open").forEach(function (n) { n.classList.remove("is-open"); });
    }
  });

  /* ---------- Dropdown menus ---------- */
  document.querySelectorAll(".nav-item").forEach(function (item) {
    var trigger = item.querySelector(".nav-trigger");
    if (!trigger) return;
    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = item.classList.contains("is-open");
      document.querySelectorAll(".nav-item.is-open").forEach(function (n) { n.classList.remove("is-open"); });
      item.classList.toggle("is-open", !open);
      trigger.setAttribute("aria-expanded", String(!open));
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll(".nav-item.is-open").forEach(function (n) { n.classList.remove("is-open"); });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealItems = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealItems.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Hero console bars ---------- */
  var consoleEl = document.querySelector(".console");
  if (consoleEl) setTimeout(function () { consoleEl.classList.add("is-live"); }, 500);

  /* ---------- Counters ---------- */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    function render(v) {
      el.textContent = prefix + v.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
    }
    render(target);
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    render(0);
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var start = performance.now();
        var dur = 1300;
        function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          render(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* ---------- Tabs ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var buttons = group.querySelectorAll("[data-tab]");
    var panels = group.querySelectorAll("[data-panel]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-tab");
        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", String(on));
        });
        panels.forEach(function (p) {
          p.classList.toggle("is-active", p.getAttribute("data-panel") === key);
        });
      });
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".acc-item").forEach(function (item) {
    var btn = item.querySelector(".acc-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = item.classList.contains("is-open");
      var parent = item.closest(".acc");
      if (parent) {
        parent.querySelectorAll(".acc-item.is-open").forEach(function (other) {
          other.classList.remove("is-open");
          var b = other.querySelector(".acc-btn");
          if (b) b.setAttribute("aria-expanded", "false");
        });
      }
      item.classList.toggle("is-open", !open);
      btn.setAttribute("aria-expanded", String(!open));
    });
  });

  /* ---------- Savings estimator ---------- */
  var seats = document.getElementById("est-seats");
  var spend = document.getElementById("est-spend");
  if (seats && spend) {
    var wasteEls = document.querySelectorAll("[data-waste]");
    function money(n) { return "\u20B9" + Math.round(n).toLocaleString("en-IN"); }
    function updateEstimate() {
      var seatCount = parseInt(seats.value, 10);
      var monthly = parseInt(spend.value, 10);
      var annualSpend = monthly * 12;

      function pct(name) {
        var el = document.querySelector('[data-waste="' + name + '"]');
        return el && el.checked ? 1 : 0;
      }
      var wasteRate = 0.10; // baseline unmanaged leakage
      if (pct("saas")) wasteRate += 0.06;
      if (pct("cloud")) wasteRate += 0.09;
      if (pct("renewals")) wasteRate += 0.05;
      if (pct("licences")) wasteRate += 0.04;

      var annualSaving = annualSpend * Math.min(wasteRate, 0.34) + seatCount * 1800;
      var monthlySaving = annualSaving / 12;

      document.querySelectorAll("[data-est-annual]").forEach(function (el) { el.textContent = money(annualSaving); });
      document.querySelectorAll("[data-est-monthly]").forEach(function (el) { el.textContent = money(monthlySaving); });
      var seatsEl = document.querySelector("[data-est-seats]");
      if (seatsEl) seatsEl.textContent = seatCount.toLocaleString("en-IN") + " users";
      var rateEl = document.querySelector("[data-est-rate]");
      if (rateEl) rateEl.textContent = Math.round(Math.min(wasteRate, 0.34) * 100) + "%";

      [[seats, seatCount.toLocaleString("en-IN")], [spend, money(monthly)]].forEach(function (pair) {
        var input = pair[0];
        var out = document.querySelector('output[for="' + input.id + '"]');
        if (out) out.textContent = input === seats ? pair[1] + " users" : pair[1] + "/mo";
        var p = ((input.value - input.min) / (input.max - input.min)) * 100;
        input.style.setProperty("--p", p + "%");
      });
    }
    seats.addEventListener("input", updateEstimate);
    spend.addEventListener("input", updateEstimate);
    document.querySelectorAll('[data-waste]').forEach(function (cb) { cb.addEventListener("change", updateEstimate); });
    var estForm = document.querySelector(".est-form");
    if (estForm) estForm.addEventListener("submit", function (e) { e.preventDefault(); });
    updateEstimate();
  }

  /* ---------- Pricing billing toggle ---------- */
  var billingGroup = document.querySelector("[data-billing-toggle]");
  if (billingGroup) {
    var billingBtns = billingGroup.querySelectorAll("button[data-billing]");
    function setBilling(mode) {
      billingBtns.forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-billing") === mode); });
      document.querySelectorAll("[data-price-monthly]").forEach(function (el) {
        el.textContent = el.getAttribute(mode === "annual" ? "data-price-annual" : "data-price-monthly");
      });
      document.querySelectorAll("[data-cycle]").forEach(function (el) {
        el.textContent = mode === "annual" ? "/mo, billed yearly" : "/mo";
      });
      document.querySelectorAll("[data-price-note]").forEach(function (el) {
        el.textContent = el.getAttribute(mode === "annual" ? "data-note-annual" : "data-note-monthly") || el.textContent;
      });
    }
    billingBtns.forEach(function (b) {
      b.addEventListener("click", function () { setBilling(b.getAttribute("data-billing")); });
    });
  }

  /* ---------- Custom cursor + magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    var dot = document.createElement("div");
    var ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add("has-cursor");

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    var raf = null;

    function renderCursor() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      raf = Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1 ? requestAnimationFrame(renderCursor) : null;
    }

    document.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!raf) raf = requestAnimationFrame(renderCursor);
      var interactive = e.target.closest("a, button, .card, .quote, .plan, input, select, textarea, label.est-check");
      document.body.classList.toggle("cursor-hover", !!interactive);
    }, { passive: true });

    document.querySelectorAll(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width;
        var y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = "translate(" + (x * 6).toFixed(2) + "px," + (y * 4 - 1).toFixed(2) + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("quote-form");
  if (form) {
    var success = document.getElementById("form-success");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (input) {
        var field = input.closest(".field");
        var ok = input.checkValidity() && String(input.value).trim() !== "";
        if (field) field.classList.toggle("invalid", !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }

      var data = new FormData(form);
      var lines = [];
      ["name", "email", "company", "phone", "gstin", "service", "spend", "message"].forEach(function (k) {
        if (data.get(k)) lines.push(k.toUpperCase() + ": " + data.get(k));
      });
      var subject = "New enquiry — " + (data.get("service") || "EntitleX");
      var mailto = "mailto:info@entitlex.in?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n\n"));

      if (success) {
        success.classList.add("show");
        success.innerHTML = "<strong>Thanks, " + String(data.get("name") || "").split(" ")[0] + ".</strong><br>Your email app is opening with the details pre-filled. Prefer to write directly? <a href=\"" + mailto + "\" style=\"color:inherit;text-decoration:underline\">Open the message</a> or email info@entitlex.in.";
      }
      window.location.href = mailto;
    });
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field) field.classList.remove("invalid");
      });
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
