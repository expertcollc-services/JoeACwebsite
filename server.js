const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const nodemailer = require("nodemailer");

const app = express();
const PORT = Number(process.env.PORT || 8787);
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

const LIMITS = {
  shortText: 120,
  mediumText: 260,
  longText: 2000,
  articleText: 20000
};

const ALLOWED = {
  channelType: new Set(["ads", "listing", "social"]),
  channelStatus: new Set(["active", "paused", "testing"]),
  directoryStatus: new Set(["live", "pending", "needs_update"]),
  campaignObjective: new Set(["calls", "forms", "awareness"]),
  campaignStatus: new Set(["active", "planned", "completed"]),
  leadStatus: new Set(["new", "contacted", "booked", "closed"]),
  promotionStatus: new Set(["draft", "active", "expired"]),
  postStatus: new Set(["draft", "scheduled", "published"]),
  postType: new Set(["blog", "shop"]),
  billingCycle: new Set(["monthly", "quarterly", "annual"]),
  planStatus: new Set(["active", "paused"]),
  memberStatus: new Set(["active", "past_due", "cancelled"]),
  userRole: new Set(["admin", "manager", "tech", "marketing"]),
  userStatus: new Set(["active", "inactive"])
};

const ROLE_PERMISSIONS = {
  admin: new Set([
    "*"
  ]),
  manager: new Set([
    "overview:read",
    "leads:read", "leads:write",
    "channels:read", "channels:write",
    "directories:read", "directories:write",
    "campaigns:read", "campaigns:write",
    "locations:read", "locations:write",
    "servicePages:read", "servicePages:write",
    "promotions:read", "promotions:write",
    "posts:read", "posts:write",
    "reviews:read", "reviews:write",
    "maintenance:read", "maintenance:write",
    "settings:read",
    "users:read"
  ]),
  tech: new Set([
    "overview:read",
    "leads:read", "leads:write",
    "maintenance:read",
    "settings:read"
  ]),
  marketing: new Set([
    "overview:read",
    "leads:read",
    "channels:read", "channels:write",
    "directories:read", "directories:write",
    "campaigns:read", "campaigns:write",
    "locations:read", "locations:write",
    "servicePages:read", "servicePages:write",
    "promotions:read", "promotions:write",
    "posts:read", "posts:write",
    "reviews:read", "reviews:write",
    "settings:read"
  ])
};

