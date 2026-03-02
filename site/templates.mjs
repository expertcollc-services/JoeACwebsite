export const BASE_URL = process.env.SITE_BASE_URL || "https://elitequalityhvac.com";

export const NAV_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/services/", label: "Services" },
  { href: "/#coverage", label: "Industries" },
  { href: "/#coverage", label: "Locations" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" }
];

const FOOTER_LINKS = [
  { href: "/services/", label: "Services" },
  { href: "/#coverage", label: "Industries" },
  { href: "/#coverage", label: "Locations" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#contact", label: "Contact" }
];

export function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function canonicalFromRelative(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized === "index.html") return "/";
  if (normalized.endsWith("/index.html")) {
    return `/${normalized.slice(0, -"index.html".length)}`;
  }
  return `/${normalized}`;
}

function navHtml() {
  return NAV_LINKS.map((link) => {
    const className = link.button ? ' class="button button-small"' : "";
    return `<a${className} href="${link.href}">${esc(link.label)}</a>`;
  }).join("");
}

function footerHtml() {
  const links = FOOTER_LINKS.map((link) => `<a href="${link.href}">${esc(link.label)}</a>`).join("");
  return `
    <footer class="site-footer">
      <div class="container footer-shell">
        <p>&copy; <span id="year"></span> Elite Quality HVAC. All rights reserved.</p>
        <div class="footer-links">${links}</div>
      </div>
    </footer>
  `;
}

export function renderPage({ title, description, canonicalPath, eyebrow, heading, intro, body, noHero = false }) {
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} | Elite Quality HVAC</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index,follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonicalUrl)}">
  <link rel="canonical" href="${esc(canonicalUrl)}">
  <meta name="theme-color" content="#0b2340">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Sora:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <script defer src="/app.js"></script>
</head>
<body class="site-body">
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <div class="ambient-grid" aria-hidden="true"></div>

  <header class="site-header">
    <div class="container nav-shell">
      <a class="brand" href="/" aria-label="Elite Quality HVAC Home">
        <span class="brand-mark">EQ</span>
        <span class="brand-text">
          <strong>Elite Quality HVAC</strong>
          <small>Commercial HVAC and Refrigeration</small>
        </span>
      </a>

      <button class="menu-btn" id="menu-btn" aria-expanded="false" aria-controls="site-nav">Menu</button>
      <nav id="site-nav" class="site-nav">${navHtml()}</nav>
    </div>
  </header>

  <main id="main-content">
    ${noHero ? "" : `
    <section class="section inner-hero">
      <div class="container">
        <p class="eyebrow">${esc(eyebrow)}</p>
        <h1>${esc(heading)}</h1>
        <p>${esc(intro)}</p>
        <div class="hero-actions">
          <a href="/contact/" class="button">Request Service</a>
          <a href="tel:+13125550119" class="button button-ghost">Call (312) 555-0119</a>
        </div>
      </div>
    </section>`}
    ${body}
  </main>

  ${footerHtml()}
