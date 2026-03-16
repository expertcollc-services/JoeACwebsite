(function () {
  "use strict";

  var CARDS = [
    {
      groupId: "bc044402",
      graphicLinkId: "1786263212",
      titleId: "1812700747",
      descriptionId: "1274745051",
      buttonId: "1116230057",
      title: "Commercial Services",
      description: "Explore commercial HVAC, refrigeration, installation, and maintenance support.",
      href: "/services/"
    },
    {
      graphicLinkId: "1730851244",
      titleId: "1086120194",
      descriptionId: "1823530565",
      buttonId: "1302228192",
      title: "Home Services",
      description: "See our residential HVAC repair, replacement, and maintenance options.",
      href: "/home-services/"
    },
    {
      graphicLinkId: "1524080738",
      titleId: "1067769202",
      descriptionId: "1433626682",
      buttonId: "1859571229",
      title: "Service Area",
      description: "View the Chicago-area communities and properties we serve.",
      href: "/service-area/"
    },
    {
      graphicLinkId: "1616264286",
      titleId: "1795211281",
      descriptionId: "1032696055",
      buttonId: "1852592942",
      title: "Contact",
      description: "Request service, ask a question, or call our team directly.",
      href: "/contact/"
    }
  ];

  function unhideNode(id) {
    var node = document.getElementById(id);
    if (!node) {
      return;
    }

    node.removeAttribute("data-anim-extended");
    node.removeAttribute("data-anim-desktop");
    node.style.visibility = "visible";
    node.style.opacity = "1";

    var animatedChildren = node.querySelectorAll("[data-anim-extended], [data-anim-desktop]");
    Array.prototype.forEach.call(animatedChildren, function (child) {
      child.removeAttribute("data-anim-extended");
      child.removeAttribute("data-anim-desktop");
      child.style.visibility = "visible";
      child.style.opacity = "1";
    });
  }

  function setTitle(id, title) {
    var node = document.getElementById(id);
    if (!node) {
      return;
    }

    node.innerHTML = '<h4 class="text-align-center"><span style="display: unset;">' + title + "</span></h4>";
  }

  function setDescription(id, description) {
    var node = document.getElementById(id);
    if (!node) {
      return;
    }

    node.innerHTML = '<p class="m-size-15 text-align-center size-16" style="line-height: 1.5;"><span style="display: unset; color: rgb(45, 46, 50);" class="m-font-size-15 font-size-16">' + description + "</span></p>";
  }

  function setLink(id, href) {
    var node = document.getElementById(id);
    if (!node) {
      return;
    }

    node.href = href;
    node.setAttribute("raw_url", href);
  }

  function ensureDesktopLayout() {
    var style = document.getElementById("homepage-service-card-layout");
    if (style) {
      return;
    }

    style = document.createElement("style");
    style.id = "homepage-service-card-layout";
    style.textContent = "@media (min-width: 1025px) {" +
      "#bc044402, #ed975982, #\\33 a716a79, #\\34 4044aa6 {" +
      "width: calc((100% - 9%) / 4) !important;" +
      "flex: 0 1 calc((100% - 9%) / 4) !important;" +
      "}" +
      "}";
    document.head.appendChild(style);
  }

  function applyCard(card) {
    if (card.groupId) {
      unhideNode(card.groupId);
    }

    setTitle(card.titleId, card.title);
    setDescription(card.descriptionId, card.description);
    setLink(card.buttonId, card.href);
    setLink(card.graphicLinkId, card.href);
  }

  function run() {
    ensureDesktopLayout();
    CARDS.forEach(applyCard);
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