function makeId(prefix = "id") {
  if (typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultChannels() {
  return [
    { id: makeId("chn"), name: "Google Ads", type: "ads", status: "active", spend: 2100, clicks: 980, leads: 71, bookings: 33 },
    { id: makeId("chn"), name: "Bing Ads", type: "ads", status: "active", spend: 700, clicks: 290, leads: 19, bookings: 8 },
    { id: makeId("chn"), name: "Google Business Profile", type: "listing", status: "active", spend: 0, clicks: 410, leads: 34, bookings: 17 },
    { id: makeId("chn"), name: "Yelp", type: "listing", status: "testing", spend: 280, clicks: 120, leads: 9, bookings: 4 },
    { id: makeId("chn"), name: "Facebook", type: "social", status: "paused", spend: 350, clicks: 140, leads: 7, bookings: 3 }
  ];
}

function defaultDirectories() {
  const names = [
    "Google Maps",
    "Apple Maps",
    "Bing",
    "Yelp",
    "Yellow Pages",
    "MapQuest",
    "Nextdoor",
    "Foursquare",
    "Citysearch",
    "BBB",
    "Doctor.com",
    "TomTom",
    "Cylex",
    "EZlocal",
    "ShowMeLocal",
    "Manta",
    "USCity",
    "Insider Pages",
    "TripAdvisor",
    "DexKnows",
    "Chamber of Commerce",
    "OpenDi",
    "TuPalo",
    "Healthgrades"
  ];

  return names.map((name, index) => {
    const status = index % 5 === 0 ? "pending" : index % 7 === 0 ? "needs_update" : "live";
    return {
      id: makeId("dir"),
      name,
      status,
      url: "",
      loginNotes: "",
      manualUpdatedAt: "",
      lastSyncedAt: null
    };
  });
}

function defaultCampaigns() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return [
    {
      id: makeId("cmp"),
      name: "Emergency Repair Calls",
      platform: "Google Ads",
      budget: 1600,
      objective: "calls",
      startDate: formatDateInput(start),
      endDate: formatDateInput(end),
      status: "active"
    },
    {
      id: makeId("cmp"),
      name: "Maintenance Plan Promo",
      platform: "Bing Ads",
      budget: 850,
      objective: "forms",
      startDate: formatDateInput(start),
      endDate: formatDateInput(end),
      status: "planned"
    }
  ];
}

function defaultLocations() {
  return [
    {
      id: makeId("loc"),
      city: "Chicago",
      slug: "chicago",
      intro: "Commercial HVAC and refrigeration support across Chicago business districts.",
      servicesSummary: "Repair, maintenance, emergency response, and replacement planning.",
      testimonial: "Fast response and clear communication.",
      imageUrl: "",
      mapNote: "Downtown and surrounding service radius",
      published: true,
      updatedAt: new Date().toISOString()
    },
    {
      id: makeId("loc"),
      city: "Naperville",
      slug: "naperville",
      intro: "Commercial HVAC support for offices, retail, and food operations in Naperville.",
      servicesSummary: "Preventive maintenance and emergency dispatch.",
      testimonial: "",
      imageUrl: "",
      mapNote: "",
      published: true,
      updatedAt: new Date().toISOString()
    },
    {
      id: makeId("loc"),
      city: "Schaumburg",
      slug: "schaumburg",
      intro: "HVAC and refrigeration support for Schaumburg commercial properties.",
      servicesSummary: "Service contracts, repairs, and equipment upgrades.",
      testimonial: "",
      imageUrl: "",
      mapNote: "",
      published: true,
      updatedAt: new Date().toISOString()
    }
  ];
}

function defaultServicePages() {
  return [
    {
      id: makeId("svc"),
      name: "Commercial HVAC Repair",
      slug: "commercial-hvac-repair",
      description: "Rapid diagnostics and repair for commercial systems.",
      pricingNote: "Custom quote based on equipment and access.",
      imageUrl: "",
      active: true,
      updatedAt: new Date().toISOString()
    },
    {
      id: makeId("svc"),
      name: "Commercial Refrigeration",
      slug: "commercial-refrigeration",
      description: "Walk-in cooler, freezer, and ice machine support.",
      pricingNote: "Emergency and scheduled options available.",
      imageUrl: "",
      active: true,
      updatedAt: new Date().toISOString()
    },
    {
      id: makeId("svc"),
      name: "Preventive Maintenance",
      slug: "preventive-maintenance",
      description: "Recurring maintenance plans for uptime and efficiency.",
      pricingNote: "Tiered monthly, quarterly, and annual plans.",
      imageUrl: "",
      active: true,
      updatedAt: new Date().toISOString()
    }
  ];
}

function defaultPromotions() {
  const today = new Date();
  const inThirty = new Date(today);
  inThirty.setDate(inThirty.getDate() + 30);
  return [
    {
      id: makeId("pro"),
      title: "Spring Commercial Tune-Up",
      description: "Seasonal HVAC performance checks for commercial properties.",
      ctaText: "Book Inspection",
      startDate: formatDateInput(today),
      endDate: formatDateInput(inThirty),
      status: "active",
      bannerImage: "",
      pageTargets: ["/services/", "/locations/chicago/"],
      cityTargets: ["Chicago", "Naperville"]
    }
  ];
}

function defaultPosts() {
  return [
    {
      id: makeId("pst"),
      title: "Walk-In Cooler Not Holding Temperature",
      slug: "walk-in-cooler-not-holding-temp",
      category: "Troubleshooting",
      status: "published",
      postType: "blog",
      priceText: "",
      buyUrl: "",
      badge: "Featured",
      publishDate: formatDateInput(new Date()),
      imageUrl: "",
      metaTitle: "Walk-In Cooler Not Holding Temperature | Chicago Guide",
      metaDescription: "Troubleshooting checklist for commercial cooler temperature issues.",
      excerpt: "Common issues to check before product loss escalates.",
      content: "If your walk-in cooler is running warm, check door seals, condenser coil condition, airflow, and thermostat calibration before product loss escalates.",
      mediaUrls: []
    }
  ];
}

function defaultReviews() {
  return [
    {
      id: makeId("rev"),
      reviewerName: "Operations Manager",
      source: "Google",
      rating: 5,
      city: "Chicago",
      service: "Emergency Repair",
      quote: "Great response time and clear updates throughout the job.",
      mediaUrl: "",
      approved: true,
      updatedAt: new Date().toISOString()
    }
  ];
}

function defaultMaintenancePlans() {
  return [
    {
      id: makeId("pln"),
      name: "Essential Care",
      tier: "Silver",
      price: 349,
      billingCycle: "monthly",
      features: ["Quarterly inspection", "Priority scheduling"],
      status: "active",
      updatedAt: new Date().toISOString()
    },
    {
      id: makeId("pln"),
      name: "Performance Care",
      tier: "Gold",
      price: 699,
      billingCycle: "monthly",
      features: ["Monthly checks", "Priority response", "Filter program"],
      status: "active",
      updatedAt: new Date().toISOString()
    }
  ];
}

function defaultMaintenanceMembers(plans) {
  return [
    {
      id: makeId("mem"),
      name: "Jordan Smith",
      email: "ops@acpropertygroup.com",
      company: "AC Property Group",
      planId: plans[0]?.id || "",
      startDate: formatDateInput(new Date()),
      status: "active",
      notes: "Portfolio of 3 sites"
    }
  ];
}

function defaultSettings() {
  return {
    businessName: "Elite Quality HVAC",
    phone: "(312) 555-0119",
    email: "service@elitequalityhvac.com",
    address: "747 S Dixie Ave, Chicago, IL",
    serviceHours: "24/7 emergency dispatch",
    logoUrl: "",
    social: {
      facebook: "",
      instagram: "",
      linkedin: ""
    },
    tracking: {
      googleTagId: "",
      bingTagId: ""
    },
    notifications: {
      enabled: false,
      includeBusinessEmail: true,
      recipients: [],
      subjectPrefix: "New Lead"
    }
  };
}

function defaultSiteContent() {
  return {
    hero: {
      eyebrow: "Welcome to Elite Quality HVAC and Refrigeration",
      title: "Make your building comfort and uptime your competitive edge.",
      subtitle: "We help Chicago businesses stay open with dependable commercial HVAC repair, preventive maintenance, and refrigeration service.",
      backgroundImage: "/Resources/images/unsplash-hero-home.jpg"
    },
    services: {
      heading: "Commercial HVAC, refrigeration, and maintenance built for business uptime.",
      card1Image: "/Resources/images/unsplash-service-1.jpg",
      card2Image: "/Resources/images/unsplash-service-2.jpg",
      card3Image: "/Resources/images/unsplash-service-3.jpg",
      card4Image: "/Resources/images/unsplash-service-4.jpg"
    },
    expertise: {
      heading: "Heating, cooling, and refrigeration expertise for Chicago business owners.",
      image: "/Resources/images/unsplash-expertise.jpg"
    },
    promo: {
      title: "Quality HVAC services for demanding facilities.",
      description: "From urgent breakdowns to planned system upgrades, we deliver options that fit your timeline and budget.",
      backgroundImage: "/Resources/images/unsplash-promo.jpg"
    },
    quickLinks: {
      card1Image: "/Resources/images/unsplash-quick-1.jpg",
      card2Image: "/Resources/images/unsplash-quick-2.jpg",
      card3Image: "/Resources/images/unsplash-quick-3.jpg"
    },
    shop: {
      title: "Shop and Knowledge Center",
      subtitle: "Browse offers and helpful HVAC resources in one place.",
      heroImage: "/Resources/images/unsplash-shop-hero.jpg"
    },
    blog: {
      title: "HVAC Blog and Resources",
      subtitle: "Maintenance guides, troubleshooting, and efficiency best practices.",
      heroImage: "/Resources/images/unsplash-blog-hero.jpg"
    }
  };
}

function defaultUsers() {
  return [
    { id: makeId("usr"), name: "Owner Admin", email: "admin@elitequalityhvac.com", role: "admin", status: "active" },
    { id: makeId("usr"), name: "Ops Manager", email: "manager@elitequalityhvac.com", role: "manager", status: "active" },
    { id: makeId("usr"), name: "Field Tech", email: "tech@elitequalityhvac.com", role: "tech", status: "active" },
    { id: makeId("usr"), name: "Marketing Lead", email: "marketing@elitequalityhvac.com", role: "marketing", status: "active" }
  ];
}

function defaultActivity() {
  return [
    {
      id: makeId("act"),
      createdAt: new Date().toISOString(),
      type: "system",
      module: "overview",
      message: "Back office initialized."
    }
  ];
}

function defaultStore() {
  const maintenancePlans = defaultMaintenancePlans();
  return {
    schemaVersion: 2,
    updatedAt: new Date().toISOString(),
    lastSync: null,
    activeRole: "admin",
    channels: defaultChannels(),
    directories: defaultDirectories(),
    campaigns: defaultCampaigns(),
    leads: [],
    locations: defaultLocations(),
    servicePages: defaultServicePages(),
    promotions: defaultPromotions(),
    posts: defaultPosts(),
    reviews: defaultReviews(),
    maintenancePlans,
    maintenanceMembers: defaultMaintenanceMembers(maintenancePlans),
    settings: defaultSettings(),
    siteContent: defaultSiteContent(),
    users: defaultUsers(),
    activity: defaultActivity()
  };
}

function mergeWithDefaults(store) {
  const fallback = defaultStore();
  const next = {
    ...fallback,
    ...store
  };
  next.channels = Array.isArray(store?.channels) ? store.channels : fallback.channels;
  next.directories = Array.isArray(store?.directories) ? store.directories : fallback.directories;
  next.campaigns = Array.isArray(store?.campaigns) ? store.campaigns : fallback.campaigns;
  next.leads = Array.isArray(store?.leads) ? store.leads : fallback.leads;
  next.locations = Array.isArray(store?.locations) ? store.locations : fallback.locations;
  next.servicePages = Array.isArray(store?.servicePages) ? store.servicePages : fallback.servicePages;
  next.promotions = Array.isArray(store?.promotions) ? store.promotions : fallback.promotions;
  next.posts = Array.isArray(store?.posts) ? store.posts : fallback.posts;
  next.reviews = Array.isArray(store?.reviews) ? store.reviews : fallback.reviews;
  next.maintenancePlans = Array.isArray(store?.maintenancePlans) ? store.maintenancePlans : fallback.maintenancePlans;
  next.maintenanceMembers = Array.isArray(store?.maintenanceMembers) ? store.maintenanceMembers : fallback.maintenanceMembers;
  next.users = Array.isArray(store?.users) ? store.users : fallback.users;
  next.activity = Array.isArray(store?.activity) ? store.activity : fallback.activity;
  next.siteContent = typeof store?.siteContent === "object" && store?.siteContent !== null
    ? {
      ...fallback.siteContent,
      ...store.siteContent,
      hero: {
        ...fallback.siteContent.hero,
        ...(store.siteContent.hero || {})
      },
      services: {
        ...fallback.siteContent.services,
        ...(store.siteContent.services || {})
      },
      expertise: {
        ...fallback.siteContent.expertise,
        ...(store.siteContent.expertise || {})
      },
      promo: {
        ...fallback.siteContent.promo,
        ...(store.siteContent.promo || {})
      },
      quickLinks: {
        ...fallback.siteContent.quickLinks,
        ...(store.siteContent.quickLinks || {})
      },
      shop: {
        ...fallback.siteContent.shop,
        ...(store.siteContent.shop || {})
      },
      blog: {
        ...fallback.siteContent.blog,
        ...(store.siteContent.blog || {})
      }
    }
    : fallback.siteContent;
  next.settings = typeof store?.settings === "object" && store?.settings !== null
    ? {
      ...fallback.settings,
      ...store.settings,
      social: {
        ...fallback.settings.social,
        ...(store.settings.social || {})
      },
      tracking: {
        ...fallback.settings.tracking,
        ...(store.settings.tracking || {})
      },
      notifications: {
        ...fallback.settings.notifications,
        ...(store.settings.notifications || {})
      }
    }
    : fallback.settings;
  next.leads = next.leads.map((lead) => ({
    id: lead.id || makeId("lead"),
    createdAt: lead.createdAt || new Date().toISOString(),
    source: lead.source || "direct",
    medium: lead.medium || "unknown",
    campaign: lead.campaign || "unknown",
    city: lead.city || "",
    name: lead.name || "",
    business: lead.business || "",
    phone: lead.phone || "",
    email: lead.email || "",
    serviceType: lead.serviceType || "",
    message: lead.message || "",
    status: ALLOWED.leadStatus.has(lead.status) ? lead.status : "new",
    notes: lead.notes || ""
  }));
  next.directories = next.directories.map((directory) => ({
    id: directory.id || makeId("dir"),
    name: directory.name || "",
    status: ALLOWED.directoryStatus.has(directory.status) ? directory.status : "pending",
    url: directory.url || "",
    loginNotes: directory.loginNotes || "",
    manualUpdatedAt: directory.manualUpdatedAt || "",
    lastSyncedAt: directory.lastSyncedAt || null
  }));
  if (typeof next.lastSync !== "string" && next.lastSync !== null) next.lastSync = null;
  if (!ALLOWED.userRole.has(next.activeRole)) next.activeRole = "admin";
  if (typeof next.schemaVersion !== "number") next.schemaVersion = 2;
  if (typeof next.updatedAt !== "string") next.updatedAt = new Date().toISOString();
  return next;
}

let store = defaultStore();
let writeQueue = Promise.resolve();

async function persistStore() {
  const payload = JSON.stringify(store, null, 2);
  writeQueue = writeQueue
    .then(() => fs.writeFile(DATA_FILE, payload, "utf8"))
    .catch(() => fs.writeFile(DATA_FILE, payload, "utf8"));
  return writeQueue;
}

async function loadStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    store = mergeWithDefaults(parsed);
  } catch (error) {
    store = defaultStore();
    await persistStore();
  }
}

function touchStore() {
  store.updatedAt = new Date().toISOString();
}