</body>
</html>`;
}

export function renderHubCards(cards) {
  return cards
    .map(
      (item) => `
    <article class="hub-card reveal">
      <h3><a href="${item.href}">${esc(item.title)}</a></h3>
      <p>${esc(item.summary)}</p>
      <a class="button button-small" href="${item.href}">Open Page</a>
    </article>`
    )
    .join("");
}

export function renderHubPage({ title, description, canonicalPath, eyebrow, heading, intro, cards }) {
  return renderPage({
    title,
    description,
    canonicalPath,
    eyebrow,
    heading,
    intro,
    body: `
      <section class="section">
        <div class="container">
          <div class="hub-grid">
            ${renderHubCards(cards)}
          </div>
        </div>
      </section>
      <section class="section cta-band">
        <div class="container cta-band-shell">
          <div>
            <p class="eyebrow">Commercial HVAC Team</p>
            <h2>Need priority support for your building?</h2>
            <p>Request service and we will coordinate with your facility team quickly.</p>
          </div>
          <div class="hero-actions">
            <a class="button" href="/contact/">Request Service</a>
            <a class="button button-ghost" href="tel:+13125550119">Call (312) 555-0119</a>
          </div>
        </div>
      </section>
    `
  });
}

export function renderDetailPage({
  title,
  description,
  canonicalPath,
  eyebrow,
  heading,
  intro,
  keyword,
  highlights,
  fit,
  relatedLinks,
  heroImage,
  galleryImages = [],
  mediaEmbedUrl = "",
  contentSections = []
}) {
  const related = relatedLinks
    .map((link) => `<li><a href="${link.href}">${esc(link.label)}</a></li>`)
    .join("");

  const bulletsA = highlights.map((item) => `<li>${esc(item)}</li>`).join("");
  const bulletsB = fit.map((item) => `<li>${esc(item)}</li>`).join("");
  const heroMediaHtml = heroImage?.src
    ? `
      <figure class="detail-hero-media">
        <img src="${esc(heroImage.src)}" alt="${esc(heroImage.alt || heading)}" loading="lazy">
      </figure>`
    : "";

  const embeddedMediaHtml = mediaEmbedUrl
    ? `
      <div class="detail-media-frame">
        <iframe
          src="${esc(mediaEmbedUrl)}"
          title="${esc(`${heading} video`)}"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>`
    : "";

  const galleryHtml = Array.isArray(galleryImages) && galleryImages.length
    ? `
      <section class="section">
        <div class="container">
          <div class="section-heading">
            <p class="eyebrow">Service Media</p>
            <h2>Images and Visual Proof</h2>
          </div>
          <div class="detail-gallery-grid">
            ${galleryImages
    .map((item) => `
              <figure class="detail-gallery-card reveal">
                <img src="${esc(item.src)}" alt="${esc(item.alt || heading)}" loading="lazy">
                ${item.caption ? `<figcaption>${esc(item.caption)}</figcaption>` : ""}
              </figure>
            `)
    .join("")}
          </div>
        </div>
      </section>`
    : "";

  const contentBlocksHtml = Array.isArray(contentSections) && contentSections.length
    ? `
      <section class="section">
        <div class="container detail-content-grid">
          ${contentSections.map((section) => `
            <article class="content-prose reveal">
              <h3>${esc(section.heading || "Service Detail")}</h3>
              <p>${esc(section.body || "")}</p>
            </article>
          `).join("")}
        </div>
      </section>`
    : "";

  return renderPage({
    title,
    description,
    canonicalPath,
    eyebrow,
    heading,
    intro,
    body: `
      <section class="section">
        <div class="container detail-media-stack">
          ${heroMediaHtml}
          ${embeddedMediaHtml}
        </div>
      </section>
      <section class="section">
        <div class="container inner-grid">
          <article class="content-prose">
            <h2>Scope of Work</h2>
            <ul>${bulletsA}</ul>
            <h2>Best Fit For</h2>
            <ul>${bulletsB}</ul>
            <h2>Next Step</h2>
            <p>Share your building type, equipment issue, and preferred schedule. We provide a clear plan and timeline.</p>
          </article>
          <aside class="quick-facts">
            <h3>Chicago Commercial Service</h3>
            <p>Available for scheduled and emergency response across Chicago and surrounding suburbs.</p>
            <a class="button button-small" href="/contact/">Request Service</a>
            <h4>Related Pages</h4>
            <ul>${related}</ul>
          </aside>
        </div>
      </section>
      ${galleryHtml}
      ${contentBlocksHtml}
    `
  });
}

export function renderContactPage() {
  return renderPage({
    title: "Contact Commercial HVAC Team",
    description: "Request commercial HVAC and refrigeration service in Chicago and Chicagoland.",
    canonicalPath: "/contact/",
    eyebrow: "Contact",
    heading: "Request Service in Chicago and Chicagoland",
    intro: "Use the form below or call our dispatch line. We will follow up quickly to schedule service.",
    body: `
      <section class="section">
        <div class="container contact-layout">
          <div class="contact-copy reveal">
            <p class="eyebrow">Contact Details</p>
            <h2>Commercial HVAC and Refrigeration Support</h2>
            <ul>
              <li>Phone: <a href="tel:+13125550119">(312) 555-0119</a></li>
              <li>Email: <a href="mailto:service@elitequalityhvac.com">service@elitequalityhvac.com</a></li>
              <li>Address: 747 S Dixie Ave, Chicago, IL</li>
              <li>Hours: 24/7 emergency dispatch, scheduled service 7am-6pm</li>
            </ul>
          </div>
          <form class="lead-form reveal" id="lead-form" novalidate>
            <div class="form-row">
              <label for="lead-name">Full Name</label>
              <input id="lead-name" name="name" required autocomplete="name" maxlength="120" placeholder="John Smith">
            </div>
            <div class="form-row">
              <label for="lead-business">Business Name</label>
              <input id="lead-business" name="business" required autocomplete="organization" maxlength="180" placeholder="Your company">
            </div>
            <div class="form-row split">
              <div>
                <label for="lead-phone">Phone</label>
                <input id="lead-phone" name="phone" type="tel" required autocomplete="tel" maxlength="40" placeholder="(312) 555-0188">
              </div>
              <div>
                <label for="lead-email">Email</label>
                <input id="lead-email" name="email" type="email" required autocomplete="email" maxlength="260" placeholder="name@email.com">
              </div>
            </div>
            <div class="form-row">
              <label for="lead-service">Service Type</label>
              <select id="lead-service" name="serviceType" required>
                <option value="">Select one</option>
                <option>Emergency Repair</option>
                <option>Maintenance Plan</option>
                <option>New Installation</option>
                <option>Refrigeration Service</option>
              </select>
            </div>
            <div class="form-row">
              <label for="lead-message">Project Details</label>
              <textarea id="lead-message" name="message" rows="4" maxlength="2000" placeholder="Tell us about the issue or project"></textarea>
            </div>
            <button type="submit" class="button">Send Request</button>
            <p class="form-status" id="form-status" role="status" aria-live="polite">Ready</p>
          </form>
        </div>
      </section>
    `
  });
}

export function renderAboutPage() {
  return renderPage({
    title: "About Elite Quality HVAC",
    description: "Commercial HVAC and refrigeration specialists serving Chicago and Chicagoland businesses.",
    canonicalPath: "/about/",
    eyebrow: "About",
    heading: "Built for Chicago Commercial HVAC Demands",
    intro: "We focus on uptime, transparent communication, and dependable execution for business-critical systems.",
    body: `
      <section class="section">
        <div class="container inner-grid">
          <article class="content-prose">
            <h2>Company Focus</h2>
            <p>Elite Quality HVAC supports commercial facilities with repair, refrigeration, preventive maintenance, and replacement planning. We work with owners, facility managers, and operations teams that need clear results.</p>
            <h2>Standards and Compliance</h2>
            <ul>
              <li>Licensed and insured commercial HVAC operations</li>
              <li>EPA-certified technicians and refrigerant handling protocol</li>
              <li>Documented service reporting and follow-up recommendations</li>
              <li>Safety-first field procedures for occupied properties</li>
            </ul>
            <h2>Commercial Experience</h2>
            <p>Our team supports restaurants, retail, healthcare offices, schools, warehouses, and multi-site portfolios across Chicagoland.</p>
          </article>
          <aside class="quick-facts">
            <h3>Why Businesses Choose Us</h3>
            <ul>
              <li>Fast emergency response for critical failures</li>
              <li>Preventive plans that reduce avoidable downtime</li>
              <li>Strong communication with operations teams</li>
              <li>Planning support for replacement projects</li>
            </ul>
            <a class="button button-small" href="/contact/">Request Service</a>
          </aside>
        </div>
      </section>
    `
  });
}

export function renderReviewsPage() {
  return renderPage({
    title: "Commercial HVAC Reviews and Testimonials",
    description: "Customer feedback for Elite Quality HVAC commercial services in Chicago.",
    canonicalPath: "/reviews/",
    eyebrow: "Reviews",
    heading: "Proof from Commercial Clients",
    intro: "Feedback from facility teams and business operators across Chicagoland.",
    body: `
      <section class="section">
        <div class="container review-grid">
          <blockquote class="review-card reveal">
            <p>"They stabilized our refrigeration issue before lunch rush and gave us a clear follow-up plan."</p>
            <cite>- Operations Lead, Chicago Restaurant Group</cite>
          </blockquote>
          <blockquote class="review-card reveal">
            <p>"Their maintenance program made our service schedule predictable and cut emergency calls."</p>
            <cite>- Facility Manager, Medical Office Portfolio</cite>
          </blockquote>
          <blockquote class="review-card reveal">
            <p>"Strong communication, clean reporting, and reliable field execution."</p>
            <cite>- Property Manager, Multi-Tenant Office Site</cite>
          </blockquote>
        </div>
      </section>
      <section class="section">
        <div class="container panel">
          <h3>Need Service for Your Facility?</h3>
          <p>Contact our commercial HVAC team for repair, maintenance, refrigeration, and installation support.</p>
          <a class="button button-small" href="/contact/">Request Service</a>
        </div>
      </section>
    `
  });
}

export function renderNotFoundPage() {
  return renderPage({
    title: "Page Not Found",
    description: "The page you requested could not be found.",
    canonicalPath: "/404.html",
    eyebrow: "404",
    heading: "Page Not Found",
    intro: "Try one of the core sections below.",
    body: `
      <section class="section">
        <div class="container">
          <div class="hub-grid">
            ${renderHubCards([
              { href: "/", title: "Homepage", summary: "Commercial HVAC overview and fast ways to request service." },
              { href: "/services/", title: "Services", summary: "Repair, refrigeration, maintenance, and installation support." },
              { href: "/locations/", title: "Locations", summary: "Areas we serve across Chicago and Chicagoland." },
              { href: "/contact/", title: "Contact", summary: "Book service and talk with dispatch quickly." }
            ])}
          </div>
        </div>
      </section>
    `
  });
}
