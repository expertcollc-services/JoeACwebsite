const API_BASE = "";

function setupMenu() {
  const button = document.getElementById("menu-btn");
  const nav = document.getElementById("site-nav");
  if (!button || !nav) return;

  button.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    });
  });
}

function setupRevealAnimation() {
  const reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("show"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  reveals.forEach((el) => {
    if (!el.classList.contains("show")) observer.observe(el);
  });
}

function animateCounters() {
  const counters = document.querySelectorAll("[data-count]");
  counters.forEach((el) => {
    const target = Number(el.getAttribute("data-count"));
    if (Number.isNaN(target)) return;

    let current = 0;
    const duration = 900;
    const tick = 24;
    const increment = Math.max(1, Math.round(target / (duration / tick)));

    const timer = window.setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        window.clearInterval(timer);
      }
      el.textContent = String(current);
    }, tick);
  });
}

function parseTracking() {
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || params.get("source") || params.get("ref") || "direct",
    medium: params.get("utm_medium") || "unknown",
    campaign: params.get("utm_campaign") || "unknown"
  };
}

function sanitizeText(value, maxLength = 120) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return value.replace(/[^\d]/g, "").length >= 10;
}

function setFormStatus(message, tone = "info", statusId = "form-status") {
  const status = document.getElementById(statusId);
  if (!status) return;
  status.className = `form-status form-status-${tone}`;
  status.textContent = message;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message = body?.errors?.join(" ") || body?.error || "Request failed.";
    throw new Error(message);
  }
  return body;
}

function setButtonLoading(button, isLoading, idleText = "Send Request", loadingText = "Sending...") {
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : idleText;
}

function isLeadPayloadValid(payload, statusId) {
  if (!payload.name || !payload.business || !payload.phone || !payload.email || !payload.serviceType) {
    setFormStatus("Please fill in all required fields.", "error", statusId);
    return false;
  }
  if (!isValidEmail(payload.email)) {
    setFormStatus("Please enter a valid email address.", "error", statusId);
    return false;
  }
  if (!isValidPhone(payload.phone)) {
    setFormStatus("Please enter a valid phone number.", "error", statusId);
    return false;
  }
  return true;
}

async function submitLeadForm({ form, payload, statusId, submitButton, idleText }) {
  if (!isLeadPayloadValid(payload, statusId)) return;
  try {
    setButtonLoading(submitButton, true, idleText, "Sending...");
    setFormStatus("Submitting your request...", "info", statusId);
    await apiRequest("/api/leads", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    form.reset();
    setFormStatus("Request submitted. Our team will contact you shortly.", "success", statusId);
  } catch (_error) {
    setFormStatus(
      "Could not submit right now. Make sure the server is running and try again.",
      "error",
      statusId
    );
  } finally {
    setButtonLoading(submitButton, false, idleText, "Sending...");
  }
}

function setupLeadForm() {
  const form = document.getElementById("lead-form");
  if (!form) return;
  const submitButton = form.querySelector('button[type="submit"]');
  const idleText = "Send Request";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const tracking = parseTracking();
    const payload = {
      name: sanitizeText(data.get("name"), 120),
      business: sanitizeText(data.get("business"), 180),
      phone: sanitizeText(data.get("phone"), 40),
      email: sanitizeText(data.get("email"), 260).toLowerCase(),
      serviceType: sanitizeText(data.get("serviceType"), 120),
      message: sanitizeText(data.get("message"), 2000),
      source: tracking.source,
      medium: tracking.medium,
      campaign: tracking.campaign
    };
    await submitLeadForm({
      form,
      payload,
      statusId: "form-status",
      submitButton,
      idleText
    });
  });
}

function setupAppointmentForm() {
  const form = document.getElementById("appointment-form");
  if (!form) return;
  const submitButton = form.querySelector('button[type="submit"]');
  const idleText = "Book Appointment";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const tracking = parseTracking();
    const preferredDate = sanitizeText(data.get("preferredDate"), 40);
    const preferredTime = sanitizeText(data.get("preferredTime"), 40);
    const serviceLocation = sanitizeText(data.get("serviceLocation"), 180);
    const serviceType = sanitizeText(data.get("serviceType"), 120);
    const details = sanitizeText(data.get("details"), 2000);

    if (!serviceType) {
      setFormStatus("Please select a service type.", "error", "appointment-status");
      return;
    }
    if (!preferredDate || !preferredTime) {
      setFormStatus("Please choose your preferred date and time.", "error", "appointment-status");
      return;
    }

    const messageParts = [
      preferredDate ? `Preferred Date: ${preferredDate}` : "",
      preferredTime ? `Preferred Time: ${preferredTime}` : "",
      serviceLocation ? `Service Location: ${serviceLocation}` : "",
      details ? `Details: ${details}` : ""
    ].filter(Boolean);

    const payload = {
      name: sanitizeText(data.get("name"), 120),
      business: sanitizeText(data.get("business"), 180),
      phone: sanitizeText(data.get("phone"), 40),
      email: sanitizeText(data.get("email"), 260).toLowerCase(),
      serviceType: sanitizeText(`Appointment - ${serviceType}`, 120),
      city: serviceLocation,
      message: sanitizeText(messageParts.join(" | "), 2000),
      source: tracking.source,
      medium: tracking.medium,
      campaign: tracking.campaign
    };

    await submitLeadForm({
      form,
      payload,
      statusId: "appointment-status",
      submitButton,
      idleText
    });
  });
}