function sanitizeText(input, limit = LIMITS.shortText) {
  const value = String(input ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return value.slice(0, limit);
}

function sanitizeEmail(input) {
  return sanitizeText(input, LIMITS.mediumText).toLowerCase();
}

function sanitizePhone(input) {
  return String(input ?? "")
    .replace(/[^\d+()\-\s.]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, LIMITS.shortText);
}

function sanitizeUrl(input) {
  return sanitizeText(input, LIMITS.longText);
}

function toNumber(input) {
  const value = Number(input);
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  return Math.round(value);
}

function toBoolean(input, fallback = false) {
  if (typeof input === "boolean") return input;
  if (typeof input === "string") {
    const value = input.trim().toLowerCase();
    if (value === "true" || value === "1" || value === "yes") return true;
    if (value === "false" || value === "0" || value === "no") return false;
  }
  return fallback;
}

function toDateString(input) {
  const value = String(input ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  return value;
}

function parseCsvList(input, limit = LIMITS.mediumText) {
  return String(input || "")
    .split(",")
    .map((item) => sanitizeText(item, limit))
    .filter(Boolean)
    .slice(0, 50);
}

function parseUrlList(input) {
  const raw = Array.isArray(input) ? input : String(input || "").split(",");
  const list = [];
  raw.forEach((item) => {
    const value = sanitizeUrl(item || "");
    if (!value) return;
    if (!list.includes(value)) list.push(value);
  });
  return list.slice(0, 30);
}

function parseEmailList(input) {
  const raw = Array.isArray(input)
    ? input
    : String(input || "").split(",");

  const list = [];
  raw.forEach((value) => {
    const email = sanitizeEmail(value);
    if (!email) return;
    if (!list.includes(email)) list.push(email);
  });
  return list.slice(0, 20);
}

function getRole(req) {
  const role = sanitizeText(req.header("x-role") || store.activeRole || "admin", 40);
  if (!ALLOWED.userRole.has(role)) return "admin";
  return role;
}

function can(role, module, action) {
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.admin;
  if (permissions.has("*")) return true;
  return permissions.has(`${module}:${action}`);
}

function requirePermission(module, action = "write") {
  return (req, res, next) => {
    const role = getRole(req);
    if (!can(role, module, action)) {
      return res.status(403).json({
        error: `Role '${role}' cannot ${action} ${module}.`
      });
    }
    return next();
  };
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isAllowed(value, set) {
  return set.has(value);
}

function validateLeadPayload(payload) {
  const lead = {
    id: makeId("lead"),
    createdAt: new Date().toISOString(),
    source: sanitizeText(payload.source || "direct", LIMITS.shortText),
    medium: sanitizeText(payload.medium || "unknown", LIMITS.shortText),
    campaign: sanitizeText(payload.campaign || "unknown", LIMITS.shortText),
    city: sanitizeText(payload.city || "", LIMITS.shortText),
    name: sanitizeText(payload.name, LIMITS.shortText),
    business: sanitizeText(payload.business, LIMITS.mediumText),
    phone: sanitizePhone(payload.phone),
    email: sanitizeEmail(payload.email),
    serviceType: sanitizeText(payload.serviceType, LIMITS.shortText),
    message: sanitizeText(payload.message, LIMITS.longText),
    status: "new",
    notes: ""
  };

  const errors = [];
  if (!lead.name) errors.push("Name is required.");
  if (!lead.business) errors.push("Business name is required.");
  if (!lead.phone) errors.push("Phone is required.");
  if (!lead.email || !isValidEmail(lead.email)) errors.push("Valid email is required.");
  if (!lead.serviceType) errors.push("Service type is required.");

  return { lead, errors };
}

function validateLeadUpdatePayload(payload, original) {
  const next = {
    ...original,
    city: sanitizeText(payload.city ?? original.city, LIMITS.shortText),
    status: sanitizeText(payload.status ?? original.status, LIMITS.shortText),
    notes: sanitizeText(payload.notes ?? original.notes, LIMITS.longText)
  };

  const errors = [];
  if (!isAllowed(next.status, ALLOWED.leadStatus)) errors.push("Invalid lead status.");
  return { lead: next, errors };
}

function validateChannelPayload(payload, existingId = null) {
  const channel = {
    id: existingId || makeId("chn"),
    name: sanitizeText(payload.name, LIMITS.mediumText),
    type: sanitizeText(payload.type, LIMITS.shortText),
    status: sanitizeText(payload.status, LIMITS.shortText),
    spend: toNumber(payload.spend),
    clicks: toNumber(payload.clicks),
    leads: toNumber(payload.leads),
    bookings: toNumber(payload.bookings)
  };

  const errors = [];
  if (!channel.name) errors.push("Channel name is required.");
  if (!isAllowed(channel.type, ALLOWED.channelType)) errors.push("Invalid channel type.");
  if (!isAllowed(channel.status, ALLOWED.channelStatus)) errors.push("Invalid channel status.");
  return { channel, errors };
}

function validateDirectoryPayload(payload, existingId = null) {
  const directory = {
    id: existingId || makeId("dir"),
    name: sanitizeText(payload.name, LIMITS.mediumText),
    status: sanitizeText(payload.status, LIMITS.shortText) || "pending",
    url: sanitizeUrl(payload.url || ""),
    loginNotes: sanitizeText(payload.loginNotes || "", LIMITS.longText),
    manualUpdatedAt: sanitizeText(payload.manualUpdatedAt || "", LIMITS.shortText),
    lastSyncedAt: payload.lastSyncedAt || null
  };
  const errors = [];
  if (!directory.name) errors.push("Directory name is required.");
  if (!isAllowed(directory.status, ALLOWED.directoryStatus)) errors.push("Invalid directory status.");
  return { directory, errors };
}

function validateCampaignPayload(payload, existingId = null) {
  const campaign = {
    id: existingId || makeId("cmp"),
    name: sanitizeText(payload.name, LIMITS.mediumText),
    platform: sanitizeText(payload.platform, LIMITS.mediumText),
    budget: toNumber(payload.budget),
    objective: sanitizeText(payload.objective, LIMITS.shortText),
    startDate: toDateString(payload.startDate),
    endDate: toDateString(payload.endDate),
    status: sanitizeText(payload.status, LIMITS.shortText)
  };
  const errors = [];
  if (!campaign.name) errors.push("Campaign name is required.");
  if (!campaign.platform) errors.push("Campaign platform is required.");
  if (!campaign.startDate) errors.push("Start date is required.");
  if (!campaign.endDate) errors.push("End date is required.");
  if (!isAllowed(campaign.objective, ALLOWED.campaignObjective)) errors.push("Invalid campaign objective.");
  if (!isAllowed(campaign.status, ALLOWED.campaignStatus)) errors.push("Invalid campaign status.");
  if (campaign.startDate && campaign.endDate && campaign.startDate > campaign.endDate) {
    errors.push("Start date must be before or equal to end date.");
  }
  return { campaign, errors };
}

function validateLocationPayload(payload, existingId = null) {
  const city = sanitizeText(payload.city, LIMITS.mediumText);
  const slug = sanitizeText(payload.slug || city.toLowerCase().replace(/[^a-z0-9]+/g, "-"), LIMITS.shortText);
  const location = {
    id: existingId || makeId("loc"),
    city,
    slug,
    intro: sanitizeText(payload.intro || "", LIMITS.longText),
    servicesSummary: sanitizeText(payload.servicesSummary || "", LIMITS.longText),
    testimonial: sanitizeText(payload.testimonial || "", LIMITS.longText),
    imageUrl: sanitizeUrl(payload.imageUrl || ""),
    mapNote: sanitizeText(payload.mapNote || "", LIMITS.mediumText),
    published: toBoolean(payload.published, true),
    updatedAt: new Date().toISOString()
  };
  const errors = [];
  if (!location.city) errors.push("City is required.");
  if (!location.slug) errors.push("Slug is required.");
  return { location, errors };
}

function validateServicePagePayload(payload, existingId = null) {
  const name = sanitizeText(payload.name, LIMITS.mediumText);
  const slug = sanitizeText(payload.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), LIMITS.shortText);
  const servicePage = {
    id: existingId || makeId("svc"),
    name,
    slug,
    description: sanitizeText(payload.description || "", LIMITS.longText),
    pricingNote: sanitizeText(payload.pricingNote || "", LIMITS.mediumText),
    imageUrl: sanitizeUrl(payload.imageUrl || ""),
    active: toBoolean(payload.active, true),
    updatedAt: new Date().toISOString()
  };
  const errors = [];
  if (!servicePage.name) errors.push("Service name is required.");
  if (!servicePage.slug) errors.push("Service slug is required.");
  return { servicePage, errors };
}

function validatePromotionPayload(payload, existingId = null) {
  const promotion = {
    id: existingId || makeId("pro"),
    title: sanitizeText(payload.title, LIMITS.mediumText),
    description: sanitizeText(payload.description || "", LIMITS.longText),
    ctaText: sanitizeText(payload.ctaText || "Learn More", LIMITS.shortText),
    startDate: toDateString(payload.startDate),
    endDate: toDateString(payload.endDate),
    status: sanitizeText(payload.status || "draft", LIMITS.shortText),
    bannerImage: sanitizeUrl(payload.bannerImage || ""),
    pageTargets: Array.isArray(payload.pageTargets) ? payload.pageTargets.map((item) => sanitizeText(item, LIMITS.mediumText)).filter(Boolean) : parseCsvList(payload.pageTargets, LIMITS.mediumText),
    cityTargets: Array.isArray(payload.cityTargets) ? payload.cityTargets.map((item) => sanitizeText(item, LIMITS.shortText)).filter(Boolean) : parseCsvList(payload.cityTargets, LIMITS.shortText)
  };
  const errors = [];
  if (!promotion.title) errors.push("Promotion title is required.");
  if (!promotion.startDate) errors.push("Start date is required.");
  if (!promotion.endDate) errors.push("End date is required.");
  if (!isAllowed(promotion.status, ALLOWED.promotionStatus)) errors.push("Invalid promotion status.");
  if (promotion.startDate && promotion.endDate && promotion.startDate > promotion.endDate) {
    errors.push("Promotion start date must be before end date.");
  }
  return { promotion, errors };
}

function validatePostPayload(payload, existingId = null) {
  const title = sanitizeText(payload.title, LIMITS.mediumText);
  const slug = sanitizeText(payload.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), LIMITS.shortText);
  const post = {
    id: existingId || makeId("pst"),
    title,
    slug,
    category: sanitizeText(payload.category || "General", LIMITS.shortText),
    status: sanitizeText(payload.status || "draft", LIMITS.shortText),
    postType: sanitizeText(payload.postType || "blog", LIMITS.shortText),
    priceText: sanitizeText(payload.priceText || "", LIMITS.shortText),
    buyUrl: sanitizeUrl(payload.buyUrl || ""),
    badge: sanitizeText(payload.badge || "", LIMITS.shortText),
    publishDate: toDateString(payload.publishDate || "") || formatDateInput(new Date()),
    imageUrl: sanitizeUrl(payload.imageUrl || ""),
    metaTitle: sanitizeText(payload.metaTitle || "", LIMITS.mediumText),
    metaDescription: sanitizeText(payload.metaDescription || "", LIMITS.mediumText),
    excerpt: sanitizeText(payload.excerpt || "", LIMITS.longText),
    content: sanitizeText(payload.content || "", LIMITS.articleText),
    mediaUrls: parseUrlList(payload.mediaUrls)
  };
  const errors = [];
  if (!post.title) errors.push("Post title is required.");
  if (!post.slug) errors.push("Post slug is required.");
  if (!isAllowed(post.status, ALLOWED.postStatus)) errors.push("Invalid post status.");
  if (!isAllowed(post.postType, ALLOWED.postType)) errors.push("Invalid post type.");
  return { post, errors };
}

function validateReviewPayload(payload, existingId = null) {
  const review = {
    id: existingId || makeId("rev"),
    reviewerName: sanitizeText(payload.reviewerName, LIMITS.mediumText),
    source: sanitizeText(payload.source || "Unknown", LIMITS.shortText),
    rating: Math.min(5, Math.max(1, toNumber(payload.rating || 5))),
    city: sanitizeText(payload.city || "", LIMITS.shortText),
    service: sanitizeText(payload.service || "", LIMITS.shortText),
    quote: sanitizeText(payload.quote || "", LIMITS.longText),
    mediaUrl: sanitizeUrl(payload.mediaUrl || ""),
    approved: toBoolean(payload.approved, true),
    updatedAt: new Date().toISOString()
  };
  const errors = [];
  if (!review.reviewerName) errors.push("Reviewer name is required.");
  if (!review.quote) errors.push("Review quote is required.");
  return { review, errors };
}

function validateMaintenancePlanPayload(payload, existingId = null) {
  const features = Array.isArray(payload.features)
    ? payload.features.map((item) => sanitizeText(item, LIMITS.mediumText)).filter(Boolean)
    : parseCsvList(payload.features, LIMITS.mediumText);

  const plan = {
    id: existingId || makeId("pln"),
    name: sanitizeText(payload.name, LIMITS.mediumText),
    tier: sanitizeText(payload.tier || "", LIMITS.shortText),
    price: toNumber(payload.price),
    billingCycle: sanitizeText(payload.billingCycle || "monthly", LIMITS.shortText),
    features,
    status: sanitizeText(payload.status || "active", LIMITS.shortText),
    updatedAt: new Date().toISOString()
  };
  const errors = [];
  if (!plan.name) errors.push("Plan name is required.");
  if (!isAllowed(plan.billingCycle, ALLOWED.billingCycle)) errors.push("Invalid billing cycle.");
  if (!isAllowed(plan.status, ALLOWED.planStatus)) errors.push("Invalid plan status.");
  return { plan, errors };
}

function validateMaintenanceMemberPayload(payload, existingId = null) {
  const member = {
    id: existingId || makeId("mem"),
    name: sanitizeText(payload.name, LIMITS.mediumText),
    email: sanitizeEmail(payload.email || ""),
    company: sanitizeText(payload.company || "", LIMITS.mediumText),
    planId: sanitizeText(payload.planId || "", LIMITS.shortText),
    startDate: toDateString(payload.startDate || "") || formatDateInput(new Date()),
    status: sanitizeText(payload.status || "active", LIMITS.shortText),
    notes: sanitizeText(payload.notes || "", LIMITS.longText)
  };
  const errors = [];
  if (!member.name) errors.push("Member name is required.");
  if (!member.planId) errors.push("Member plan is required.");
  if (!isAllowed(member.status, ALLOWED.memberStatus)) errors.push("Invalid member status.");
  if (member.email && !isValidEmail(member.email)) errors.push("Invalid member email.");
  return { member, errors };
}

function validateSettingsPayload(payload) {
  const rawRecipients = Array.isArray(payload?.notifications?.recipients)
    ? payload.notifications.recipients
    : String(payload?.notifications?.recipients || "").split(",");

  const notificationRecipients = [];
  const invalidRecipientEmails = [];
  rawRecipients.forEach((value) => {
    const email = sanitizeEmail(value);
    if (!email) return;
    if (!isValidEmail(email)) {
      invalidRecipientEmails.push(email);
      return;
    }
    if (!notificationRecipients.includes(email)) notificationRecipients.push(email);
  });

  const settings = {
    businessName: sanitizeText(payload.businessName, LIMITS.mediumText),
    phone: sanitizePhone(payload.phone || ""),
    email: sanitizeEmail(payload.email || ""),
    address: sanitizeText(payload.address || "", LIMITS.mediumText),
    serviceHours: sanitizeText(payload.serviceHours || "", LIMITS.mediumText),
    logoUrl: sanitizeUrl(payload.logoUrl || ""),
    social: {
      facebook: sanitizeUrl(payload?.social?.facebook || ""),
      instagram: sanitizeUrl(payload?.social?.instagram || ""),
      linkedin: sanitizeUrl(payload?.social?.linkedin || "")
    },
    tracking: {
      googleTagId: sanitizeText(payload?.tracking?.googleTagId || "", LIMITS.shortText),
      bingTagId: sanitizeText(payload?.tracking?.bingTagId || "", LIMITS.shortText)
    },
    notifications: {
      enabled: toBoolean(payload?.notifications?.enabled, false),
      includeBusinessEmail: toBoolean(payload?.notifications?.includeBusinessEmail, true),
      recipients: notificationRecipients,
      subjectPrefix: sanitizeText(payload?.notifications?.subjectPrefix || "New Lead", LIMITS.shortText)
    }
  };

  const errors = [];
  if (!settings.businessName) errors.push("Business name is required.");
  if (settings.email && !isValidEmail(settings.email)) errors.push("Invalid settings email.");
  if (invalidRecipientEmails.length > 0) {
    errors.push(`Invalid notification email(s): ${invalidRecipientEmails.join(", ")}.`);
  }
  if (!settings.notifications.subjectPrefix) {
    settings.notifications.subjectPrefix = "New Lead";
  }

  if (settings.notifications.enabled) {
    const recipients = new Set(settings.notifications.recipients);
    if (settings.notifications.includeBusinessEmail && settings.email && isValidEmail(settings.email)) {
      recipients.add(settings.email);
    }
    if (recipients.size === 0) {
      errors.push("Add at least one valid notification email or set a valid business email.");
    }
  }

  return { settings, errors };
}

function validateSiteContentPayload(payload) {
  const fallback = defaultSiteContent();
  const source = typeof payload === "object" && payload !== null ? payload : {};
  const siteContent = {
    hero: {
      eyebrow: sanitizeText(source?.hero?.eyebrow || fallback.hero.eyebrow, LIMITS.mediumText),
      title: sanitizeText(source?.hero?.title || fallback.hero.title, LIMITS.longText),
      subtitle: sanitizeText(source?.hero?.subtitle || fallback.hero.subtitle, LIMITS.longText),
      backgroundImage: sanitizeUrl(source?.hero?.backgroundImage || fallback.hero.backgroundImage)
    },
    services: {
      heading: sanitizeText(source?.services?.heading || fallback.services.heading, LIMITS.longText),
      card1Image: sanitizeUrl(source?.services?.card1Image || fallback.services.card1Image),
      card2Image: sanitizeUrl(source?.services?.card2Image || fallback.services.card2Image),
      card3Image: sanitizeUrl(source?.services?.card3Image || fallback.services.card3Image),
      card4Image: sanitizeUrl(source?.services?.card4Image || fallback.services.card4Image)
    },
    expertise: {
      heading: sanitizeText(source?.expertise?.heading || fallback.expertise.heading, LIMITS.longText),
      image: sanitizeUrl(source?.expertise?.image || fallback.expertise.image)
    },
    promo: {
      title: sanitizeText(source?.promo?.title || fallback.promo.title, LIMITS.longText),
      description: sanitizeText(source?.promo?.description || fallback.promo.description, LIMITS.longText),
      backgroundImage: sanitizeUrl(source?.promo?.backgroundImage || fallback.promo.backgroundImage)
    },
    quickLinks: {
      card1Image: sanitizeUrl(source?.quickLinks?.card1Image || fallback.quickLinks.card1Image),
      card2Image: sanitizeUrl(source?.quickLinks?.card2Image || fallback.quickLinks.card2Image),
      card3Image: sanitizeUrl(source?.quickLinks?.card3Image || fallback.quickLinks.card3Image)
    },
    shop: {
      title: sanitizeText(source?.shop?.title || fallback.shop.title, LIMITS.longText),
      subtitle: sanitizeText(source?.shop?.subtitle || fallback.shop.subtitle, LIMITS.longText),
      heroImage: sanitizeUrl(source?.shop?.heroImage || fallback.shop.heroImage)
    },
    blog: {
      title: sanitizeText(source?.blog?.title || fallback.blog.title, LIMITS.longText),
      subtitle: sanitizeText(source?.blog?.subtitle || fallback.blog.subtitle, LIMITS.longText),
      heroImage: sanitizeUrl(source?.blog?.heroImage || fallback.blog.heroImage)
    }
  };

  const errors = [];
  if (!siteContent.hero.title) errors.push("Hero title is required.");
  if (!siteContent.shop.title) errors.push("Shop title is required.");
  return { siteContent, errors };
}

function validateUserPayload(payload, existingId = null) {
  const user = {
    id: existingId || makeId("usr"),
    name: sanitizeText(payload.name, LIMITS.mediumText),
    email: sanitizeEmail(payload.email || ""),
    role: sanitizeText(payload.role || "marketing", LIMITS.shortText),
    status: sanitizeText(payload.status || "active", LIMITS.shortText)
  };
  const errors = [];
  if (!user.name) errors.push("User name is required.");
  if (!user.email || !isValidEmail(user.email)) errors.push("Valid user email is required.");
  if (!isAllowed(user.role, ALLOWED.userRole)) errors.push("Invalid user role.");
  if (!isAllowed(user.status, ALLOWED.userStatus)) errors.push("Invalid user status.");
  return { user, errors };
}

const leadRate = new Map();
const LEAD_WINDOW_MS = 10 * 60 * 1000;
const LEAD_MAX_PER_WINDOW = 15;

function leadRateLimiter(req, res, next) {
  const ip = String(req.ip || req.socket.remoteAddress || "unknown");
  const now = Date.now();
  const bucket = leadRate.get(ip);

  if (!bucket || now > bucket.resetAt) {
    leadRate.set(ip, { count: 1, resetAt: now + LEAD_WINDOW_MS });
    return next();
  }

  if (bucket.count >= LEAD_MAX_PER_WINDOW) {
    const seconds = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(seconds));
    return res.status(429).json({
      error: "Too many lead submissions. Please wait a few minutes and try again."
    });
  }

  bucket.count += 1;
  return next();
}

