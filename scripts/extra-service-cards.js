(function () {
  const STYLE_ID = "ac-extra-cards-style";
  const WRAP_ID = "ac-extra-cards-wrap";

  const EXTRA_CARDS = [
    {
      title: "Home Services",
      text: "Explore our core HVAC and refrigeration services for your business.",
      href: "/commercial-hvac/"
    },
    {
      title: "Service Area",
      text: "Proudly serving Chicago, IL and the surrounding areas.",
      href: "/service-area/"
    },
    {
      title: "Contact",
      text: "Call our expert team for reliable HVAC service.",
      href: "/contact/"
    },
    {
      title: "Reviews",
      text: "Read what local customers say about our team and results.",
      href: "/reviews/"
    }
  ];

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#" + WRAP_ID + " { max-width: 1240px; margin: 22px auto 0; padding: 0 24px 10px; }",
      "#" + WRAP_ID + " .ac-extra-cards-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }",
      "#" + WRAP_ID + " .ac-extra-card { background: #fff; border: 1px solid rgba(20,32,70,.14); border-radius: 14px; padding: 22px 18px; box-shadow: 0 10px 22px rgba(0,0,0,.08); display: flex; flex-direction: column; justify-content: space-between; min-height: 230px; }",
      "#" + WRAP_ID + " .ac-extra-card h4 { margin: 0 0 10px; font-size: 1.24rem; line-height: 1.25; color: #2d2e32; text-align: center; }",
      "#" + WRAP_ID + " .ac-extra-card p { margin: 0 0 16px; color: #2d2e32; text-align: center; line-height: 1.48; font-size: .98rem; }",
      "#" + WRAP_ID + " .ac-extra-card a { align-self: center; text-decoration: none; padding: 10px 18px; border-radius: 999px; background: #0f3d78; color: #fff; font-weight: 600; font-size: .92rem; }",
      "#" + WRAP_ID + " .ac-extra-card a:hover { background: #0b2f5f; }",
      "@media (max-width: 1100px) { #" + WRAP_ID + " .ac-extra-cards-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }",
      "@media (max-width: 640px) { #" + WRAP_ID + " { padding-left: 14px; padding-right: 14px; } #" + WRAP_ID + " .ac-extra-cards-grid { grid-template-columns: 1fr; } #" + WRAP_ID + " .ac-extra-card { min-height: 190px; } }"
    ].join("\n");
    document.head.appendChild(style);
  }

  function findTargetSection() {
    const sections = Array.from(document.querySelectorAll("section"));
    return sections.find((section) => {
      const text = section.textContent || "";
      return text.includes("Commercial Refrigeration") &&
        text.includes("We can repair or replace your refrigeration unit with ease.") &&
        text.includes("Proudly serving Chicago, IL and the surrounding areas.") &&
        text.includes("Call our expert team for reliable HVAC service.");
    }) || null;
  }

  function buildCards() {
    const wrap = document.createElement("div");
    wrap.id = WRAP_ID;

    const grid = document.createElement("div");
    grid.className = "ac-extra-cards-grid";

    EXTRA_CARDS.forEach((card) => {
      const item = document.createElement("article");
      item.className = "ac-extra-card";

      const title = document.createElement("h4");
      title.textContent = card.title;

      const text = document.createElement("p");
      text.textContent = card.text;

      const link = document.createElement("a");
      link.href = card.href;
      link.textContent = "Learn More";

      item.appendChild(title);
      item.appendChild(text);
      item.appendChild(link);
      grid.appendChild(item);
    });

    wrap.appendChild(grid);
    return wrap;
  }

  function inject() {
    if (document.getElementById(WRAP_ID)) return true;

    const section = findTargetSection();
    if (!section) return false;

    ensureStyles();
    const cards = buildCards();
    section.insertAdjacentElement("afterend", cards);
    return true;
  }

  function boot() {
    inject();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("load", boot);

  let tries = 0;
  const timer = window.setInterval(() => {
    tries += 1;
    const done = inject();
    if (done || tries > 25) {
      window.clearInterval(timer);
    }
  }, 300);
})();