function setupInvoiceForm() {
  const form = document.getElementById("invoice-form");
  if (!form) return;
  const submitButton = form.querySelector('button[type="submit"]');
  const idleText = "Request Invoice";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const tracking = parseTracking();
    const invoiceType = sanitizeText(data.get("invoiceType"), 120);
    const invoiceRef = sanitizeText(data.get("invoiceRef"), 120);
    const dueDate = sanitizeText(data.get("dueDate"), 40);
    const amount = sanitizeText(data.get("amount"), 80);
    const notes = sanitizeText(data.get("notes"), 2000);

    if (!invoiceType) {
      setFormStatus("Please choose an invoice request type.", "error", "invoice-status");
      return;
    }

    const messageParts = [
      invoiceType ? `Request Type: ${invoiceType}` : "",
      invoiceRef ? `Invoice/PO Ref: ${invoiceRef}` : "",
      dueDate ? `Requested Due Date: ${dueDate}` : "",
      amount ? `Amount: ${amount}` : "",
      notes ? `Notes: ${notes}` : ""
    ].filter(Boolean);

    const payload = {
      name: sanitizeText(data.get("name"), 120),
      business: sanitizeText(data.get("business"), 180),
      phone: sanitizeText(data.get("phone"), 40),
      email: sanitizeText(data.get("email"), 260).toLowerCase(),
      serviceType: "Invoice Request",
      message: sanitizeText(messageParts.join(" | "), 2000),
      source: tracking.source,
      medium: tracking.medium,
      campaign: tracking.campaign
    };

    await submitLeadForm({
      form,
      payload,
      statusId: "invoice-status",
      submitButton,
      idleText
    });
  });
}

function setYear() {
  const year = document.getElementById("year");
  if (!year) return;
  year.textContent = String(new Date().getFullYear());
}

function dateLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTelHref(phone) {
  const digits = String(phone || "").replace(/[^\d+]/g, "");
  if (!digits) return "+13125550119";
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  return digits;
}

function isSafeHref(url) {
  const value = String(url || "").trim();
  if (!value) return false;
  return value.startsWith("/")
    || value.startsWith("#")
    || value.startsWith("http://")
    || value.startsWith("https://")
    || value.startsWith("mailto:")
    || value.startsWith("tel:");
}

function safeHref(url, fallback = "#") {
  return isSafeHref(url) ? String(url).trim() : fallback;
}

function safeCssUrl(url) {
  return String(url || "").replaceAll('"', "%22");
}

function postTypeOf(post) {
  return sanitizeText(post?.postType || "blog", 40).toLowerCase();
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (!node) return;
  node.textContent = value;
}

function setImage(id, url, fallbackAlt = "") {
  const node = document.getElementById(id);
  if (!(node instanceof HTMLImageElement) || !url) return;
  node.src = url;
  if (fallbackAlt && !node.alt) node.alt = fallbackAlt;
}

function setBackgroundImage(id, imageUrl) {
  const node = document.getElementById(id);
  if (!node || !imageUrl) return;
  node.style.backgroundImage = `url("${safeCssUrl(imageUrl)}")`;
  node.style.backgroundSize = "cover";
  node.style.backgroundPosition = "center";
  node.style.backgroundRepeat = "no-repeat";
}

function setHeroBackground(id, imageUrl) {
  const node = document.getElementById(id);
  if (!node || !imageUrl) return;
  node.style.background = [
    "linear-gradient(145deg, rgba(7, 31, 57, 0.8), rgba(11, 35, 64, 0.55))",
    `url("${safeCssUrl(imageUrl)}") center/cover no-repeat`
  ].join(", ");
}