function safeAsync(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function addActivity(type, module, message, meta = {}) {
  store.activity.unshift({
    id: makeId("act"),
    createdAt: new Date().toISOString(),
    type,
    module,
    message: sanitizeText(message, LIMITS.mediumText),
    meta
  });
  store.activity = store.activity.slice(0, 500);
}

let mailTransporter = null;

function parseEnvBool(input, fallback = false) {
  if (typeof input !== "string") return fallback;
  const value = input.trim().toLowerCase();
  if (value === "true" || value === "1" || value === "yes") return true;
  if (value === "false" || value === "0" || value === "no") return false;
  return fallback;
}

function getLeadNotificationRecipients() {
  const notifications = store.settings?.notifications || {};
  const recipients = parseEmailList(notifications.recipients || []);
  if (notifications.includeBusinessEmail && store.settings?.email && isValidEmail(store.settings.email)) {
    if (!recipients.includes(store.settings.email)) recipients.push(store.settings.email);
  }
  return recipients.slice(0, 20);
}

function getMailTransporter() {
  if (mailTransporter) return mailTransporter;

  const host = sanitizeText(process.env.SMTP_HOST || "", LIMITS.mediumText);
  const portRaw = Number(process.env.SMTP_PORT || 587);
  const port = Number.isFinite(portRaw) && portRaw > 0 ? portRaw : 587;
  const secure = parseEnvBool(process.env.SMTP_SECURE || "", port === 465);
  const user = sanitizeText(process.env.SMTP_USER || "", LIMITS.mediumText);
  const pass = sanitizeText(process.env.SMTP_PASS || "", LIMITS.longText);

  if (!host || !user || !pass) return null;

  mailTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
  return mailTransporter;
}

function resolveNotificationFromEmail() {
  const envFrom = sanitizeEmail(process.env.SMTP_FROM || "");
  if (envFrom && isValidEmail(envFrom)) return envFrom;

  const businessEmail = sanitizeEmail(store.settings?.email || "");
  if (businessEmail && isValidEmail(businessEmail)) return businessEmail;

  const smtpUser = sanitizeEmail(process.env.SMTP_USER || "");
  if (smtpUser && isValidEmail(smtpUser)) return smtpUser;

  return "";
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Notification timeout")), timeoutMs);
    })
  ]);
}

