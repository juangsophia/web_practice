(function () {
  "use strict";

  const STORAGE_KEY = "portfolio-theme";
  const header = document.querySelector(".site-header");
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const themeToggle = document.getElementById("theme-toggle");
  const yearEl = document.getElementById("year");
  const typewriterEl = document.getElementById("typewriter");
  const typewriterCursor = document.querySelector(".typewriter-cursor");
  const backToTopBtn = document.getElementById("back-to-top");
  const visitorCountEl = document.getElementById("visitor-count");

  const VISITOR_API =
    "https://countapi.mileshilliard.com/api/v1/hit/portfolio-sophie-chuang-visits";

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  function getPreferredTheme() {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "light" ? "切換為深色主題" : "切換為淺色主題"
      );
    }
  }

  function initTheme() {
    const stored = getStoredTheme();
    const theme = stored === "light" || stored === "dark" ? stored : getPreferredTheme();
    applyTheme(theme);
  }

  function toggleTheme() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const next = isLight ? "dark" : "light";
    applyTheme(next);
    setStoredTheme(next);
  }

  function closeNav() {
    if (!header || !navToggle) return;
    header.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "開啟選單");
  }

  function openNav() {
    if (!header || !navToggle) return;
    header.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "關閉選單");
  }

  function toggleNav() {
    if (!header || !navToggle) return;
    if (header.classList.contains("is-open")) {
      closeNav();
    } else {
      openNav();
    }
  }

  function initNavToggle() {
    if (!navToggle || !header) return;
    navToggle.addEventListener("click", toggleNav);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 768px)").matches) {
        closeNav();
      }
    });
  }

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]:not(.skip-link)');
    links.forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeNav();
        if (history.replaceState) {
          history.replaceState(null, "", id);
        }
      });
    });
  }

  function initReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initYear() {
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function initTypewriter() {
    if (!typewriterEl) return;

    const raw = typewriterEl.getAttribute("data-text") || "";
    const text = raw.replace(/\\n/g, "\n").replace(/&#10;/g, "\n");
    const speed = 70;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      typewriterEl.textContent = text;
      if (typewriterCursor) typewriterCursor.classList.add("is-done");
      return;
    }

    let index = 0;

    function tick() {
      if (index < text.length) {
        typewriterEl.textContent += text.charAt(index);
        index += 1;
        setTimeout(tick, speed);
      } else if (typewriterCursor) {
        typewriterCursor.classList.add("is-done");
      }
    }

    tick();
  }

  function initMap() {
    const mapEl = document.getElementById("leaflet-map");
    if (!mapEl || typeof L === "undefined") return;

    const map = L.map(mapEl, {
      scrollWheelZoom: false,
    }).setView([25.0339, 121.5645], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker([25.0339, 121.5645])
      .addTo(map)
      .bindPopup("台北 101")
      .openPopup();

    mapEl.addEventListener("click", function enableZoom() {
      map.scrollWheelZoom.enable();
      mapEl.removeEventListener("click", enableZoom);
    });

    window.addEventListener("resize", function () {
      map.invalidateSize();
    });
  }

  function initVisitorCount() {
    if (!visitorCountEl) return;

    fetch(VISITOR_API)
      .then(function (res) {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then(function (data) {
        if (typeof data.value === "number") {
          visitorCountEl.textContent = data.value.toLocaleString("zh-TW");
        }
      })
      .catch(function () {
        visitorCountEl.textContent = "—";
      });
  }

  function initBackToTop() {
    if (!backToTopBtn) return;

    const showThreshold = 400;

    function updateVisibility() {
      const show = window.scrollY > showThreshold;
      backToTopBtn.hidden = !show;
      backToTopBtn.classList.toggle("is-visible", show);
    }

    window.addEventListener("scroll", updateVisibility, { passive: true });
    updateVisibility();

    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }
    initNavToggle();
    initSmoothScroll();
    initReveal();
    initYear();
    initTypewriter();
    initMap();
    initVisitorCount();
    initBackToTop();
  });
})();