function setPromoBackground(id, imageUrl) {
  const node = document.getElementById(id);
  if (!node || !imageUrl) return;
  node.style.background = [
    "linear-gradient(120deg, rgba(4, 22, 44, 0.5), rgba(10, 39, 70, 0.18))",
    `url("${safeCssUrl(imageUrl)}") center/cover no-repeat`
  ].join(", ");
}

function applySettings(settings) {
  if (!settings) return;
  const businessName = sanitizeText(settings.businessName || "Elite Quality HVAC", 260);
  const phone = sanitizeText(settings.phone || "(312) 555-0119", 80);
  const email = sanitizeText(settings.email || "service@elitequalityhvac.com", 260);
  const address = sanitizeText(settings.address || "747 S Dixie Ave, Chicago, IL", 260);
  const telHref = `tel:${formatTelHref(phone)}`;
  const mailHref = `mailto:${email}`;

  setText("business-name-header", businessName);
  setText("utility-call-text", `Call ${phone}`);
  setText("contact-address-text", address);
  setText("connect-address-text", address);

  ["utility-call-link", "hero-call-link", "header-call-link", "contact-phone-link", "connect-phone-link"].forEach((id) => {
    const node = document.getElementById(id);
    if (!(node instanceof HTMLAnchorElement)) return;
    node.href = telHref;
    if (id !== "utility-call-link") node.textContent = phone;
  });

  ["contact-email-link", "connect-email-link"].forEach((id) => {
    const node = document.getElementById(id);
    if (!(node instanceof HTMLAnchorElement)) return;
    node.href = mailHref;
    node.textContent = email;
  });

  const logoUrl = sanitizeText(settings.logoUrl || "", 2000);
  if (logoUrl) {
    setImage("business-logo", logoUrl, `${businessName} logo`);
    setImage("connect-logo", logoUrl, `${businessName} logo`);
  }
}

function renderPromotions(promotions) {
  const section = document.getElementById("live-promotions");
  const grid = document.getElementById("promotions-live");
  if (!section || !grid) return;

  if (!Array.isArray(promotions) || promotions.length === 0) {
    section.hidden = true;
    grid.innerHTML = "";
    return;
  }

  const isShopPage = String(document.body?.dataset?.page || "") === "shop";
  const fallbackCtaHref = isShopPage ? "/index.html#appointments" : "#appointments";

  grid.innerHTML = promotions
    .slice(0, 3)
    .map((promotion) => {
      const title = esc(sanitizeText(promotion.title || "Promotion", 260));
      const description = esc(sanitizeText(promotion.description || "", 500));
      const ctaText = esc(sanitizeText(promotion.ctaText || "Book Service", 120));
      const dateRange = `${dateLabel(promotion.startDate)} - ${dateLabel(promotion.endDate)}`;
      const ctaHref = fallbackCtaHref;
      const image = sanitizeText(promotion.bannerImage || "", 2000);
      const mediaMarkup = image
        ? `<div class="promotion-media"><img src="${esc(image)}" alt="${title}"></div>`
        : "";

      return `
        <article class="promotion-card reveal">
          ${mediaMarkup}
          <div class="promotion-copy">
            <p class="promotion-date">${esc(dateRange)}</p>
            <h3>${title}</h3>
            <p>${description || "Limited-time HVAC service offer for commercial customers."}</p>
            <a class="button button-small" href="${esc(ctaHref)}">${ctaText}</a>
          </div>
        </article>
      `;
    })
    .join("");

  section.hidden = false;
}

function serviceCardFallback(index, content) {
  const images = [
    content?.services?.card1Image,
    content?.services?.card2Image,
    content?.services?.card3Image,
    content?.services?.card4Image
  ];
  const cards = [
    {
      name: "Commercial HVAC Repair",
      description: "Rapid diagnostics and repair for rooftop units, controls, and split systems."
    },
    {
      name: "Refrigeration Service",
      description: "Walk-in cooler, freezer, and ice machine troubleshooting and restoration."
    },
    {
      name: "Maintenance Plans",
      description: "Seasonal inspections, filter programs, and recurring performance checks."
    },
    {
      name: "Installation and Replacement",
      description: "Energy-focused system upgrades for long-term performance and lower costs."
    }
  ];

  return {
    ...cards[index],
    imageUrl: images[index] || ""
  };
}