async function sendNotificationEmail({ to, subject, text }) {
  const recipients = parseEmailList(to);
  if (recipients.length === 0) {
    return { status: "skipped", reason: "No recipient emails configured." };
  }

  const transporter = getMailTransporter();
  if (!transporter) {
    return { status: "skipped", reason: "SMTP is not configured on this server." };
  }

  const fromEmail = resolveNotificationFromEmail();
  if (!fromEmail) {
    return { status: "skipped", reason: "Set SMTP_FROM, SMTP_USER, or a valid business email for the sender address." };
  }

  try {
    await withTimeout(
      transporter.sendMail({
        from: fromEmail,
        to: recipients.join(", "),
        subject: sanitizeText(subject || "Lead Notification", LIMITS.mediumText),
        text: sanitizeText(text || "", LIMITS.longText)
      }),
      10000
    );
    return { status: "sent", recipients };
  } catch (error) {
    return { status: "error", reason: sanitizeText(error?.message || "Send failed", LIMITS.mediumText), recipients };
  }
}

async function sendLeadNotification(lead) {
  const notifications = store.settings?.notifications || {};
  if (!notifications.enabled) {
    return { status: "disabled", reason: "Lead notifications are disabled." };
  }

  const recipients = getLeadNotificationRecipients();
  const subjectPrefix = sanitizeText(notifications.subjectPrefix || "New Lead", LIMITS.shortText) || "New Lead";
  const subject = `${subjectPrefix}: ${lead.serviceType || "Service Request"} - ${lead.business || lead.name || "Unknown"}`;
  const text = [
    `New lead received on ${new Date(lead.createdAt || Date.now()).toLocaleString("en-US")}`,
    "",
    `Name: ${lead.name || "-"}`,
    `Business: ${lead.business || "-"}`,
    `Phone: ${lead.phone || "-"}`,
    `Email: ${lead.email || "-"}`,
    `City: ${lead.city || "-"}`,
    `Service: ${lead.serviceType || "-"}`,
    `Source: ${lead.source || "direct"} / ${lead.medium || "unknown"} / ${lead.campaign || "unknown"}`,
    "",
    "Message:",
    lead.message || "-"
  ].join("\n");

  return sendNotificationEmail({
    to: recipients,
    subject,
    text
  });
}

function buildPermissions(role) {
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.admin;
  const modules = [
    "overview",
    "leads",
    "channels",
    "directories",
    "campaigns",
    "locations",
    "servicePages",
    "promotions",
    "posts",
    "reviews",
    "maintenance",
    "settings",
    "users"
  ];
  const next = {};
  modules.forEach((module) => {
    next[module] = {
      read: can(role, module, "read"),
      write: can(role, module, "write")
    };
  });
  if (permissions.has("*")) {
    modules.forEach((module) => {
      next[module] = { read: true, write: true };
    });
  }
  return next;
}

function buildDashboardPayload(role) {
  return {
    meta: {
      schemaVersion: store.schemaVersion,
      updatedAt: store.updatedAt,
      lastSync: store.lastSync,
      activeRole: store.activeRole,
      role,
      permissions: buildPermissions(role)
    },
    channels: deepClone(store.channels),
    directories: deepClone(store.directories),
    campaigns: deepClone(store.campaigns),
    leads: deepClone(store.leads),
    locations: deepClone(store.locations),
    servicePages: deepClone(store.servicePages),
    promotions: deepClone(store.promotions),
    posts: deepClone(store.posts),
    reviews: deepClone(store.reviews),
    maintenancePlans: deepClone(store.maintenancePlans),
    maintenanceMembers: deepClone(store.maintenanceMembers),
    settings: deepClone(store.settings),
    siteContent: deepClone(store.siteContent),
    users: deepClone(store.users),
    activity: deepClone(store.activity)
  };
}

function normalizePathname(input) {
  let value = sanitizeText(input || "/", LIMITS.mediumText).toLowerCase();
  if (!value) return "/";
  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      value = new URL(value).pathname || "/";
    } catch (_error) {
      value = "/";
    }
  }
  const hashIndex = value.indexOf("#");
  if (hashIndex >= 0) value = value.slice(0, hashIndex);
  const queryIndex = value.indexOf("?");
  if (queryIndex >= 0) value = value.slice(0, queryIndex);
  if (!value.startsWith("/")) value = `/${value}`;
  value = value.replace(/\/index\.html$/i, "/");
  if (value.length > 1) value = value.replace(/\/+$/, "");
  return value || "/";
}

function pathMatchWithTarget(pathname, target) {
  const page = normalizePathname(pathname);
  const rawTarget = sanitizeText(target || "", LIMITS.mediumText).toLowerCase();
  if (!rawTarget) return false;
  if (rawTarget === "*" || rawTarget === "all") return true;
  if (rawTarget === "home" || rawTarget === "homepage" || rawTarget === "index") {
    return page === "/";
  }

  const normalizedTarget = normalizePathname(rawTarget);
  if (normalizedTarget === "/") return page === "/";
  return page === normalizedTarget || page.startsWith(`${normalizedTarget}/`);
}

function isDateActiveWindow(startDate, endDate, nowDate = new Date()) {
  const now = formatDateInput(nowDate);
  if (!startDate || !endDate) return false;
  return startDate <= now && now <= endDate;
}

function buildPublicSitePayload(pathname = "/") {
  const normalizedPath = normalizePathname(pathname || "/");
  const settings = {
    businessName: sanitizeText(store.settings?.businessName || "", LIMITS.mediumText),
    phone: sanitizePhone(store.settings?.phone || ""),
    email: sanitizeEmail(store.settings?.email || ""),
    address: sanitizeText(store.settings?.address || "", LIMITS.mediumText),
    serviceHours: sanitizeText(store.settings?.serviceHours || "", LIMITS.mediumText),
    logoUrl: sanitizeUrl(store.settings?.logoUrl || ""),
    social: {
      facebook: sanitizeUrl(store.settings?.social?.facebook || ""),
      instagram: sanitizeUrl(store.settings?.social?.instagram || ""),
      linkedin: sanitizeUrl(store.settings?.social?.linkedin || "")
    }
  };

  const promotions = store.promotions
    .filter((promotion) => String(promotion.status || "") === "active")
    .filter((promotion) => isDateActiveWindow(promotion.startDate, promotion.endDate))
    .filter((promotion) => {
      const targets = Array.isArray(promotion.pageTargets) ? promotion.pageTargets : [];
      if (targets.length === 0) return true;
      return targets.some((target) => pathMatchWithTarget(normalizedPath, target));
    })
    .map((promotion) => ({
      id: promotion.id,
      title: sanitizeText(promotion.title, LIMITS.mediumText),
      description: sanitizeText(promotion.description || "", LIMITS.longText),
      ctaText: sanitizeText(promotion.ctaText || "Learn More", LIMITS.shortText),
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      bannerImage: sanitizeUrl(promotion.bannerImage || ""),
      pageTargets: Array.isArray(promotion.pageTargets) ? promotion.pageTargets.map((value) => sanitizeText(value, LIMITS.mediumText)).filter(Boolean) : [],
      cityTargets: Array.isArray(promotion.cityTargets) ? promotion.cityTargets.map((value) => sanitizeText(value, LIMITS.shortText)).filter(Boolean) : []
    }));

  const today = formatDateInput(new Date());
  const posts = store.posts
    .filter((post) => String(post.status || "") === "published")
    .filter((post) => !post.publishDate || post.publishDate <= today)
    .map((post) => ({
      id: post.id,
      title: sanitizeText(post.title, LIMITS.mediumText),
      slug: sanitizeText(post.slug, LIMITS.shortText),
      category: sanitizeText(post.category || "", LIMITS.shortText),
      postType: sanitizeText(post.postType || "blog", LIMITS.shortText),
      priceText: sanitizeText(post.priceText || "", LIMITS.shortText),
      buyUrl: sanitizeUrl(post.buyUrl || ""),
      badge: sanitizeText(post.badge || "", LIMITS.shortText),
      publishDate: post.publishDate,
      imageUrl: sanitizeUrl(post.imageUrl || ""),
      excerpt: sanitizeText(post.excerpt || "", LIMITS.longText),
      content: sanitizeText(post.content || "", LIMITS.articleText),
      mediaUrls: parseUrlList(post.mediaUrls)
    }));

  const services = store.servicePages
    .filter((servicePage) => Boolean(servicePage.active))
    .map((servicePage) => ({
      id: servicePage.id,
      name: sanitizeText(servicePage.name, LIMITS.mediumText),
      slug: sanitizeText(servicePage.slug, LIMITS.shortText),
      description: sanitizeText(servicePage.description || "", LIMITS.longText),
      pricingNote: sanitizeText(servicePage.pricingNote || "", LIMITS.mediumText),
      imageUrl: sanitizeUrl(servicePage.imageUrl || "")
    }));

  const reviews = store.reviews
    .filter((review) => Boolean(review.approved))
    .map((review) => ({
      id: review.id,
      reviewerName: sanitizeText(review.reviewerName || "", LIMITS.mediumText),
      source: sanitizeText(review.source || "", LIMITS.shortText),
      rating: Math.min(5, Math.max(1, toNumber(review.rating || 5))),
      city: sanitizeText(review.city || "", LIMITS.shortText),
      service: sanitizeText(review.service || "", LIMITS.shortText),
      quote: sanitizeText(review.quote || "", LIMITS.longText),
      mediaUrl: sanitizeUrl(review.mediaUrl || "")
    }));

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      path: normalizedPath
    },
    settings,
    siteContent: deepClone(store.siteContent),
    promotions,
    posts,
    services,
    reviews
  };
}

