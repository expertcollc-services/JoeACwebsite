(function () {
  "use strict";

  var TARGET_CONTAINER_ID = "6c385d1b";
  var DESIRED_CARD_TOTAL = 5;
  var INJECTED_CLASS = "ac-extra-service-card";

  var EXTRA_CARDS = [
    {
      title: "Home Services",
      description: "Explore our HVAC and refrigeration services for your business.",
      href: "/commercial-hvac/"
    },
    {
      title: "Reviews",
      description: "Read what local customers say about our team and results.",
      href: "/home/"
    }
  ];

  function injectStyles() {
    if (document.getElementById("ac-extra-service-cards-style")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "ac-extra-service-cards-style";
    style.textContent = [
      "[id='6c385d1b']{display:flex!important;flex-wrap:nowrap!important;justify-content:flex-start!important;gap:16px!important;overflow:visible!important;}",
      "[id='6c385d1b'] > .flex-element.group{width:calc((100% - 64px)/5)!important;max-width:calc((100% - 64px)/5)!important;flex:0 0 calc((100% - 64px)/5)!important;box-sizing:border-box!important;margin:0!important;min-height:240px!important;align-items:center!important;}",
      "[id='6c385d1b'] > .flex-element.group [data-widget-type='link']{width:100%!important;max-width:100%!important;height:50px!important;}",
      "[id='6c385d1b'] > .flex-element.group a.dmButtonLink{width:100%!important;}",
      "[id='6c385d1b'] > .flex-element.group .text{white-space:nowrap;}",
      "[id='6c385d1b'] .ac-extra-service-card{min-height:240px;column-gap:4%;row-gap:16px;background-color:var(--color_3,#fff);border-radius:5px;box-shadow:#676f72 3px 0 11px 0;justify-content:space-between;align-items:center;min-width:4%;padding:25px;display:flex;flex-direction:column;}",
      "[id='6c385d1b'] .ac-extra-service-card .ac-card-title,[id='6c385d1b'] .ac-extra-service-card .ac-card-description{width:100%;}",
      "[id='6c385d1b'] .ac-extra-service-card .ac-card-title h4{margin:0;}",
      "[id='6c385d1b'] .ac-extra-service-card .ac-card-description p{margin:0;line-height:1.5;}",
      "[id='6c385d1b'] .ac-extra-service-icon{width:70px;height:70px;border:2px solid var(--color_1,#e50707);border-radius:999px;display:inline-flex;align-items:center;justify-content:center;color:var(--color_1,#e50707);}",
      "[id='6c385d1b'] .ac-extra-service-icon .icon{font-size:28px;}",
      "@media (min-width:767px) and (max-width:1024px){[id='6c385d1b']{flex-wrap:wrap!important;gap:16px!important;}[id='6c385d1b'] > .flex-element.group{width:calc((100% - 16px)/2)!important;max-width:calc((100% - 16px)/2)!important;flex:0 0 calc((100% - 16px)/2)!important;}}",
      "@media (max-width:767px){[id='6c385d1b']{flex-wrap:wrap!important;row-gap:25px!important;}[id='6c385d1b'] > .flex-element.group{width:100%!important;max-width:100%!important;flex:0 0 100%!important;}}",
      "@media (min-width:468px) and (max-width:767px){[id='6c385d1b']{gap:16px!important;}[id='6c385d1b'] > .flex-element.group{width:calc((100% - 16px)/2)!important;max-width:calc((100% - 16px)/2)!important;flex:0 0 calc((100% - 16px)/2)!important;}}"
    ].join("");
    document.head.appendChild(style);
  }

  function getCards(container) {
    if (!container) {
      return [];
    }

    return Array.prototype.slice.call(container.children).filter(function (child) {
      return child.classList && child.classList.contains("group") && child.querySelector("a.dmButtonLink");
    });
  }

  function removeInjectedCards(container) {
    getCards(container).forEach(function (card) {
      if (card.classList.contains(INJECTED_CLASS)) {
        card.remove();
      }
    });
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
    wrap.className = "flex-element widget-wrapper";
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
    group.className = "flex-element group " + INJECTED_CLASS;
    group.setAttribute("data-auto", "flex-element-group");

    group.appendChild(makeIcon());
    group.appendChild(makeTitle(card.title));
    group.appendChild(makeDescription(card.description));
    group.appendChild(makeButton(card.href));

    return group;
  }

  function applyCards(container) {
    if (!container) {
      return;
    }

    injectStyles();
    removeInjectedCards(container);

    var existing = getCards(container);
    var needed = Math.max(0, DESIRED_CARD_TOTAL - existing.length);

    for (var i = 0; i < needed && i < EXTRA_CARDS.length; i += 1) {
      container.appendChild(buildCard(EXTRA_CARDS[i]));
    }

    var current = getCards(container);
    if (current.length > DESIRED_CARD_TOTAL) {
      var injected = current.filter(function (card) {
        return card.classList.contains(INJECTED_CLASS);
      });
      var excess = current.length - DESIRED_CARD_TOTAL;

      for (var j = injected.length - 1; j >= 0 && excess > 0; j -= 1) {
        injected[j].remove();
        excess -= 1;
      }
    }
  }

  function run() {
    applyCards(document.getElementById(TARGET_CONTAINER_ID));
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