function renderServices(services, content) {
  const container = document.getElementById("services-live");
  if (!container) return;
  const active = Array.isArray(services) ? services.filter((item) => item && item.name) : [];

  const list = [];
  for (let i = 0; i < 4; i += 1) {
    const source = active[i];
    const fallback = serviceCardFallback(i, content);
    const item = source
      ? {
        name: sanitizeText(source.name, 180),
        description: sanitizeText(source.description || fallback.description, 260),
        imageUrl: sanitizeText(source.imageUrl || fallback.imageUrl, 2000),
        pricingNote: sanitizeText(source.pricingNote || "", 180)
      }
      : fallback;
    list.push(item);
  }

  container.innerHTML = list.map((service) => {
    const title = esc(service.name || "Service");
    const description = esc(service.description || "Commercial HVAC support.");
    const pricing = esc(service.pricingNote || "");
    const image = esc(service.imageUrl || "/Resources/images/unsplash-service-1.jpg");
    return `
      <article class="showcase-card reveal">
        <img src="${image}" alt="${title}">
        <div class="showcase-copy">
          <h3>${title}</h3>
          <p>${description}</p>
          ${pricing ? `<span>${pricing}</span>` : ""}
          <a class="button button-small" href="#appointments">Book This Service</a>
        </div>
      </article>
    `;
  }).join("");
}

function renderReviews(reviews) {
  const container = document.getElementById("reviews-live");
  if (!container) return;
  if (!Array.isArray(reviews) || reviews.length === 0) return;

  container.innerHTML = reviews.slice(0, 8).map((review) => {
    const name = esc(sanitizeText(review.reviewerName || "Verified Customer", 120));
    const source = esc(sanitizeText(review.source || "Customer", 120));
    const quote = esc(sanitizeText(review.quote || "Great service and strong communication.", 360));
    const stars = "★".repeat(Math.max(1, Math.min(5, Number(review.rating || 5))));
    const city = sanitizeText(review.city || "", 80);
    const suffix = city ? `${source}, ${esc(city)}` : source;
    return `
      <blockquote class="review-card reveal">
        <p class="review-stars">${stars}</p>
        <p>"${quote}"</p>
        <cite>- ${name}, ${suffix}</cite>
      </blockquote>
    `;
  }).join("");
}

function applySiteContent(content) {
  if (!content) return;
  const hero = content.hero || {};
  const services = content.services || {};
  const expertise = content.expertise || {};
  const promo = content.promo || {};
  const quickLinks = content.quickLinks || {};
  const shop = content.shop || {};
  const blog = content.blog || {};

  if (hero.eyebrow) setText("hero-eyebrow", hero.eyebrow);
  if (hero.title) setText("hero-title", hero.title);
  if (hero.subtitle) setText("hero-subtitle", hero.subtitle);
  if (hero.backgroundImage) setHeroBackground("hero-bg", hero.backgroundImage);

  if (services.heading) setText("services-heading", services.heading);

  if (expertise.heading) setText("expertise-heading", expertise.heading);
  if (expertise.image) setImage("expertise-image", expertise.image, "Commercial HVAC service");

  if (promo.title) setText("promo-title", promo.title);
  if (promo.description) setText("promo-description", promo.description);
  if (promo.backgroundImage) setPromoBackground("promo-bg", promo.backgroundImage);

  if (quickLinks.card1Image) setBackgroundImage("quick-link-1", quickLinks.card1Image);
  if (quickLinks.card2Image) setBackgroundImage("quick-link-2", quickLinks.card2Image);
  if (quickLinks.card3Image) setBackgroundImage("quick-link-3", quickLinks.card3Image);

  if (shop.title) setText("shop-page-title", shop.title);
  if (shop.subtitle) setText("shop-page-subtitle", shop.subtitle);
  if (shop.heroImage) setHeroBackground("shop-hero-bg", shop.heroImage);

  if (blog.title) setText("blog-page-title", blog.title);
  if (blog.subtitle) setText("blog-page-subtitle", blog.subtitle);
  if (blog.heroImage) setHeroBackground("blog-hero-bg", blog.heroImage);
}