app.disable("x-powered-by");
app.use(express.json({ limit: "300kb" }));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "script-src 'self' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "form-action 'self'"
    ].join("; ")
  );
  next();
});

const SINGLE_PAGE_REDIRECTS = [
  { prefix: "/services", target: "/#services" },
  { prefix: "/equipment", target: "/#services" },
  { prefix: "/projects", target: "/#reviews" },
  { prefix: "/resources", target: "/#about" },
  { prefix: "/industries", target: "/#services" },
  { prefix: "/locations", target: "/#services" },
  { prefix: "/reviews", target: "/#reviews" },
  { prefix: "/about", target: "/#about" },
  { prefix: "/contact", target: "/#contact" }
];

SINGLE_PAGE_REDIRECTS.forEach((rule) => {
  app.get(new RegExp(`^${rule.prefix}(?:\\/.*)?$`, "i"), (_req, res) => {
    res.redirect(302, rule.target);
  });
});

app.use(express.static(__dirname, { extensions: ["html"], maxAge: 0 }));

app.get("/sitemap.xml", (_req, res) => {
  const baseUrls = [
    { loc: "/", priority: 1.0, changefreq: "monthly" },
    { loc: "/shop.html", priority: 0.8, changefreq: "weekly" },
    { loc: "/blog.html", priority: 0.8, changefreq: "weekly" },
    { loc: "/services/", priority: 0.9, changefreq: "monthly" },
    { loc: "/industries/", priority: 0.8, changefreq: "monthly" },
    { loc: "/locations/", priority: 0.9, changefreq: "monthly" },
    { loc: "/reviews/", priority: 0.7, changefreq: "weekly" },
    { loc: "/about/", priority: 0.7, changefreq: "yearly" },
    { loc: "/contact/", priority: 0.8, changefreq: "yearly" }
  ];

  const lastMod = new Date().toISOString().split("T")[0];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${baseUrls.map(url => `  <url>
    <loc>https://elitequalityhvac.com${url.loc}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.send(sitemap);
});

app.get("/robots.txt", (_req, res) => {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /backoffice.html
Disallow: /data/

Sitemap: https://elitequalityhvac.com/sitemap.xml`;
  
  res.setHeader("Content-Type", "text/plain");
  res.send(robots);
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/dashboard", (req, res) => {
  const role = getRole(req);
  res.json(buildDashboardPayload(role));
});

app.get("/api/public-site", (req, res) => {
  const path = sanitizeText(req.query?.path || "/", LIMITS.mediumText) || "/";
  res.json(buildPublicSitePayload(path));
});

app.patch("/api/session/role", safeAsync(async (req, res) => {
  const requestedRole = sanitizeText(req.body?.role || "", LIMITS.shortText);
  if (!ALLOWED.userRole.has(requestedRole)) {
    return res.status(400).json({ error: "Invalid role selection." });
  }
  store.activeRole = requestedRole;
  touchStore();
  await persistStore();
  return res.json({
    activeRole: store.activeRole
  });
}));

app.post("/api/leads", leadRateLimiter, safeAsync(async (req, res) => {
  const { lead, errors } = validateLeadPayload(req.body || {});
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  store.leads.unshift(lead);
  store.leads = store.leads.slice(0, 1000);
  addActivity("lead", "leads", `New lead from ${lead.business || lead.name}`, {
    leadId: lead.id,
    serviceType: lead.serviceType
  });

  const notification = await sendLeadNotification(lead);
  if (notification.status === "sent") {
    addActivity("lead", "settings", `Lead notification sent (${notification.recipients.length} recipient${notification.recipients.length === 1 ? "" : "s"}).`, {
      leadId: lead.id
    });
  } else if (notification.status === "error") {
    addActivity("system", "settings", `Lead notification failed: ${notification.reason}`, {
      leadId: lead.id
    });
  }

  touchStore();
  await persistStore();
  return res.status(201).json({ lead, notification });
}));

app.patch("/api/leads/:id", requirePermission("leads", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const index = store.leads.findIndex((lead) => lead.id === id);
  if (index < 0) return res.status(404).json({ error: "Lead not found." });

  const current = store.leads[index];
  const { lead, errors } = validateLeadUpdatePayload(req.body || {}, current);
  if (errors.length) return res.status(400).json({ errors });

  store.leads[index] = lead;
  addActivity("lead", "leads", `Lead ${lead.name || lead.id} updated to ${lead.status}`, {
    leadId: lead.id,
    status: lead.status
  });
  touchStore();
  await persistStore();
  return res.json({ lead });
}));

app.delete("/api/leads/:id", requirePermission("leads", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const previous = store.leads.length;
  store.leads = store.leads.filter((lead) => lead.id !== id);
  if (store.leads.length === previous) {
    return res.status(404).json({ error: "Lead not found." });
  }

  addActivity("lead", "leads", `Lead ${id} removed`, { leadId: id });
  touchStore();
  await persistStore();
  return res.status(204).end();
}));

app.post("/api/channels", requirePermission("channels", "write"), safeAsync(async (req, res) => {
  const { channel, errors } = validateChannelPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  store.channels.unshift(channel);
  addActivity("marketing", "channels", `Channel added: ${channel.name}`, { channelId: channel.id });
  touchStore();
  await persistStore();
  return res.status(201).json({ channel });
}));

app.put("/api/channels/:id", requirePermission("channels", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const index = store.channels.findIndex((channel) => channel.id === id);
  if (index < 0) return res.status(404).json({ error: "Channel not found." });

  const { channel, errors } = validateChannelPayload(req.body || {}, id);
  if (errors.length) return res.status(400).json({ errors });

  store.channels[index] = channel;
  addActivity("marketing", "channels", `Channel updated: ${channel.name}`, { channelId: channel.id });
  touchStore();
  await persistStore();
  return res.json({ channel });
}));

app.delete("/api/channels/:id", requirePermission("channels", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const previous = store.channels.length;
  store.channels = store.channels.filter((channel) => channel.id !== id);
  if (store.channels.length === previous) {
    return res.status(404).json({ error: "Channel not found." });
  }

  addActivity("marketing", "channels", `Channel removed: ${id}`, { channelId: id });
  touchStore();
  await persistStore();
  return res.status(204).end();
}));

app.post("/api/directories", requirePermission("directories", "write"), safeAsync(async (req, res) => {
  const { directory, errors } = validateDirectoryPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  directory.lastSyncedAt = null;
  store.directories.unshift(directory);
  addActivity("directory", "directories", `Directory added: ${directory.name}`, { directoryId: directory.id });
  touchStore();
  await persistStore();
  return res.status(201).json({ directory });
}));

app.patch("/api/directories/:id", requirePermission("directories", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const index = store.directories.findIndex((directory) => directory.id === id);
  if (index < 0) return res.status(404).json({ error: "Directory not found." });

  const original = store.directories[index];
  const payload = {
    ...original,
    ...req.body
  };
  const { directory, errors } = validateDirectoryPayload(payload, id);
  if (errors.length) return res.status(400).json({ errors });

  directory.lastSyncedAt = new Date().toISOString();
  store.directories[index] = directory;
  addActivity("directory", "directories", `Directory updated: ${directory.name}`, { directoryId: directory.id });
  touchStore();
  await persistStore();
  return res.json({ directory });
}));

app.delete("/api/directories/:id", requirePermission("directories", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const previous = store.directories.length;
  store.directories = store.directories.filter((directory) => directory.id !== id);
  if (store.directories.length === previous) {
    return res.status(404).json({ error: "Directory not found." });
  }

  addActivity("directory", "directories", `Directory removed: ${id}`, { directoryId: id });
  touchStore();
  await persistStore();
  return res.status(204).end();
}));

app.post("/api/campaigns", requirePermission("campaigns", "write"), safeAsync(async (req, res) => {
  const { campaign, errors } = validateCampaignPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  store.campaigns.unshift(campaign);
  addActivity("marketing", "campaigns", `Campaign added: ${campaign.name}`, { campaignId: campaign.id });
  touchStore();
  await persistStore();
  return res.status(201).json({ campaign });
}));

