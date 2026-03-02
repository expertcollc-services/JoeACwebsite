(function () {
  "use strict";

  var TARGET_CONTAINER_ID = "6c385d1b";

  var EXTRA_CARDS = [
    {
      title: "Home Services",
      description: "Explore our commercial HVAC and refrigeration services for your business.",
      href: "/home/"
    },
    {
      title: "Reviews",
      description: "Read what local customers say about our team and results.",
      href: "/reviews/"
    }
  ];

  function injectStyles() {
    if (document.getElementById("ac-extra-service-cards-style")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "ac-extra-service-cards-style";
    style.textContent = [
      "[id='6c385d1b']{flex-wrap:wrap!important;}",
      "[id='6c385d1b'] .ac-extra-service-card{min-height:8px;column-gap:4%;row-gap:16px;background-color:var(--color_3,#fff);border-radius:5px;box-shadow:#676f72 3px 0 11px 0;width:32.3333333333%;justify-content:space-between;align-items:center;min-width:4%;padding:25px;margin:0;display:flex;flex-direction:column;}",
      "[id='6c385d1b'] .ac-extra-service-card .ac-card-title,[id='6c385d1b'] .ac-extra-service-card .ac-card-description{width:100%;}",
      "[id='6c385d1b'] .ac-extra-service-card .ac-card-title h4{margin:0;}",
      "[id='6c385d1b'] .ac-extra-service-card .ac-card-description p{margin:0;line-height:1.5;}",
      "[id='6c385d1b'] .ac-extra-service-card .ac-card-action{width:280px;max-width:100%;height:50px;}",
      "[id='6c385d1b'] .ac-extra-service-icon{width:70px;height:70px;border:2px solid var(--color_1,#e50707);border-radius:999px;display:inline-flex;align-items:center;justify-content:center;color:var(--color_1,#e50707);}",
      "[id='6c385d1b'] .ac-extra-service-icon .icon{font-size:28px;}",
      "@media (min-width:767px) and (max-width:1024px){[id='6c385d1b'] .ac-extra-service-card{width:48.5%;flex:1 1 auto;}}",
      "@media (max-width:767px){[id='6c385d1b'] .ac-extra-service-card{width:100%;min-height:240px;}}",
      "@media (min-width:468px) and (max-width:767px){[id='6c385d1b'] .ac-extra-service-card{width:48.5%;flex:1 1 auto;}}"
    ].join("");
    document.head.appendChild(style);
  }

  function makeIcon() {
    var iconWrap = document.createElement("div");
    iconWrap.className = "flex-element widget-wrapper";
    iconWrap.setAttribute("data-auto", "flex-element-widget-wrapper");

    var icon = document.createElement("div");
    icon.className = "ac-extra-service-icon";

    var iconGlyph = document.createElement("span");
    iconGlyph.className = "icon hasFontIcon icon-star";
    iconGlyph.setAttribute("aria-hidden", "true");

    icon.appendChild(iconGlyph);
    iconWrap.appendChild(icon);
    return iconWrap;
  }

  function makeTitle(title) {
    var wrap = document.createElement("div");
    wrap.className = "flex-element widget-wrapper ac-card-title";
    wrap.setAttribute("data-auto", "flex-element-widget-wrapper");
    wrap.setAttribute("data-widget-type", "paragraph");

    var paragraph = document.createElement("div");
    paragraph.className = "dmNewParagraph";
    paragraph.setAttribute("data-element-type", "paragraph");
    paragraph.setAttribute("data-version", "5");

    var h4 = document.createElement("h4");
    h4.className = "text-align-center";

    var span = document.createElement("span");
    span.style.display = "unset";
    span.textContent = title;

    h4.appendChild(span);
    paragraph.appendChild(h4);
    wrap.appendChild(paragraph);
    return wrap;
  }

  function makeDescription(text) {
    var wrap = document.createElement("div");
    wrap.className = "flex-element widget-wrapper ac-card-description";
    wrap.setAttribute("data-auto", "flex-element-widget-wrapper");
    wrap.setAttribute("data-widget-type", "paragraph");

    var paragraph = document.createElement("div");
    paragraph.className = "dmNewParagraph";
    paragraph.setAttribute("data-element-type", "paragraph");
    paragraph.setAttribute("data-version", "5");

    var p = document.createElement("p");
    p.className = "m-size-15 text-align-center size-16";
    p.style.lineHeight = "1.5";

    var span = document.createElement("span");
    span.style.display = "unset";
    span.style.color = "rgb(45, 46, 50)";
    span.className = "m-font-size-15 font-size-16";
    span.textContent = text;

    p.appendChild(span);
    paragraph.appendChild(p);
    wrap.appendChild(paragraph);
    return wrap;
  }

  function makeButton(href) {
    var wrap = document.createElement("div");
    wrap.className = "flex-element widget-wrapper ac-card-action";
    wrap.setAttribute("data-auto", "flex-element-widget-wrapper");
    wrap.setAttribute("data-widget-type", "link");

    var link = document.createElement("a");
    link.setAttribute("data-display-type", "block");
    link.className = "align-center dmButtonLink dmWidget dmWwr default dmOnlyButton dmDefaultGradient";
    link.setAttribute("file", "false");
    link.href = href;
    link.setAttribute("data-element-type", "dButtonLinkId");
    link.setAttribute("raw_url", href);

    var iconBg = document.createElement("span");
    iconBg.className = "iconBg";
    iconBg.setAttribute("aria-hidden", "true");
    var icon = document.createElement("span");
    icon.className = "icon hasFontIcon icon-star";
    iconBg.appendChild(icon);

    var text = document.createElement("span");
    text.className = "text";
    text.textContent = "Learn More";

    link.appendChild(iconBg);
    link.appendChild(text);
    wrap.appendChild(link);

    return wrap;
  }

  function buildCard(card) {
    var group = document.createElement("div");
    group.className = "flex-element group ac-extra-service-card";
    group.setAttribute("data-auto", "flex-element-group");

    group.appendChild(makeIcon());
    group.appendChild(makeTitle(card.title));
    group.appendChild(makeDescription(card.description));
    group.appendChild(makeButton(card.href));

    return group;
  }

  function applyCards(container) {
    if (!container || container.dataset.acExtraCardsAdded === "1") {
      return;
    }
    if (container.querySelector(".ac-extra-service-card")) {
      container.dataset.acExtraCardsAdded = "1";
      return;
    }

    injectStyles();
    EXTRA_CARDS.forEach(function (card) {
      container.appendChild(buildCard(card));
    });
    container.dataset.acExtraCardsAdded = "1";
  }

  function run() {
    var container = document.getElementById(TARGET_CONTAINER_ID);
    applyCards(container);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  window.addEventListener("load", run);

  var retries = 0;
  var timer = window.setInterval(function () {
    retries += 1;
    run();
    if (retries > 30) {
      window.clearInterval(timer);
    }
  }, 300);
})();
