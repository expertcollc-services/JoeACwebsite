import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { services } from "../site/data/services.mjs";
import { industries } from "../site/data/industries.mjs";
import { locationCities } from "../site/data/locations.mjs";

import {
  BASE_URL,
  esc,
  slugify,
  canonicalFromRelative,
  renderAboutPage,
  renderContactPage,
  renderDetailPage,
  renderHubPage,
  renderNotFoundPage,
  renderReviewsPage
} from "../site/templates.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const generatedUrls = new Set();

async function writePage(relativePath, html) {
  const filePath = path.join(ROOT, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, html, "utf8");
  generatedUrls.add(canonicalFromRelative(relativePath));
}

async function generateHubAndDetails({
  folder,
  hubTitle,
  hubDescription,
  hubEyebrow,
  hubHeading,
  hubIntro,
  items,
  relatedLinks
}) {
  const cards = items.map((item) => ({
    href: `/${folder}/${item.slug}/`,
    title: item.title,
    summary: item.summary,
    keyword: item.keyword
  }));

  await writePage(
    `${folder}/index.html`,
    renderHubPage({
      title: hubTitle,
      description: hubDescription,
      canonicalPath: `/${folder}/`,
      eyebrow: hubEyebrow,
      heading: hubHeading,
      intro: hubIntro,
      cards
    })
  );

  for (const item of items) {
    await writePage(
      `${folder}/${item.slug}/index.html`,
      renderDetailPage({
        title: item.title,
        description: item.summary,
        canonicalPath: `/${folder}/${item.slug}/`,
        eyebrow: hubEyebrow,
        heading: item.title,
        intro: item.summary,
        keyword: item.keyword,
        highlights: item.highlights,
        fit: item.fit,
        heroImage: item.heroImage,
        galleryImages: item.galleryImages,
        mediaEmbedUrl: item.mediaEmbedUrl,
        contentSections: item.contentSections,
        relatedLinks
      })
    );
  }
}

function renderLocationPage(city, tier) {
  const slug = slugify(city);
  const title = `Commercial HVAC Services in ${city}, IL`;

  return {
    relativePath: `locations/${slug}/index.html`,
    html: renderDetailPage({
      title,
      description: `Commercial HVAC, refrigeration, maintenance, and emergency service in ${city}, Illinois.`,
      canonicalPath: `/locations/${slug}/`,
      eyebrow: `Locations | Tier ${tier}`,
      heading: title,
      intro: `Elite Quality HVAC provides commercial HVAC and refrigeration support for businesses in ${city} and nearby Chicago suburbs.`,
      keyword: `commercial hvac ${slug} il`,
      highlights: [
        `Commercial HVAC repair and diagnostics in ${city}`,
        "Refrigeration service for walk-ins and freezers",
        "Preventive maintenance plans for local facilities",
        "Emergency dispatch for urgent failures"
      ],
      fit: [
        `Restaurants and retail operators in ${city}`,
        "Office and medical buildings",
        "Industrial and logistics sites"
      ],
      relatedLinks: [
        { href: "/services/", label: "Commercial HVAC Services" },
        { href: "/#coverage", label: "Service Coverage" },
        { href: "/contact/", label: "Request Service" }
      ]
    })
  };
}

async function writeSitemapAndRobots() {
  const baseUrls = ["/", "/index.html"];
  const allUrls = [...new Set([...baseUrls, ...generatedUrls])].sort();
  const lastMod = new Date().toISOString().split("T")[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map((url) => `  <url><loc>${esc(`${BASE_URL}${url}`)}</loc><lastmod>${lastMod}</lastmod></url>`)
  .join("\n")}
</urlset>
`;

  const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;

  await writeFile(path.join(ROOT, "sitemap.xml"), sitemap, "utf8");
  await writeFile(path.join(ROOT, "robots.txt"), robots, "utf8");
}

async function main() {
  await generateHubAndDetails({
    folder: "services",
    hubTitle: "Commercial HVAC Services in Chicago",
    hubDescription: "Commercial HVAC and refrigeration service options for Chicago and Chicagoland facilities.",
    hubEyebrow: "Services",
    hubHeading: "Commercial HVAC Services",
    hubIntro: "Explore media-rich service pages with photos, scope details, and practical next steps.",
    items: services,
    relatedLinks: [
      { href: "/contact/", label: "Request Service" },
      { href: "/industries/", label: "Industries We Serve" },
      { href: "/locations/", label: "Service Areas" }
    ]
  });

  await generateHubAndDetails({
    folder: "industries",
    hubTitle: "Industry-Specific Commercial HVAC Services",
    hubDescription: "Industry-focused HVAC and refrigeration service support across Chicagoland.",
    hubEyebrow: "Industries",
    hubHeading: "Industries We Serve",
    hubIntro: "See how our team supports different building types and operational needs.",
    items: industries,
    relatedLinks: [
      { href: "/services/", label: "Core Services" },
      { href: "/#coverage", label: "Service Areas" },
      { href: "/contact/", label: "Request Service" }
    ]
  });

  const locationCards = locationCities.map((item) => {
    const slug = slugify(item.city);
    return {
      href: `/locations/${slug}/`,
      title: `Commercial HVAC in ${item.city}, IL`,
      summary: `Commercial HVAC and refrigeration support for facilities in ${item.city}.`,
      keyword: `commercial hvac ${item.city.toLowerCase()} il`
    };
  });

  await writePage(
    "locations/index.html",
    renderHubPage({
      title: "Chicagoland Service Area Pages",
      description: "City-focused commercial HVAC service coverage across Chicago and nearby suburbs.",
      canonicalPath: "/locations/",
      eyebrow: "Locations",
      heading: "Chicago and Chicagoland Service Areas",
      intro: "Find your city and request commercial HVAC support from our local team.",
      cards: locationCards
    })
  );

  for (const location of locationCities) {
    const { relativePath, html } = renderLocationPage(location.city, location.tier);
    await writePage(relativePath, html);
  }

  await writePage("about/index.html", renderAboutPage());
  await writePage("contact/index.html", renderContactPage());
  await writePage("reviews/index.html", renderReviewsPage());
  await writePage("404.html", renderNotFoundPage());

  await writeSitemapAndRobots();
  console.log(`Generated ${generatedUrls.size} architecture URLs.`);
}

main().catch((error) => {
  console.error("Failed to generate site architecture:", error);
  process.exit(1);
});