app.delete("/api/campaigns/:id", requirePermission("campaigns", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const previous = store.campaigns.length;
  store.campaigns = store.campaigns.filter((campaign) => campaign.id !== id);
  if (store.campaigns.length === previous) {
    return res.status(404).json({ error: "Campaign not found." });
  }

  addActivity("marketing", "campaigns", `Campaign removed: ${id}`, { campaignId: id });
  touchStore();
  await persistStore();
  return res.status(204).end();
}));

app.post("/api/sync", requirePermission("directories", "write"), safeAsync(async (_req, res) => {
  const updatedAt = new Date().toISOString();
  let promoted = 0;
  store.directories = store.directories.map((directory) => {
    if (directory.status === "pending" && promoted < 3) {
      promoted += 1;
      return {
        ...directory,
        status: "live",
        lastSyncedAt: updatedAt
      };
    }
    return {
      ...directory,
      lastSyncedAt: updatedAt
    };
  });
  store.lastSync = updatedAt;
  addActivity("directory", "directories", `Directory sync completed. Promoted ${promoted} listings.`, { promoted });
  touchStore();
  await persistStore();
  return res.json({
    lastSync: store.lastSync,
    promoted
  });
}));

app.post("/api/locations", requirePermission("locations", "write"), safeAsync(async (req, res) => {
  const { location, errors } = validateLocationPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  store.locations.unshift(location);
  addActivity("seo", "locations", `Location added: ${location.city}`, { locationId: location.id });
  touchStore();
  await persistStore();
  return res.status(201).json({ location });
}));

app.put("/api/locations/:id", requirePermission("locations", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const index = store.locations.findIndex((location) => location.id === id);
  if (index < 0) return res.status(404).json({ error: "Location not found." });

  const { location, errors } = validateLocationPayload(req.body || {}, id);
  if (errors.length) return res.status(400).json({ errors });

  store.locations[index] = location;
  addActivity("seo", "locations", `Location updated: ${location.city}`, { locationId: location.id });
  touchStore();
  await persistStore();
  return res.json({ location });
}));

app.delete("/api/locations/:id", requirePermission("locations", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const previous = store.locations.length;
  store.locations = store.locations.filter((location) => location.id !== id);
  if (store.locations.length === previous) return res.status(404).json({ error: "Location not found." });

  addActivity("seo", "locations", `Location removed: ${id}`, { locationId: id });
  touchStore();
  await persistStore();
  return res.status(204).end();
}));

app.post("/api/service-pages", requirePermission("servicePages", "write"), safeAsync(async (req, res) => {
  const { servicePage, errors } = validateServicePagePayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  store.servicePages.unshift(servicePage);
  addActivity("seo", "servicePages", `Service page added: ${servicePage.name}`, { servicePageId: servicePage.id });
  touchStore();
  await persistStore();
  return res.status(201).json({ servicePage });
}));

app.put("/api/service-pages/:id", requirePermission("servicePages", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const index = store.servicePages.findIndex((servicePage) => servicePage.id === id);
  if (index < 0) return res.status(404).json({ error: "Service page not found." });

  const { servicePage, errors } = validateServicePagePayload(req.body || {}, id);
  if (errors.length) return res.status(400).json({ errors });

  store.servicePages[index] = servicePage;
  addActivity("seo", "servicePages", `Service page updated: ${servicePage.name}`, { servicePageId: servicePage.id });
  touchStore();
  await persistStore();
  return res.json({ servicePage });
}));

app.delete("/api/service-pages/:id", requirePermission("servicePages", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const previous = store.servicePages.length;
  store.servicePages = store.servicePages.filter((servicePage) => servicePage.id !== id);
  if (store.servicePages.length === previous) return res.status(404).json({ error: "Service page not found." });

  addActivity("seo", "servicePages", `Service page removed: ${id}`, { servicePageId: id });
  touchStore();
  await persistStore();
  return res.status(204).end();
}));

app.post("/api/promotions", requirePermission("promotions", "write"), safeAsync(async (req, res) => {
  const { promotion, errors } = validatePromotionPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  store.promotions.unshift(promotion);
  addActivity("marketing", "promotions", `Promotion added: ${promotion.title}`, { promotionId: promotion.id });
  touchStore();
  await persistStore();
  return res.status(201).json({ promotion });
}));

app.put("/api/promotions/:id", requirePermission("promotions", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const index = store.promotions.findIndex((promotion) => promotion.id === id);
  if (index < 0) return res.status(404).json({ error: "Promotion not found." });

  const { promotion, errors } = validatePromotionPayload(req.body || {}, id);
  if (errors.length) return res.status(400).json({ errors });

  store.promotions[index] = promotion;
  addActivity("marketing", "promotions", `Promotion updated: ${promotion.title}`, { promotionId: promotion.id });
  touchStore();
  await persistStore();
  return res.json({ promotion });
}));

app.delete("/api/promotions/:id", requirePermission("promotions", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const previous = store.promotions.length;
  store.promotions = store.promotions.filter((promotion) => promotion.id !== id);
  if (store.promotions.length === previous) return res.status(404).json({ error: "Promotion not found." });

  addActivity("marketing", "promotions", `Promotion removed: ${id}`, { promotionId: id });
  touchStore();
  await persistStore();
  return res.status(204).end();
}));

app.post("/api/posts", requirePermission("posts", "write"), safeAsync(async (req, res) => {
  const { post, errors } = validatePostPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  store.posts.unshift(post);
  addActivity("content", "posts", `Post added: ${post.title}`, { postId: post.id });
  touchStore();
  await persistStore();
  return res.status(201).json({ post });
}));

app.put("/api/posts/:id", requirePermission("posts", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const index = store.posts.findIndex((post) => post.id === id);
  if (index < 0) return res.status(404).json({ error: "Post not found." });

  const { post, errors } = validatePostPayload(req.body || {}, id);
  if (errors.length) return res.status(400).json({ errors });

  store.posts[index] = post;
  addActivity("content", "posts", `Post updated: ${post.title}`, { postId: post.id });
  touchStore();
  await persistStore();
  return res.json({ post });
}));

app.delete("/api/posts/:id", requirePermission("posts", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const previous = store.posts.length;
  store.posts = store.posts.filter((post) => post.id !== id);
  if (store.posts.length === previous) return res.status(404).json({ error: "Post not found." });

  addActivity("content", "posts", `Post removed: ${id}`, { postId: id });
  touchStore();
  await persistStore();
  return res.status(204).end();
}));

app.post("/api/reviews", requirePermission("reviews", "write"), safeAsync(async (req, res) => {
  const { review, errors } = validateReviewPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  store.reviews.unshift(review);
  addActivity("proof", "reviews", `Review added: ${review.reviewerName}`, { reviewId: review.id });
  touchStore();
  await persistStore();
  return res.status(201).json({ review });
}));

app.put("/api/reviews/:id", requirePermission("reviews", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const index = store.reviews.findIndex((review) => review.id === id);
  if (index < 0) return res.status(404).json({ error: "Review not found." });

  const { review, errors } = validateReviewPayload(req.body || {}, id);
  if (errors.length) return res.status(400).json({ errors });

  store.reviews[index] = review;
  addActivity("proof", "reviews", `Review updated: ${review.reviewerName}`, { reviewId: review.id });
  touchStore();
  await persistStore();
  return res.json({ review });
}));

app.delete("/api/reviews/:id", requirePermission("reviews", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const previous = store.reviews.length;
  store.reviews = store.reviews.filter((review) => review.id !== id);
  if (store.reviews.length === previous) return res.status(404).json({ error: "Review not found." });

  addActivity("proof", "reviews", `Review removed: ${id}`, { reviewId: id });
  touchStore();
  await persistStore();
  return res.status(204).end();
}));

app.post("/api/maintenance/plans", requirePermission("maintenance", "write"), safeAsync(async (req, res) => {
  const { plan, errors } = validateMaintenancePlanPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  store.maintenancePlans.unshift(plan);
  addActivity("maintenance", "maintenance", `Maintenance plan added: ${plan.name}`, { planId: plan.id });
  touchStore();
  await persistStore();
  return res.status(201).json({ plan });
}));

app.put("/api/maintenance/plans/:id", requirePermission("maintenance", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const index = store.maintenancePlans.findIndex((plan) => plan.id === id);
  if (index < 0) return res.status(404).json({ error: "Maintenance plan not found." });

  const { plan, errors } = validateMaintenancePlanPayload(req.body || {}, id);
  if (errors.length) return res.status(400).json({ errors });

  store.maintenancePlans[index] = plan;
  addActivity("maintenance", "maintenance", `Maintenance plan updated: ${plan.name}`, { planId: plan.id });
  touchStore();
  await persistStore();
  return res.json({ plan });
}));

app.delete("/api/maintenance/plans/:id", requirePermission("maintenance", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const previous = store.maintenancePlans.length;
  store.maintenancePlans = store.maintenancePlans.filter((plan) => plan.id !== id);
  store.maintenanceMembers = store.maintenanceMembers.filter((member) => member.planId !== id);
  if (store.maintenancePlans.length === previous) return res.status(404).json({ error: "Maintenance plan not found." });

  addActivity("maintenance", "maintenance", `Maintenance plan removed: ${id}`, { planId: id });
  touchStore();
  await persistStore();
  return res.status(204).end();
}));

app.post("/api/maintenance/members", requirePermission("maintenance", "write"), safeAsync(async (req, res) => {
  const { member, errors } = validateMaintenanceMemberPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  const planExists = store.maintenancePlans.some((plan) => plan.id === member.planId);
  if (!planExists) return res.status(400).json({ error: "Selected plan does not exist." });

  store.maintenanceMembers.unshift(member);
  addActivity("maintenance", "maintenance", `Maintenance member added: ${member.company || member.name}`, { memberId: member.id });
  touchStore();
  await persistStore();
  return res.status(201).json({ member });
}));