function renderShopPosts(posts) {
  const container = document.getElementById("shop-grid");
  if (!container) return;
  const shopPosts = Array.isArray(posts) ? posts.filter((post) => postTypeOf(post) === "shop") : [];
  if (shopPosts.length === 0) {
    container.innerHTML = `
      <article class="shop-card reveal">
        <div class="shop-card-body">
          <span class="shop-chip">No Products</span>
          <h3>No published products yet.</h3>
          <p>Add a published Shop post in Back Office to display products here.</p>
          <a class="button button-small" href="/index.html#contact">Request Service</a>
        </div>
      </article>
    `;
    return;
  }

  const sorted = [...shopPosts].sort((a, b) => {
    const dateA = new Date(a.publishDate || 0).getTime();
    const dateB = new Date(b.publishDate || 0).getTime();
    return dateB - dateA;
  });

  container.innerHTML = sorted.map((post) => {
    const badge = sanitizeText(post.badge || "Shop Offer", 120);
    const title = esc(sanitizeText(post.title || "Post", 260));
    const category = esc(sanitizeText(post.category || "", 120));
    const excerpt = esc(sanitizeText(post.excerpt || post.content || "New offer from Elite Quality HVAC.", 500));
    const mediaUrls = Array.isArray(post.mediaUrls) ? post.mediaUrls.filter(Boolean) : [];
    const image = sanitizeText(post.imageUrl || mediaUrls[0] || "", 2000);
    const price = sanitizeText(post.priceText || "", 120);
    const publishDate = dateLabel(post.publishDate);
    const href = safeHref(post.buyUrl, "/index.html#appointments");
    const media = image
      ? `<img src="${esc(image)}" alt="${title}">`
      : "";

    return `
      <article class="shop-card reveal">
        ${media}
        <div class="shop-card-body">
          <span class="shop-chip">${esc(badge)}</span>
          <h3>${title}</h3>
          <p>${excerpt}</p>
          <p class="shop-meta">
            ${category ? `<span>${category}</span>` : ""}
            ${publishDate ? `<span>${esc(publishDate)}</span>` : ""}
            ${price ? `<span>${esc(price)}</span>` : ""}
          </p>
          <a class="button button-small" href="${esc(href)}">Book Offer</a>
        </div>
      </article>
    `;
  }).join("");
}

function renderBlogPosts(posts) {
  const container = document.getElementById("blog-grid");
  if (!container) return;
  const blogPosts = Array.isArray(posts) ? posts.filter((post) => postTypeOf(post) === "blog") : [];

  if (blogPosts.length === 0) {
    container.innerHTML = `
      <article class="blog-card reveal">
        <div class="blog-card-body">
          <span class="blog-chip">No Articles</span>
          <h3>No published blog posts yet.</h3>
          <p>Add a published Blog post in Back Office to show articles and media here.</p>
        </div>
      </article>
    `;
    return;
  }

  const sorted = [...blogPosts].sort((a, b) => {
    const dateA = new Date(a.publishDate || 0).getTime();
    const dateB = new Date(b.publishDate || 0).getTime();
    return dateB - dateA;
  });

  container.innerHTML = sorted.map((post) => {
    const title = esc(sanitizeText(post.title || "Blog Post", 260));
    const category = esc(sanitizeText(post.category || "HVAC Guide", 120));
    const excerpt = esc(sanitizeText(post.excerpt || "", 500));
    const content = esc(sanitizeText(post.content || "", 3000)).replaceAll("\n", "<br>");
    const mediaUrls = Array.isArray(post.mediaUrls) ? post.mediaUrls.filter(Boolean) : [];
    const heroImage = sanitizeText(post.imageUrl || mediaUrls[0] || "", 2000);
    const gallery = mediaUrls.slice(0, 6).map((url) => `
      <img src="${esc(url)}" alt="${title} media">
    `).join("");
    const publishDate = dateLabel(post.publishDate);

    return `
      <article class="blog-card reveal">
        ${heroImage ? `<img class="blog-cover" src="${esc(heroImage)}" alt="${title}">` : ""}
        <div class="blog-card-body">
          <p class="blog-meta">
            <span class="blog-chip">${category}</span>
            ${publishDate ? `<span>${esc(publishDate)}</span>` : ""}
          </p>
          <h3>${title}</h3>
          ${excerpt ? `<p>${excerpt}</p>` : ""}
          ${content ? `<div class="blog-content">${content}</div>` : ""}
          ${gallery ? `<div class="blog-media-grid">${gallery}</div>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

async function loadPublicSiteData() {
  const path = `${window.location.pathname || "/"}${window.location.search || ""}`;
  return apiRequest(`/api/public-site?path=${encodeURIComponent(path)}`);
}

async function setupPublicData() {
  try {
    const payload = await loadPublicSiteData();
    if (!payload) return;
    applySettings(payload.settings || {});
    applySiteContent(payload.siteContent || {});
    renderPromotions(payload.promotions || []);
    renderServices(payload.services || [], payload.siteContent || {});
    renderReviews(payload.reviews || []);
    renderShopPosts(payload.posts || []);
    renderBlogPosts(payload.posts || []);
  } catch (_error) {
    // Keep static fallbacks if API is unavailable.
  }
}

async function bootstrap() {
  setupMenu();
  setupLeadForm();
  setupAppointmentForm();
  setupInvoiceForm();
  setYear();
  await setupPublicData();
  setupRevealAnimation();
  animateCounters();
}

bootstrap();

