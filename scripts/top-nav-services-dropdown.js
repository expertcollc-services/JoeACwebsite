(function () {
  const MENU = [
    {
      label: "Home",
      href: "/"
    },
    {
      label: "Services",
      href: "/services/",
      children: [
        { label: "HVAC/Refrigeration", href: "/services/commercial-refrigeration/" },
        { label: "Electrical", href: "/services/" },
        { label: "Preventive Maintenance", href: "/services/preventive-maintenance-plans/" }
      ]
    },
    {
      label: "Commercial HVAC",
      href: "/commercial-hvac/"
    },
    {
      label: "Commercial Refrigeration",
      href: "/commercial-refrigeration/"
    },
    {
      label: "Service Area",
      href: "/service-area/",
      children: [
        { label: "Chicago, IL", href: "/chicago--il/" }
      ]
    },
    {
      label: "Contact",
      href: "/contact/"
    }
  ];

  const TARGET_NAV_SELECTORS = [
    "#hcontainer nav.unifiednav",
    "#hamburger-header nav.unifiednav",
    "#hamburger-drawer nav.unifiednav",
    "#mobile-hamburger-header nav.unifiednav",
    "#mobile-hamburger-drawer nav.unifiednav"
  ];

  function currentPath() {
    const p = (window.location.pathname || "/").toLowerCase();
    if (p === "/index.html" || p === "/home/index.html") return "/";
    if (p.endsWith("/index.html")) return p.replace(/index\.html$/, "");
    return p;
  }

  function isActive(item, path) {
    if (!item) return false;
    if (item.href === "/" && path === "/") return true;
    if (item.children && item.children.some((x) => path.startsWith(x.href.toLowerCase()))) return true;
    return path.startsWith(item.href.toLowerCase()) && item.href !== "/";
  }

  function makeItem(item, path) {
    const li = document.createElement("li");
    li.setAttribute("role", "menuitem");
    li.className = "unifiednav__item-wrap";
    li.setAttribute("data-auto", "more-pages");
    li.setAttribute("data-depth", "0");

    if (item.children && item.children.length) {
      li.setAttribute("aria-haspopup", "true");
      li.setAttribute("data-sub-nav-menu", "true");
    }

    const a = document.createElement("a");
    a.href = item.href;
    a.className = "unifiednav__item" + (isActive(item, path) ? " dmNavItemSelected" : "") + (item.children ? " unifiednav__item_has-sub-nav" : "");
    a.setAttribute("raw_url", item.href);

    const span = document.createElement("span");
    span.className = "nav-item-text";
    span.textContent = item.label + " ";

    const icon = document.createElement("span");
    icon.className = "icon " + (item.children ? "icon-angle-down" : "icon-angle-down");
    span.appendChild(icon);

    a.appendChild(span);
    li.appendChild(a);

    if (item.children && item.children.length) {
      const sub = document.createElement("ul");
      sub.setAttribute("role", "menu");
      sub.setAttribute("aria-expanded", "false");
      sub.className = "unifiednav__container unifiednav__container_sub-nav";
      sub.setAttribute("data-depth", "0");
      sub.setAttribute("data-auto", "sub-pages");

      item.children.forEach((child) => {
        const cLi = document.createElement("li");
        cLi.setAttribute("role", "menuitem");
        cLi.className = "unifiednav__item-wrap";
        cLi.setAttribute("data-auto", "more-pages");
        cLi.setAttribute("data-depth", "1");

        const cA = document.createElement("a");
        cA.href = child.href;
        cA.className = "unifiednav__item";
        cA.setAttribute("raw_url", child.href);

        const cText = document.createElement("span");
        cText.className = "nav-item-text";
        cText.textContent = child.label + " ";

        const cIcon = document.createElement("span");
        cIcon.className = "icon icon-angle-right";
        cText.appendChild(cIcon);

        cA.appendChild(cText);
        cLi.appendChild(cA);
        sub.appendChild(cLi);
      });

      li.appendChild(sub);
    }

    return li;
  }

  function applyNav(nav) {
    if (!nav || nav.dataset.acTopMenuPatched === "1") return;

    const rootUl = nav.querySelector(":scope > ul.unifiednav__container[data-auto='navigation-pages']") || nav.querySelector("ul.unifiednav__container[data-auto='navigation-pages']");
    if (!rootUl) return;

    const path = currentPath();
    rootUl.innerHTML = "";
    MENU.forEach((item) => rootUl.appendChild(makeItem(item, path)));

    nav.dataset.acTopMenuPatched = "1";
  }

  function run() {
    const targets = TARGET_NAV_SELECTORS
      .flatMap((selector) => Array.from(document.querySelectorAll(selector)));

    targets.forEach(applyNav);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  window.addEventListener("load", run);

  let retries = 0;
  const timer = window.setInterval(() => {
    retries += 1;
    run();
    if (retries > 30) {
      window.clearInterval(timer);
    }
  }, 300);
})();