app.put("/api/maintenance/members/:id", requirePermission("maintenance", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const index = store.maintenanceMembers.findIndex((member) => member.id === id);
  if (index < 0) return res.status(404).json({ error: "Maintenance member not found." });

  const { member, errors } = validateMaintenanceMemberPayload(req.body || {}, id);
  if (errors.length) return res.status(400).json({ errors });
  const planExists = store.maintenancePlans.some((plan) => plan.id === member.planId);
  if (!planExists) return res.status(400).json({ error: "Selected plan does not exist." });

  store.maintenanceMembers[index] = member;
  addActivity("maintenance", "maintenance", `Maintenance member updated: ${member.company || member.name}`, { memberId: member.id });
  touchStore();
  await persistStore();
  return res.json({ member });
}));

app.delete("/api/maintenance/members/:id", requirePermission("maintenance", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const previous = store.maintenanceMembers.length;
  store.maintenanceMembers = store.maintenanceMembers.filter((member) => member.id !== id);
  if (store.maintenanceMembers.length === previous) return res.status(404).json({ error: "Maintenance member not found." });

  addActivity("maintenance", "maintenance", `Maintenance member removed: ${id}`, { memberId: id });
  touchStore();
  await persistStore();
  return res.status(204).end();
}));

app.put("/api/settings", requirePermission("settings", "write"), safeAsync(async (req, res) => {
  const { settings, errors } = validateSettingsPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  store.settings = settings;
  addActivity("settings", "settings", "Business settings updated.");
  touchStore();
  await persistStore();
  return res.json({ settings });
}));

app.post("/api/settings/notifications/test", requirePermission("settings", "write"), safeAsync(async (_req, res) => {
  const notifications = store.settings?.notifications || {};
  const recipients = getLeadNotificationRecipients();
  if (!notifications.enabled) {
    return res.status(400).json({ error: "Lead notifications are disabled. Enable them in Settings first." });
  }
  if (recipients.length === 0) {
    return res.status(400).json({ error: "No notification recipients configured." });
  }

  const result = await sendNotificationEmail({
    to: recipients,
    subject: `${sanitizeText(notifications.subjectPrefix || "New Lead", LIMITS.shortText) || "New Lead"}: Test Notification`,
    text: "This is a test notification from your HVAC back office. If you received this email, lead notifications are configured correctly."
  });

  if (result.status === "sent") {
    addActivity("settings", "settings", "Lead notification test email sent.");
    touchStore();
    await persistStore();
    return res.json({ ok: true, result });
  }

  return res.status(400).json({
    error: result.reason || "Could not send test notification email.",
    result
  });
}));

app.put("/api/site-content", requirePermission("settings", "write"), safeAsync(async (req, res) => {
  const { siteContent, errors } = validateSiteContentPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  store.siteContent = siteContent;
  addActivity("settings", "settings", "Website content and media updated.");
  touchStore();
  await persistStore();
  return res.json({ siteContent });
}));

app.post("/api/users", requirePermission("users", "write"), safeAsync(async (req, res) => {
  const { user, errors } = validateUserPayload(req.body || {});
  if (errors.length) return res.status(400).json({ errors });

  const duplicateEmail = store.users.some((item) => item.email === user.email);
  if (duplicateEmail) return res.status(400).json({ error: "A user with this email already exists." });

  store.users.unshift(user);
  addActivity("access", "users", `User added: ${user.name} (${user.role})`, { userId: user.id });
  touchStore();
  await persistStore();
  return res.status(201).json({ user });
}));

app.put("/api/users/:id", requirePermission("users", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const index = store.users.findIndex((user) => user.id === id);
  if (index < 0) return res.status(404).json({ error: "User not found." });

  const { user, errors } = validateUserPayload(req.body || {}, id);
  if (errors.length) return res.status(400).json({ errors });

  const duplicateEmail = store.users.some((item) => item.id !== id && item.email === user.email);
  if (duplicateEmail) return res.status(400).json({ error: "A user with this email already exists." });

  store.users[index] = user;
  addActivity("access", "users", `User updated: ${user.name}`, { userId: user.id });
  touchStore();
  await persistStore();
  return res.json({ user });
}));

app.delete("/api/users/:id", requirePermission("users", "write"), safeAsync(async (req, res) => {
  const id = sanitizeText(req.params.id, 120);
  const previous = store.users.length;
  store.users = store.users.filter((user) => user.id !== id);
  if (store.users.length === previous) return res.status(404).json({ error: "User not found." });

  addActivity("access", "users", `User removed: ${id}`, { userId: id });
  touchStore();
  await persistStore();
  return res.status(204).end();
}));

app.get("/api/leads.csv", requirePermission("leads", "read"), (_req, res) => {
  const rows = [];
  rows.push(["date", "name", "business", "phone", "email", "city", "service", "status", "source", "medium", "campaign", "notes"].join(","));
  store.leads.forEach((lead) => {
    rows.push([
      csvCell(lead.createdAt || ""),
      csvCell(lead.name || ""),
      csvCell(lead.business || ""),
      csvCell(lead.phone || ""),
      csvCell(lead.email || ""),
      csvCell(lead.city || ""),
      csvCell(lead.serviceType || ""),
      csvCell(lead.status || ""),
      csvCell(lead.source || ""),
      csvCell(lead.medium || ""),
      csvCell(lead.campaign || ""),
      csvCell(lead.notes || "")
    ].join(","));
  });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=\"hvac-leads-${formatDateInput(new Date())}.csv\"`);
  res.send(rows.join("\n"));
});

app.get("/api/maintenance-members.csv", requirePermission("maintenance", "read"), (_req, res) => {
  const rows = [];
  rows.push(["name", "email", "company", "plan", "status", "startDate", "notes"].join(","));
  store.maintenanceMembers.forEach((member) => {
    const planName = store.maintenancePlans.find((plan) => plan.id === member.planId)?.name || member.planId;
    rows.push([
      csvCell(member.name || ""),
      csvCell(member.email || ""),
      csvCell(member.company || ""),
      csvCell(planName),
      csvCell(member.status || ""),
      csvCell(member.startDate || ""),
      csvCell(member.notes || "")
    ].join(","));
  });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=\"hvac-maintenance-members-${formatDateInput(new Date())}.csv\"`);
  res.send(rows.join("\n"));
});

app.get("/api/export.csv", requirePermission("overview", "read"), (_req, res) => {
  const rows = [];
  rows.push(["section", "name", "type", "status", "spend", "clicks", "leads", "bookings", "notes"].join(","));

  store.channels.forEach((channel) => {
    rows.push([
      "channel",
      csvCell(channel.name),
      csvCell(channel.type),
      csvCell(channel.status),
      Number(channel.spend || 0),
      Number(channel.clicks || 0),
      Number(channel.leads || 0),
      Number(channel.bookings || 0),
      ""
    ].join(","));
  });

  store.directories.forEach((directory) => {
    rows.push([
      "directory",
      csvCell(directory.name),
      "",
      csvCell(directory.status),
      "",
      "",
      "",
      "",
      csvCell(`last synced ${directory.lastSyncedAt || "-"}`)
    ].join(","));
  });

  store.campaigns.forEach((campaign) => {
    rows.push([
      "campaign",
      csvCell(campaign.name),
      csvCell(campaign.platform),
      csvCell(campaign.status),
      Number(campaign.budget || 0),
      "",
      "",
      "",
      csvCell(`${campaign.startDate} to ${campaign.endDate}`)
    ].join(","));
  });

  store.leads.forEach((lead) => {
    rows.push([
      "lead",
      csvCell(lead.name || ""),
      "",
      csvCell(lead.status || "new"),
      "",
      "",
      "",
      "",
      csvCell(`${lead.serviceType || ""} / ${lead.source || "direct"} / ${lead.medium || "unknown"} / ${lead.campaign || "unknown"} / ${lead.phone || ""}`)
    ].join(","));
  });

  store.locations.forEach((location) => {
    rows.push([
      "location",
      csvCell(location.city),
      "",
      csvCell(location.published ? "published" : "draft"),
      "",
      "",
      "",
      "",
      csvCell(location.slug)
    ].join(","));
  });

  store.servicePages.forEach((servicePage) => {
    rows.push([
      "servicePage",
      csvCell(servicePage.name),
      "",
      csvCell(servicePage.active ? "active" : "inactive"),
      "",
      "",
      "",
      "",
      csvCell(servicePage.slug)
    ].join(","));
  });

  store.promotions.forEach((promotion) => {
    rows.push([
      "promotion",
      csvCell(promotion.title),
      "",
      csvCell(promotion.status),
      "",
      "",
      "",
      "",
      csvCell(`${promotion.startDate} to ${promotion.endDate}`)
    ].join(","));
  });

  store.posts.forEach((post) => {
    rows.push([
      "post",
      csvCell(post.title),
      csvCell(post.category),
      csvCell(post.status),
      "",
      "",
      "",
      "",
      csvCell(post.publishDate)
    ].join(","));
  });

  store.reviews.forEach((review) => {
    rows.push([
      "review",
      csvCell(review.reviewerName),
      csvCell(review.source),
      csvCell(review.approved ? "approved" : "pending"),
      review.rating,
      "",
      "",
      "",
      csvCell(review.city)
    ].join(","));
  });

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="hvac-dashboard-export-${formatDateInput(new Date())}.csv"`);
  res.send(rows.join("\n"));
});

app.use("/api", (_req, res) => {
  res.status(404).json({
    error: "API route not found."
  });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "404.html"));
});

app.use((err, _req, res, _next) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Malformed JSON request body."
    });
  }

  if (Number.isInteger(err?.status) && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({
      error: err.message || "Invalid request."
    });
  }

  const errorId = makeId("err");
  console.error(`[${errorId}]`, err);
  res.status(500).json({
    error: "Unexpected server error.",
    errorId
  });
});

function csvCell(value) {
  const safe = String(value ?? "");
  if (safe.includes(",") || safe.includes('"') || safe.includes("\n")) {
    return `"${safe.replaceAll('"', '""')}"`;
  }
  return safe;
}

if (process.env.VERCEL) {
  loadStore().catch((error) => {
    console.error("Failed to initialize store:", error);
  });
  module.exports = app;
} else {
  loadStore()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`AC website server running on http://127.0.0.1:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to initialize store:", error);
      process.exit(1);
    });
}

