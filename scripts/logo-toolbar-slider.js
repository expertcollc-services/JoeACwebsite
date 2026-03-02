(function () {
  const SECTION_ID = "66bb587c";
  const STYLE_ID = "ac-logo-slider-style";
  const LOGOS = [
    "/Resources/images/york-full-color-logo-badb7d07-1920w.png",
    "/Resources/images/lennox_logo-524d6d9d-1920w.png",
    "/Resources/images/carrier-logo-ac907dd6-1920w.png",
    "/Resources/images/Layer%201-6df10401-1920w.png",
    "/Resources/images/CONTINENTAL%20REFRIGIRATION%20-1920w.png",
    "/Resources/images/DELFIELD-1920w.png",
    "/Resources/images/FOLLETT-1920w.jpeg",
    "/Resources/images/HUSSMANN-1920w.jpeg",
    "/Resources/images/MANITOWOC-1920w.png",
    "/Resources/images/ICE%20O%20MATiC%20-1920w.png",
    "/Resources/images/TRAULSEN%20-1920w.jpeg",
    "/Resources/images/TRUE%20REFRIGIRATION%20-1920w.png"
  ];

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#" + SECTION_ID + " [data-auto='slider-wrapper'].ac-logo-wrapper { overflow: hidden !important; height: auto !important; }",
      "#" + SECTION_ID + " .ac-logo-track { display: flex !important; align-items: center; gap: 0 !important; will-change: transform; }",
      "#" + SECTION_ID + " .ac-logo-slide { display: flex; justify-content: center; align-items: center; min-height: 140px; padding: 8px 14px; box-sizing: border-box; }",
      "#" + SECTION_ID + " .ac-logo-slide img { width: 100%; max-width: 180px; max-height: 82px; object-fit: contain; filter: saturate(1.05); }",
      "#" + SECTION_ID + " [data-auto='pagination-arrows'].ac-logo-controls { display: flex !important; justify-content: center; gap: 12px; margin-top: 14px; }",
      "#" + SECTION_ID + " [data-auto='pagination-button-arrow'] { border-radius: 999px; }",
      "@media (max-width: 767px) { #" + SECTION_ID + " .ac-logo-slide { min-height: 96px; padding: 6px 8px; } #" + SECTION_ID + " .ac-logo-slide img { max-width: 130px; max-height: 52px; } }"
    ].join("\n");
    document.head.appendChild(style);
  }

  function getSection() {
    const byId = document.getElementById(SECTION_ID);
    if (byId) return byId;
    const blocks = Array.from(document.querySelectorAll(".dmNewParagraph, h1, h2, h3"));
    const heading = blocks.find((el) => /Different Manufacturers We Service/i.test(el.textContent || ""));
    return heading ? heading.closest("section") : null;
  }

  function visibleCount() {
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
  }

  function setupSlider() {
    const section = getSection();
    if (!section) return false;

    const wrapper = section.querySelector("[data-auto='slider-wrapper']");
    const film = section.querySelector("[data-auto='slider-filmRole']");
    const prevBtn = section.querySelector("[data-auto='RuntimeSlider-navigation-back']");
    const nextBtn = section.querySelector("[data-auto='RuntimeSlider-navigation-next']");
    const controls = section.querySelector("[data-auto='pagination-arrows']");

    if (!wrapper || !film) return false;

    ensureStyles();
    wrapper.classList.add("ac-logo-wrapper");
    if (controls) controls.classList.add("ac-logo-controls");

    const state = section.__acLogoState || {
      index: 0,
      visible: visibleCount(),
      timer: null,
      total: LOGOS.length
    };
    section.__acLogoState = state;

    const extended = LOGOS.concat(LOGOS.slice(0, state.visible));
    film.className = "ac-logo-track";
    film.innerHTML = "";

    extended.forEach((src, idx) => {
      const cell = document.createElement("div");
      cell.className = "ac-logo-slide";
      cell.setAttribute("data-logo-index", String(idx));
      cell.style.flex = "0 0 " + String(100 / state.visible) + "%";

      const img = document.createElement("img");
      img.src = src;
      img.alt = "Manufacturer logo";
      img.loading = "lazy";
      cell.appendChild(img);
      film.appendChild(cell);
    });

    function moveTo(index, animate) {
      state.index = index;
      const percent = (100 / state.visible) * state.index;
      film.style.transition = animate ? "transform 420ms ease" : "none";
      film.style.transform = "translateX(-" + percent + "%)";
    }

    function slideBy(delta) {
      moveTo(state.index + delta, true);
      window.setTimeout(() => {
        if (state.index >= state.total) {
          moveTo(0, false);
          return;
        }
        if (state.index < 0) {
          moveTo(Math.max(0, state.total - state.visible), false);
        }
      }, 430);
    }

    function stopAuto() {
      if (state.timer) {
        window.clearInterval(state.timer);
        state.timer = null;
      }
    }

    function startAuto() {
      stopAuto();
      state.timer = window.setInterval(() => {
        slideBy(state.visible);
      }, 4200);
    }

    function onPrev(event) {
      event.preventDefault();
      event.stopPropagation();
      slideBy(-state.visible);
      startAuto();
    }

    function onNext(event) {
      event.preventDefault();
      event.stopPropagation();
      slideBy(state.visible);
      startAuto();
    }

    if (prevBtn && !prevBtn.dataset.acLogoHooked) {
      prevBtn.dataset.acLogoHooked = "1";
      prevBtn.title = "Slide logos left";
      prevBtn.addEventListener("click", onPrev, true);
    }

    if (nextBtn && !nextBtn.dataset.acLogoHooked) {
      nextBtn.dataset.acLogoHooked = "1";
      nextBtn.title = "Slide logos right";
      nextBtn.addEventListener("click", onNext, true);
    }

    if (!wrapper.dataset.acHoverHooked) {
      wrapper.dataset.acHoverHooked = "1";
      wrapper.addEventListener("mouseenter", stopAuto);
      wrapper.addEventListener("mouseleave", startAuto);
    }

    moveTo(0, false);
    startAuto();

    if (!section.dataset.acResizeHooked) {
      section.dataset.acResizeHooked = "1";
      window.addEventListener("resize", () => {
        const nextVisible = visibleCount();
        if (nextVisible === state.visible) return;
        stopAuto();
        state.visible = nextVisible;
        state.index = 0;
        setupSlider();
      });
    }

    section.dataset.acLogoSliderReady = "1";
    return true;
  }

  function boot() {
    setupSlider();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("load", boot);

  let attempts = 0;
  const interval = window.setInterval(() => {
    attempts += 1;
    const ok = setupSlider();
    if (ok || attempts > 30) {
      window.clearInterval(interval);
    }
  }, 400);
})();
