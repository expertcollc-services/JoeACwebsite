
const API_BASE = "";

const state = {
  currentRole: "admin",
  permissions: {},
  channels: [],
  directories: [],
  campaigns: [],
  leads: [],
  locations: [],
  servicePages: [],
  promotions: [],
  posts: [],
  reviews: [],
  maintenancePlans: [],
  maintenanceMembers: [],
  settings: {},
  siteContent: {},
  users: [],
  activity: [],
  meta: {
    lastSync: null,
    activeRole: "admin"
  }
};

let trendChart;
let statusChart;
let trafficSourceChart;

const INTEGRATION_CATALOG = [
  { key: "google_ads", name: "Google Ads", kind: "ads", module: "channels", reference: "Google Ads", openUrl: "https://ads.google.com/" },
  { key: "bing_ads", name: "Bing Ads", kind: "ads", module: "channels", reference: "Bing Ads", openUrl: "https://ads.microsoft.com/" },
  { key: "yahoo_ads", name: "Yahoo Ads", kind: "ads", module: "channels", reference: "Yahoo Ads", openUrl: "https://ads.yahoo.com/" },
  { key: "facebook_ads", name: "Facebook Ads", kind: "ads", module: "channels", reference: "Facebook Ads", openUrl: "https://www.facebook.com/business/ads" },
  { key: "google_maps", name: "Google Maps", kind: "directory", module: "directories", reference: "Google Maps", openUrl: "https://www.google.com/business/" },
  { key: "apple_maps", name: "Apple Maps", kind: "directory", module: "directories", reference: "Apple Maps", openUrl: "https://register.apple.com/placesonmaps/" },
  { key: "bing_places", name: "Bing Places", kind: "directory", module: "directories", reference: "Bing", openUrl: "https://www.bingplaces.com/" },
  { key: "yelp", name: "Yelp", kind: "directory", module: "directories", reference: "Yelp", openUrl: "https://biz.yelp.com/" },
  { key: "bbb", name: "BBB", kind: "directory", module: "directories", reference: "BBB", openUrl: "https://www.bbb.org/" },
  { key: "yellow_pages", name: "Yellow Pages", kind: "directory", module: "directories", reference: "Yellow Pages", openUrl: "https://www.yellowpages.com/" },
  { key: "mapquest", name: "MapQuest", kind: "directory", module: "directories", reference: "MapQuest", openUrl: "https://listings.mapquest.com/" },
  { key: "nextdoor", name: "Nextdoor", kind: "directory", module: "directories", reference: "Nextdoor", openUrl: "https://business.nextdoor.com/" },
  { key: "foursquare", name: "Foursquare", kind: "directory", module: "directories", reference: "Foursquare", openUrl: "https://business.foursquare.com/" },
  { key: "cylex", name: "Cylex", kind: "directory", module: "directories", reference: "Cylex", openUrl: "https://www.cylex.us.com/" },
  { key: "ezlocal", name: "EZlocal", kind: "directory", module: "directories", reference: "EZlocal", openUrl: "https://www.ezlocal.com/" },
  { key: "manta", name: "Manta", kind: "directory", module: "directories", reference: "Manta", openUrl: "https://www.manta.com/" },
  { key: "citysearch", name: "Citysearch", kind: "directory", module: "directories", reference: "Citysearch", openUrl: "https://www.citysearch.com/" },
  { key: "chamber", name: "Chamber of Commerce", kind: "directory", module: "directories", reference: "Chamber of Commerce", openUrl: "https://www.chamberofcommerce.com/" },
  { key: "tomtom", name: "TomTom", kind: "directory", module: "directories", reference: "TomTom", openUrl: "https://www.tomtom.com/mapshare/tools/" },
  { key: "dexknows", name: "DexKnows", kind: "directory", module: "directories", reference: "DexKnows", openUrl: "https://www.dexknows.com/" },
  { key: "doctorcom", name: "Doctor.com", kind: "directory", module: "directories", reference: "Doctor.com", openUrl: "https://www.doctor.com/" },
  { key: "showmelocal", name: "ShowMeLocal", kind: "directory", module: "directories", reference: "ShowMeLocal", openUrl: "https://www.showmelocal.com/" },
  { key: "here", name: "HERE", kind: "directory", module: "directories", reference: "HERE", openUrl: "https://www.here.com/" },
  { key: "tripadvisor", name: "TripAdvisor", kind: "directory", module: "directories", reference: "TripAdvisor", openUrl: "https://www.tripadvisor.com/" }
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function formatDate(isoDate) {
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sanitizeText(input, max = 400) {
  return String(input || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function slugify(value) {
  return sanitizeText(value, 200)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseList(input) {
  return String(input || "")
    .split(",")
    .map((item) => sanitizeText(item, 120))
    .filter(Boolean)
    .slice(0, 50);
}

function parseUrlList(input) {
  return String(input || "")
    .split(",")
    .map((item) => sanitizeText(item, 2000))
    .filter(Boolean)
    .slice(0, 30);
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeName(value) {
  return sanitizeText(value || "", 260).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function findChannelByName(name) {
  const target = normalizeName(name);
  return state.channels.find((channel) => {
    const current = normalizeName(channel.name);
    if (!current || !target) return false;
    return current.includes(target) || target.includes(current);
  });
}

function findDirectoryByName(name) {
  const target = normalizeName(name);
  return state.directories.find((directory) => {
    const current = normalizeName(directory.name);
    if (!current || !target) return false;
    return current.includes(target) || target.includes(current);
  });
}

function toPercent(numerator, denominator) {
  if (!denominator || denominator <= 0) return "0%";
  return `${Math.round((numerator / denominator) * 1000) / 10}%`;
}

function inferLeadSource(lead) {
  const source = String(lead.source || "").toLowerCase();
  const medium = String(lead.medium || "").toLowerCase();
  const campaign = String(lead.campaign || "").toLowerCase();
  const joined = `${source} ${medium} ${campaign}`;
  if (joined.includes("google")) return "Google";
  if (joined.includes("bing")) return "Bing";
  if (joined.includes("yahoo")) return "Yahoo";
  if (joined.includes("facebook") || joined.includes("instagram")) return "Facebook";
  if (joined.includes("yelp")) return "Yelp";
  if (joined.includes("bbb")) return "BBB";
  if (joined.includes("ad") || joined.includes("cpc") || joined.includes("ppc") || joined.includes("paid")) return "Paid";
  if (joined.includes("organic") || joined.includes("seo")) return "Organic";
  return "Direct Website";
}

function setDashStatus(message, tone = "info") {
  const node = document.getElementById("dash-status");
  if (!node) return;
  node.className = `dash-status dash-status-${tone}`;
  node.textContent = message;
}

function setSettingsNotificationStatus(message, tone = "info") {
  const node = document.getElementById("settings-notification-status");
  if (!node) return;
  node.className = `form-status form-status-${tone}`;
  node.textContent = message;
}

function getRoleHeader() {
  return state.currentRole || "admin";
}

async function apiRequest(path, options = {}, includeRole = true) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (includeRole) {
    headers["x-role"] = getRoleHeader();
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    const message = payload?.errors?.join(" ") || payload?.error || "Request failed.";
    throw new Error(message);
  }
  return payload;
}

function setLastSync() {
  const node = document.getElementById("last-sync");
  if (!node) return;
  if (!state.meta.lastSync) {
    node.textContent = "Last sync: never";
    return;
  }
  node.textContent = `Last sync: ${formatDate(state.meta.lastSync)}`;
}

function isSameDay(dateA, dateB) {
  return dateA.getFullYear() === dateB.getFullYear()
    && dateA.getMonth() === dateB.getMonth()
    && dateA.getDate() === dateB.getDate();
}

function applyOverviewKpis() {
  const now = new Date();
  const leadsToday = state.leads.filter((lead) => {
    const date = new Date(lead.createdAt);
    return isSameDay(date, now);
  }).length;

  const leadsMonth = state.leads.filter((lead) => {
    const date = new Date(lead.createdAt);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }).length;

  const callsTracked = state.leads.filter((lead) => {
    const source = String(lead.source || "").toLowerCase();
    const medium = String(lead.medium || "").toLowerCase();
    const campaign = String(lead.campaign || "").toLowerCase();
    return source.includes("call") || medium.includes("call") || campaign.includes("call");
  }).length;

  const formSubmissions = state.leads.length;
  const maintenanceSignups = state.leads.filter((lead) => String(lead.serviceType || "").toLowerCase().includes("maintenance")).length;

  document.getElementById("kpi-leads-today").textContent = String(leadsToday);
  document.getElementById("kpi-leads-month").textContent = String(leadsMonth);
  document.getElementById("kpi-calls").textContent = String(callsTracked);
  document.getElementById("kpi-forms").textContent = String(formSubmissions);
  document.getElementById("kpi-maint-signups").textContent = String(maintenanceSignups);
}

function applyMarketingControlStatus() {
  const adStatus = document.getElementById("bo-ad-ready-status");
  const adDetail = document.getElementById("bo-ad-ready-detail");
  const listingStatus = document.getElementById("bo-listing-status");
  const listingDetail = document.getElementById("bo-listing-detail");

  const setChip = (node, label, tone) => {
    if (!node) return;
    node.textContent = label;
    node.className = `status-chip status-${tone}`;
  };

  const adChannels = state.channels.filter((channel) => String(channel.type || "").toLowerCase() === "ads");
  const activeAdChannels = adChannels.filter((channel) => String(channel.status || "").toLowerCase() === "active");
  const hasGoogleActive = activeAdChannels.some((channel) => /google/i.test(String(channel.name || "")));
  const hasBingActive = activeAdChannels.some((channel) => /bing/i.test(String(channel.name || "")));

  if (hasGoogleActive && hasBingActive) {
    setChip(adStatus, "Ready", "live");
  } else if (hasGoogleActive || hasBingActive) {
    setChip(adStatus, "Partial", "needs_update");
  } else {
    setChip(adStatus, "Needs Setup", "pending");
  }

  if (adDetail) {
    adDetail.textContent = `Active ad channels: ${activeAdChannels.length}. Google: ${hasGoogleActive ? "Active" : "Missing"}, Bing: ${hasBingActive ? "Active" : "Missing"}.`;
  }

  const totalDirectories = state.directories.length;
  const liveDirectories = state.directories.filter((directory) => String(directory.status || "") === "live").length;
  const pendingDirectories = state.directories.filter((directory) => String(directory.status || "") === "pending").length;
  const needsUpdateDirectories = state.directories.filter((directory) => String(directory.status || "") === "needs_update").length;

  if (totalDirectories === 0) {
    setChip(listingStatus, "Needs Setup", "pending");
  } else if (pendingDirectories === 0 && needsUpdateDirectories === 0) {
    setChip(listingStatus, "Managed", "live");
  } else {
    setChip(listingStatus, "Needs Attention", "needs_update");
  }

  if (listingDetail) {
    listingDetail.textContent = `Directories tracked: ${totalDirectories}. Live: ${liveDirectories}, Pending: ${pendingDirectories}, Needs update: ${needsUpdateDirectories}.`;
  }
}

function renderQuickStartStatus() {
  const trackingNode = document.getElementById("qs-tracking");
  const integrationsNode = document.getElementById("qs-integrations");
  const leadsNode = document.getElementById("qs-leads");

  const hasTrackingIds = Boolean(
    sanitizeText(state.settings?.tracking?.googleTagId || "", 120)
      || sanitizeText(state.settings?.tracking?.bingTagId || "", 120)
  );
  const connectedAds = state.channels.filter((channel) => String(channel.status || "") === "active").length;
  const connectedDirectories = state.directories.filter((directory) => String(directory.status || "") === "live").length;
  const leadsCount = state.leads.length;
  const bookedCount = state.leads.filter((lead) => String(lead.status || "") === "booked").length;

  if (trackingNode) {
    trackingNode.textContent = hasTrackingIds
      ? "Complete: at least one tracking ID is set."
      : "Pending: add Google Tag ID or Bing Tracking ID in Settings.";
  }
  if (integrationsNode) {
    integrationsNode.textContent = connectedAds + connectedDirectories > 0
      ? `In progress: ${connectedAds} ad channels and ${connectedDirectories} live directories connected.`
      : "Pending: connect at least Google Ads, Bing Ads, and Google Maps.";
  }
  if (leadsNode) {
    leadsNode.textContent = leadsCount > 0
      ? `Active: ${leadsCount} leads tracked, ${bookedCount} booked.`
      : "Pending: no leads yet. Start by publishing quote and appointment forms.";
  }
}

function buildTrafficRows() {
  const rows = state.channels.map((channel) => ({
    name: sanitizeText(channel.name || "Channel", 120),
    clicks: Number(channel.clicks || 0),
    leads: Number(channel.leads || 0),
    booked: Number(channel.bookings || 0)
  }));

  const directLeads = state.leads.filter((lead) => inferLeadSource(lead) === "Direct Website").length;
  const directRow = {
    name: "Direct Website",
    clicks: 0,
    leads: directLeads,
    booked: state.leads.filter((lead) => inferLeadSource(lead) === "Direct Website" && String(lead.status || "") === "booked").length
  };

  if (directLeads > 0) rows.push(directRow);
  return rows.sort((a, b) => b.leads - a.leads || b.clicks - a.clicks);
}

function applyTrafficMetrics() {
  const totalClicks = state.channels.reduce((sum, channel) => sum + Number(channel.clicks || 0), 0);
  const totalLeads = state.leads.length;
  const paidLeads = state.leads.filter((lead) => {
    const source = inferLeadSource(lead);
    return source === "Google" || source === "Bing" || source === "Yahoo" || source === "Facebook" || source === "Paid";
  }).length;
  const conversionRate = toPercent(totalLeads, totalClicks);

  const clicksNode = document.getElementById("traffic-total-clicks");
  const leadsNode = document.getElementById("traffic-total-leads");
  const paidNode = document.getElementById("traffic-paid-leads");
  const rateNode = document.getElementById("traffic-conversion-rate");

  if (clicksNode) clicksNode.textContent = String(totalClicks);
  if (leadsNode) leadsNode.textContent = String(totalLeads);
  if (paidNode) paidNode.textContent = String(paidLeads);
  if (rateNode) rateNode.textContent = conversionRate;
}

function renderTrafficTable() {
  const body = document.getElementById("traffic-source-body");
  if (!body) return;

  const rows = buildTrafficRows();
  if (rows.length === 0) {
    body.innerHTML = "<tr><td colspan='5' class='empty-state'>No channel data yet.</td></tr>";
    return;
  }

  body.innerHTML = rows
    .map((row) => `
      <tr>
        <td>${esc(row.name)}</td>
        <td>${esc(String(row.clicks))}</td>
        <td>${esc(String(row.leads))}</td>
        <td>${esc(String(row.booked))}</td>
        <td>${esc(toPercent(row.leads, row.clicks || 0))}</td>
      </tr>
    `)
    .join("");
}

function renderTrafficChart() {
  if (typeof Chart === "undefined") return;
  const chartCanvas = document.getElementById("traffic-source-chart");
  if (!chartCanvas) return;

  const sourceCounts = new Map();
  state.leads.forEach((lead) => {
    const source = inferLeadSource(lead);
    sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
  });

  const labels = [...sourceCounts.keys()];
  const values = [...sourceCounts.values()];
  if (labels.length === 0) {
    labels.push("No Leads Yet");
    values.push(1);
  }

  if (trafficSourceChart) trafficSourceChart.destroy();
  trafficSourceChart = new Chart(chartCanvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [
          "#153a63", "#17b8a9", "#ff8d33", "#4d84bc", "#2f6ca5", "#89aeca", "#a4b7c8"
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } }
    }
  });
}

function integrationStatusItem(integration) {
  if (integration.module === "channels") {
    const channel = findChannelByName(integration.reference);
    if (!channel) return { label: "Not Connected", tone: "pending", detail: "No channel record yet.", connected: false, item: null };
    const status = String(channel.status || "").toLowerCase();
    if (status === "active") return { label: "Connected", tone: "live", detail: "Channel is active and tracking.", connected: true, item: channel };
    if (status === "paused") return { label: "Paused", tone: "needs_update", detail: "Channel exists but is paused.", connected: true, item: channel };
    return { label: "Testing", tone: "pending", detail: "Channel is in testing mode.", connected: true, item: channel };
  }

  const directory = findDirectoryByName(integration.reference);
  if (!directory) return { label: "Not Connected", tone: "pending", detail: "No directory record yet.", connected: false, item: null };
  const status = String(directory.status || "").toLowerCase();
  if (status === "live") return { label: "Connected", tone: "live", detail: "Listing is live.", connected: true, item: directory };
  if (status === "needs_update") return { label: "Needs Update", tone: "needs_update", detail: "Listing needs refresh.", connected: true, item: directory };
  return { label: "Pending", tone: "pending", detail: "Listing setup is pending.", connected: true, item: directory };
}

function filteredIntegrations() {
  const typeValue = sanitizeText(document.getElementById("integration-filter-type")?.value || "all", 40).toLowerCase();
  const searchValue = sanitizeText(document.getElementById("integration-search")?.value || "", 120).toLowerCase();

  return INTEGRATION_CATALOG.filter((integration) => {
    if (typeValue !== "all" && integration.kind !== typeValue) return false;
    if (searchValue && !integration.name.toLowerCase().includes(searchValue)) return false;
    return true;
  });
}

function renderIntegrationHub() {
  const grid = document.getElementById("integration-grid");
  if (!grid) return;

  const list = filteredIntegrations();
  if (list.length === 0) {
    grid.innerHTML = "<div class='panel'><p class='empty-state'>No platforms match your filters.</p></div>";
    return;
  }

  grid.innerHTML = list.map((integration) => {
    const status = integrationStatusItem(integration);
    const initials = integration.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");

    return `
      <article class="integration-card">
        <div class="integration-head">
          <div class="integration-brand">
            <span class="integration-logo">${esc(initials)}</span>
            <div>
              <div class="integration-name">${esc(integration.name)}</div>
              <span class="integration-type">${esc(integration.kind)}</span>
            </div>
          </div>
          <span class="status-chip status-${esc(status.tone)}">${esc(status.label)}</span>
        </div>
        <p class="integration-meta">${esc(status.detail)}</p>
        <div class="integration-actions">
          <button type="button" data-action="connect-integration" data-key="${esc(integration.key)}">${status.connected ? "Reconnect" : "Connect"}</button>
          <button type="button" data-action="flag-integration" data-key="${esc(integration.key)}">Mark Needs Update</button>
          <a href="${esc(integration.openUrl)}" target="_blank" rel="noopener">Open</a>
        </div>
      </article>
    `;
  }).join("");
}

function renderActivity() {
  const list = document.getElementById("activity-list");
  if (!list) return;
  const items = Array.isArray(state.activity) ? state.activity.slice(0, 12) : [];
  if (items.length === 0) {
    list.innerHTML = "<li class='empty-state'>No recent activity.</li>";
    return;
  }

  list.innerHTML = items
    .map((item) => `
      <li>
        <span class="activity-time">${esc(formatDate(item.createdAt))}</span>
        <span class="activity-msg">${esc(item.message || "Activity item")}</span>
      </li>
    `)
    .join("");
}

function buildLeadTrendData() {
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
  const labels = [];
  const values = [];
  const now = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(monthFormatter.format(d));
    const count = state.leads.filter((lead) => {
      const created = new Date(lead.createdAt);
      return created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth();
    }).length;
    values.push(count);
  }

  return { labels, values };
}

function buildLeadStatusData() {
  const counts = { new: 0, contacted: 0, booked: 0, closed: 0 };
  state.leads.forEach((lead) => {
    const status = String(lead.status || "new");
    if (counts[status] !== undefined) counts[status] += 1;
  });
  return counts;
}

function renderCharts() {
  if (typeof Chart === "undefined") return;
  const trendCanvas = document.getElementById("trend-chart");
  const statusCanvas = document.getElementById("lead-status-chart");
  if (!trendCanvas || !statusCanvas) return;

  const trend = buildLeadTrendData();
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(trendCanvas.getContext("2d"), {
    type: "line",
    data: {
      labels: trend.labels,
      datasets: [{
        label: "Leads",
        data: trend.values,
        borderColor: "#153a63",
        backgroundColor: "rgba(21, 58, 99, 0.18)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: true, position: "bottom" } }
    }
  });

  const status = buildLeadStatusData();
  if (statusChart) statusChart.destroy();
  statusChart = new Chart(statusCanvas.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["New", "Contacted", "Booked", "Closed"],
      datasets: [{
        data: [status.new, status.contacted, status.booked, status.closed],
        backgroundColor: ["#ff8d33", "#17b8a9", "#153a63", "#4d84bc"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } }
    }
  });
}

function getLeadFilters() {
  return {
    city: sanitizeText(document.getElementById("lead-filter-city")?.value || "", 120).toLowerCase(),
    service: sanitizeText(document.getElementById("lead-filter-service")?.value || "", 120).toLowerCase(),
    status: document.getElementById("lead-filter-status")?.value || "all",
    search: sanitizeText(document.getElementById("lead-search")?.value || "", 120).toLowerCase()
  };
}

function filteredLeads() {
  const filters = getLeadFilters();
  const sorted = [...state.leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return sorted.filter((lead) => {
    const city = String(lead.city || "").toLowerCase();
    const service = String(lead.serviceType || "").toLowerCase();
    const status = String(lead.status || "new").toLowerCase();
    const searchable = [lead.name, lead.email, lead.phone, lead.business].join(" ").toLowerCase();

    if (filters.city && !city.includes(filters.city)) return false;
    if (filters.service && !service.includes(filters.service)) return false;
    if (filters.status !== "all" && status !== filters.status) return false;
    if (filters.search && !searchable.includes(filters.search)) return false;
    return true;
  });
}
function renderLeadTable() {
  const body = document.getElementById("lead-table-body");
  if (!body) return;
  const leads = filteredLeads();

  if (leads.length === 0) {
    body.innerHTML = "<tr><td colspan='9' class='empty-state'>No leads match the current filters.</td></tr>";
    return;
  }

  body.innerHTML = leads
    .map((lead) => {
      const id = esc(lead.id);
      return `
      <tr>
        <td>${esc(formatDate(lead.createdAt))}</td>
        <td>${esc(lead.name || "-")}</td>
        <td>${esc(lead.business || "-")}</td>
        <td>
          <div>${esc(lead.phone || "-")}</div>
          <div>${esc(lead.email || "-")}</div>
        </td>
        <td>${esc(lead.city || "-")}</td>
        <td>${esc(lead.serviceType || "-")}</td>
        <td>
          <select id="lead_status_${id}">
            <option value="new" ${lead.status === "new" ? "selected" : ""}>New</option>
            <option value="contacted" ${lead.status === "contacted" ? "selected" : ""}>Contacted</option>
            <option value="booked" ${lead.status === "booked" ? "selected" : ""}>Booked</option>
            <option value="closed" ${lead.status === "closed" ? "selected" : ""}>Closed</option>
          </select>
        </td>
        <td><input id="lead_notes_${id}" value="${esc(lead.notes || "")}" maxlength="2000"></td>
        <td>
          <div class="table-actions">
            <button type="button" data-action="save-lead" data-id="${id}">Save</button>
            <button type="button" data-action="email-lead" data-id="${id}">Email</button>
            <button type="button" data-action="call-lead" data-id="${id}">Call</button>
            <button type="button" data-action="delete-lead" data-id="${id}">Delete</button>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");
}

function renderLocationsTable() {
  const body = document.getElementById("location-table-body");
  if (!body) return;
  if (state.locations.length === 0) {
    body.innerHTML = "<tr><td colspan='5' class='empty-state'>No locations yet.</td></tr>";
    return;
  }

  body.innerHTML = state.locations
    .map((location) => `
      <tr>
        <td>${esc(location.city)}</td>
        <td>${esc(location.slug)}</td>
        <td>${location.published ? "Published" : "Draft"}</td>
        <td>${esc(formatDate(location.updatedAt))}</td>
        <td><div class="table-actions"><button type="button" data-action="edit-location" data-id="${esc(location.id)}">Edit</button><button type="button" data-action="delete-location" data-id="${esc(location.id)}">Delete</button></div></td>
      </tr>
    `)
    .join("");
}

function renderServiceTable() {
  const body = document.getElementById("service-table-body");
  if (!body) return;
  if (state.servicePages.length === 0) {
    body.innerHTML = "<tr><td colspan='5' class='empty-state'>No service pages yet.</td></tr>";
    return;
  }

  body.innerHTML = state.servicePages
    .map((servicePage) => `
      <tr>
        <td>${esc(servicePage.name)}</td>
        <td>${esc(servicePage.slug)}</td>
        <td>${servicePage.active ? "Active" : "Inactive"}</td>
        <td>${esc(servicePage.pricingNote || "-")}</td>
        <td><div class="table-actions"><button type="button" data-action="edit-service" data-id="${esc(servicePage.id)}">Edit</button><button type="button" data-action="delete-service" data-id="${esc(servicePage.id)}">Delete</button></div></td>
      </tr>
    `)
    .join("");
}

function renderPromotionTable() {
  const body = document.getElementById("promotion-table-body");
  if (!body) return;
  if (state.promotions.length === 0) {
    body.innerHTML = "<tr><td colspan='5' class='empty-state'>No promotions yet.</td></tr>";
    return;
  }

  body.innerHTML = state.promotions
    .map((promotion) => `
      <tr>
        <td>${esc(promotion.title)}</td>
        <td>${esc(promotion.status)}</td>
        <td>${esc(formatDate(promotion.startDate))} - ${esc(formatDate(promotion.endDate))}</td>
        <td>${esc((promotion.cityTargets || []).join(", "))}</td>
        <td><div class="table-actions"><button type="button" data-action="edit-promotion" data-id="${esc(promotion.id)}">Edit</button><button type="button" data-action="delete-promotion" data-id="${esc(promotion.id)}">Delete</button></div></td>
      </tr>
    `)
    .join("");
}

function renderPostTable() {
  const body = document.getElementById("post-table-body");
  if (!body) return;
  const filterType = sanitizeText(document.getElementById("post-filter-type")?.value || "all", 40).toLowerCase();
  const posts = state.posts.filter((post) => {
    if (filterType === "all") return true;
    return String(post.postType || "").toLowerCase() === filterType;
  });

  if (posts.length === 0) {
    body.innerHTML = "<tr><td colspan='7' class='empty-state'>No posts yet.</td></tr>";
    return;
  }

  body.innerHTML = posts
    .map((post) => `
      <tr>
        <td>${esc(post.title)}</td>
        <td>${esc(post.postType || "blog")}</td>
        <td>${esc(post.category || "-")}</td>
        <td>${esc(post.status || "draft")}</td>
        <td>${esc(String(Array.isArray(post.mediaUrls) ? post.mediaUrls.length : 0))}</td>
        <td>${esc(formatDate(post.publishDate))}</td>
        <td><div class="table-actions"><button type="button" data-action="edit-post" data-id="${esc(post.id)}">Edit</button><button type="button" data-action="delete-post" data-id="${esc(post.id)}">Delete</button></div></td>
      </tr>
    `)
    .join("");
}

function renderDirectoryTable() {
  const body = document.getElementById("directory-table-body");
  if (!body) return;
  if (state.directories.length === 0) {
    body.innerHTML = "<tr><td colspan='6' class='empty-state'>No directories yet.</td></tr>";
    return;
  }

  body.innerHTML = state.directories
    .map((directory) => `
      <tr>
        <td>${esc(directory.name)}</td>
        <td>${esc(directory.status)}</td>
        <td>${directory.url ? `<a href="${esc(directory.url)}" target="_blank" rel="noopener">Open</a>` : "-"}</td>
        <td>${esc(formatDate(directory.lastSyncedAt))}</td>
        <td>${esc(directory.loginNotes || directory.manualUpdatedAt || "-")}</td>
        <td><div class="table-actions"><button type="button" data-action="edit-directory" data-id="${esc(directory.id)}">Edit</button><button type="button" data-action="delete-directory" data-id="${esc(directory.id)}">Delete</button></div></td>
      </tr>
    `)
    .join("");
}

function renderReviewTable() {
  const body = document.getElementById("review-table-body");
  if (!body) return;
  if (state.reviews.length === 0) {
    body.innerHTML = "<tr><td colspan='6' class='empty-state'>No reviews yet.</td></tr>";
    return;
  }

  body.innerHTML = state.reviews
    .map((review) => `
      <tr>
        <td>${esc(review.reviewerName)}</td>
        <td>${esc(review.source || "-")}</td>
        <td>${esc(review.rating || 5)}</td>
        <td>${esc(review.city || "-")}</td>
        <td>${review.approved ? "Yes" : "No"}</td>
        <td><div class="table-actions"><button type="button" data-action="edit-review" data-id="${esc(review.id)}">Edit</button><button type="button" data-action="delete-review" data-id="${esc(review.id)}">Delete</button></div></td>
      </tr>
    `)
    .join("");
}

function renderPlanTable() {
  const body = document.getElementById("plan-table-body");
  if (!body) return;
  if (state.maintenancePlans.length === 0) {
    body.innerHTML = "<tr><td colspan='6' class='empty-state'>No plans configured.</td></tr>";
    return;
  }

  body.innerHTML = state.maintenancePlans
    .map((plan) => `
      <tr>
        <td>${esc(plan.name)}</td>
        <td>${esc(plan.tier || "-")}</td>
        <td>${formatCurrency(plan.price || 0)}</td>
        <td>${esc(plan.billingCycle || "-")}</td>
        <td>${esc(plan.status || "-")}</td>
        <td><div class="table-actions"><button type="button" data-action="edit-plan" data-id="${esc(plan.id)}">Edit</button><button type="button" data-action="delete-plan" data-id="${esc(plan.id)}">Delete</button></div></td>
      </tr>
    `)
    .join("");
}

function populatePlanSelect() {
  const select = document.getElementById("member-plan");
  if (!select) return;
  if (state.maintenancePlans.length === 0) {
    select.innerHTML = "<option value=''>No plans</option>";
    return;
  }
  select.innerHTML = state.maintenancePlans
    .map((plan) => `<option value="${esc(plan.id)}">${esc(plan.name)} (${esc(plan.tier || "")})</option>`)
    .join("");
}

function renderMemberTable() {
  const body = document.getElementById("member-table-body");
  if (!body) return;
  if (state.maintenanceMembers.length === 0) {
    body.innerHTML = "<tr><td colspan='6' class='empty-state'>No members yet.</td></tr>";
    return;
  }

  body.innerHTML = state.maintenanceMembers
    .map((member) => {
      const plan = state.maintenancePlans.find((item) => item.id === member.planId);
      return `
      <tr>
        <td>${esc(member.name)}</td>
        <td>${esc(member.company || "-")}</td>
        <td>${esc(plan?.name || member.planId || "-")}</td>
        <td>${esc(member.status || "-")}</td>
        <td>${esc(formatDate(member.startDate))}</td>
        <td><div class="table-actions"><button type="button" data-action="edit-member" data-id="${esc(member.id)}">Edit</button><button type="button" data-action="delete-member" data-id="${esc(member.id)}">Delete</button></div></td>
      </tr>
      `;
    })
    .join("");
}

function renderUserTable() {
  const body = document.getElementById("user-table-body");
  if (!body) return;
  if (state.users.length === 0) {
    body.innerHTML = "<tr><td colspan='5' class='empty-state'>No users configured.</td></tr>";
    return;
  }

  body.innerHTML = state.users
    .map((user) => `
      <tr>
        <td>${esc(user.name)}</td>
        <td>${esc(user.email)}</td>
        <td>${esc(user.role)}</td>
        <td>${esc(user.status)}</td>
        <td><div class="table-actions"><button type="button" data-action="edit-user" data-id="${esc(user.id)}">Edit</button><button type="button" data-action="delete-user" data-id="${esc(user.id)}">Delete</button></div></td>
      </tr>
    `)
    .join("");
}

function renderSettingsForm() {
  document.getElementById("settings-business").value = state.settings.businessName || "";
  document.getElementById("settings-phone").value = state.settings.phone || "";
  document.getElementById("settings-email").value = state.settings.email || "";
  document.getElementById("settings-address").value = state.settings.address || "";
  document.getElementById("settings-hours").value = state.settings.serviceHours || "";
  document.getElementById("settings-logo").value = state.settings.logoUrl || "";
  document.getElementById("settings-facebook").value = state.settings.social?.facebook || "";
  document.getElementById("settings-instagram").value = state.settings.social?.instagram || "";
  document.getElementById("settings-linkedin").value = state.settings.social?.linkedin || "";
  document.getElementById("settings-google-tag").value = state.settings.tracking?.googleTagId || "";
  document.getElementById("settings-bing-tag").value = state.settings.tracking?.bingTagId || "";
  document.getElementById("settings-notify-enabled").checked = Boolean(state.settings.notifications?.enabled);
  document.getElementById("settings-notify-include-business-email").checked = state.settings.notifications?.includeBusinessEmail !== false;
  document.getElementById("settings-notify-subject-prefix").value = state.settings.notifications?.subjectPrefix || "New Lead";
  document.getElementById("settings-notify-recipients").value = (state.settings.notifications?.recipients || []).join(", ");
}

function renderSiteContentForm() {
  const content = state.siteContent || {};
  const hero = content.hero || {};
  const services = content.services || {};
  const expertise = content.expertise || {};
  const promo = content.promo || {};
  const quickLinks = content.quickLinks || {};
  const shop = content.shop || {};
  const blog = content.blog || {};

  const map = [
    ["site-hero-eyebrow", hero.eyebrow],
    ["site-hero-title", hero.title],
    ["site-hero-subtitle", hero.subtitle],
    ["site-hero-bg", hero.backgroundImage],
    ["site-service-heading", services.heading],
    ["site-service-img-1", services.card1Image],
    ["site-service-img-2", services.card2Image],
    ["site-service-img-3", services.card3Image],
    ["site-service-img-4", services.card4Image],
    ["site-expertise-heading", expertise.heading],
    ["site-expertise-img", expertise.image],
    ["site-promo-bg", promo.backgroundImage],
    ["site-promo-title", promo.title],
    ["site-promo-desc", promo.description],
    ["site-quick-img-1", quickLinks.card1Image],
    ["site-quick-img-2", quickLinks.card2Image],
    ["site-quick-img-3", quickLinks.card3Image],
    ["site-shop-title", shop.title],
    ["site-shop-subtitle", shop.subtitle],
    ["site-shop-hero-img", shop.heroImage],
    ["site-blog-title", blog.title],
    ["site-blog-subtitle", blog.subtitle],
    ["site-blog-hero-img", blog.heroImage]
  ];

  map.forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.value = value || "";
  });
}

function renderAll() {
  setLastSync();
  renderQuickStartStatus();
  applyOverviewKpis();
  applyMarketingControlStatus();
  applyTrafficMetrics();
  renderTrafficTable();
  renderTrafficChart();
  renderIntegrationHub();
  renderCharts();
  renderActivity();
  renderLeadTable();
  renderLocationsTable();
  renderServiceTable();
  renderPromotionTable();
  renderPostTable();
  renderDirectoryTable();
  renderReviewTable();
  renderPlanTable();
  populatePlanSelect();
  renderMemberTable();
  renderSettingsForm();
  renderSiteContentForm();
  renderUserTable();
}
function clearForm(formId, hiddenId) {
  const form = document.getElementById(formId);
  if (form) form.reset();
  if (hiddenId) {
    const hidden = document.getElementById(hiddenId);
    if (hidden) hidden.value = "";
  }
}

function fillLocationForm(location) {
  document.getElementById("location-id").value = location.id;
  document.getElementById("location-city").value = location.city || "";
  document.getElementById("location-slug").value = location.slug || "";
  document.getElementById("location-image").value = location.imageUrl || "";
  document.getElementById("location-published").checked = Boolean(location.published);
  document.getElementById("location-intro").value = location.intro || "";
  document.getElementById("location-services").value = location.servicesSummary || "";
  document.getElementById("location-testimonial").value = location.testimonial || "";
  document.getElementById("location-map").value = location.mapNote || "";
}

function fillServiceForm(servicePage) {
  document.getElementById("service-id").value = servicePage.id;
  document.getElementById("service-name").value = servicePage.name || "";
  document.getElementById("service-slug").value = servicePage.slug || "";
  document.getElementById("service-image").value = servicePage.imageUrl || "";
  document.getElementById("service-active").checked = Boolean(servicePage.active);
  document.getElementById("service-pricing").value = servicePage.pricingNote || "";
  document.getElementById("service-description").value = servicePage.description || "";
}

function fillPromotionForm(promotion) {
  document.getElementById("promotion-id").value = promotion.id;
  document.getElementById("promotion-title").value = promotion.title || "";
  document.getElementById("promotion-cta").value = promotion.ctaText || "";
  document.getElementById("promotion-start").value = promotion.startDate || "";
  document.getElementById("promotion-end").value = promotion.endDate || "";
  document.getElementById("promotion-status").value = promotion.status || "draft";
  document.getElementById("promotion-banner").value = promotion.bannerImage || "";
  document.getElementById("promotion-pages").value = (promotion.pageTargets || []).join(",");
  document.getElementById("promotion-cities").value = (promotion.cityTargets || []).join(",");
  document.getElementById("promotion-description").value = promotion.description || "";
}

function fillPostForm(post) {
  document.getElementById("post-id").value = post.id;
  document.getElementById("post-title").value = post.title || "";
  document.getElementById("post-slug").value = post.slug || "";
  document.getElementById("post-category").value = post.category || "";
  document.getElementById("post-status").value = post.status || "draft";
  document.getElementById("post-type").value = post.postType || "blog";
  document.getElementById("post-price").value = post.priceText || "";
  document.getElementById("post-buy-url").value = post.buyUrl || "";
  document.getElementById("post-badge").value = post.badge || "";
  document.getElementById("post-publish-date").value = post.publishDate || "";
  document.getElementById("post-image").value = post.imageUrl || "";
  document.getElementById("post-meta-title").value = post.metaTitle || "";
  document.getElementById("post-meta-description").value = post.metaDescription || "";
  document.getElementById("post-excerpt").value = post.excerpt || "";
  document.getElementById("post-content").value = post.content || "";
  document.getElementById("post-media-urls").value = (post.mediaUrls || []).join(", ");
}

function fillDirectoryForm(directory) {
  document.getElementById("directory-id").value = directory.id;
  document.getElementById("directory-name").value = directory.name || "";
  document.getElementById("directory-url").value = directory.url || "";
  document.getElementById("directory-status").value = directory.status || "pending";
  document.getElementById("directory-updated").value = directory.manualUpdatedAt || "";
  document.getElementById("directory-login").value = directory.loginNotes || "";
}

function fillReviewForm(review) {
  document.getElementById("review-id").value = review.id;
  document.getElementById("review-name").value = review.reviewerName || "";
  document.getElementById("review-source").value = review.source || "";
  document.getElementById("review-rating").value = String(review.rating || 5);
  document.getElementById("review-approved").checked = Boolean(review.approved);
  document.getElementById("review-city").value = review.city || "";
  document.getElementById("review-service").value = review.service || "";
  document.getElementById("review-media").value = review.mediaUrl || "";
  document.getElementById("review-quote").value = review.quote || "";
}

function fillPlanForm(plan) {
  document.getElementById("plan-id").value = plan.id;
  document.getElementById("plan-name").value = plan.name || "";
  document.getElementById("plan-tier").value = plan.tier || "";
  document.getElementById("plan-price").value = String(plan.price || 0);
  document.getElementById("plan-billing").value = plan.billingCycle || "monthly";
  document.getElementById("plan-status").value = plan.status || "active";
  document.getElementById("plan-features").value = (plan.features || []).join(",");
}

function fillMemberForm(member) {
  document.getElementById("member-id").value = member.id;
  document.getElementById("member-name").value = member.name || "";
  document.getElementById("member-email").value = member.email || "";
  document.getElementById("member-company").value = member.company || "";
  document.getElementById("member-plan").value = member.planId || "";
  document.getElementById("member-start").value = member.startDate || "";
  document.getElementById("member-status").value = member.status || "active";
  document.getElementById("member-notes").value = member.notes || "";
}

function fillUserForm(user) {
  document.getElementById("user-id").value = user.id;
  document.getElementById("user-name").value = user.name || "";
  document.getElementById("user-email").value = user.email || "";
  document.getElementById("user-role").value = user.role || "marketing";
  document.getElementById("user-status").value = user.status || "active";
}

function setSectionAccess(sectionId, read, write) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  if (!read) {
    section.classList.add("hidden-section");
    return;
  }
  section.classList.remove("hidden-section");

  const controls = section.querySelectorAll("input, select, textarea, button");
  controls.forEach((control) => {
    if (control.id === "export-leads-btn" || control.id === "export-members-btn") {
      control.disabled = !read;
      return;
    }
    control.disabled = !write;
  });
}

function applyPermissions() {
  const permissions = state.permissions || {};
  setSectionAccess("quickstart", permissions.overview?.read ?? true, false);
  setSectionAccess("overview", permissions.overview?.read ?? true, permissions.overview?.write ?? true);
  setSectionAccess("traffic", permissions.overview?.read ?? true, false);
  const integrationsRead = (permissions.channels?.read ?? true) || (permissions.directories?.read ?? true);
  const integrationsWrite = (permissions.channels?.write ?? true) || (permissions.directories?.write ?? true);
  setSectionAccess("integrations", integrationsRead, integrationsWrite);
  setSectionAccess("leads", permissions.leads?.read ?? true, permissions.leads?.write ?? true);
  setSectionAccess("locations", permissions.locations?.read ?? true, permissions.locations?.write ?? true);
  setSectionAccess("services-manager", permissions.servicePages?.read ?? true, permissions.servicePages?.write ?? true);
  setSectionAccess("promotions", permissions.promotions?.read ?? true, permissions.promotions?.write ?? true);
  setSectionAccess("content", permissions.posts?.read ?? true, permissions.posts?.write ?? true);
  setSectionAccess("website-content", permissions.settings?.read ?? true, permissions.settings?.write ?? true);
  setSectionAccess("directories", permissions.directories?.read ?? true, permissions.directories?.write ?? true);
  setSectionAccess("reviews", permissions.reviews?.read ?? true, permissions.reviews?.write ?? true);
  setSectionAccess("maintenance", permissions.maintenance?.read ?? true, permissions.maintenance?.write ?? true);
  setSectionAccess("settings", permissions.settings?.read ?? true, permissions.settings?.write ?? true);
  setSectionAccess("users", permissions.users?.read ?? true, permissions.users?.write ?? true);
}

async function loadDashboard() {
  const payload = await apiRequest("/api/dashboard");
  state.channels = Array.isArray(payload.channels) ? payload.channels : [];
  state.directories = Array.isArray(payload.directories) ? payload.directories : [];
  state.campaigns = Array.isArray(payload.campaigns) ? payload.campaigns : [];
  state.leads = Array.isArray(payload.leads) ? payload.leads : [];
  state.locations = Array.isArray(payload.locations) ? payload.locations : [];
  state.servicePages = Array.isArray(payload.servicePages) ? payload.servicePages : [];
  state.promotions = Array.isArray(payload.promotions) ? payload.promotions : [];
  state.posts = Array.isArray(payload.posts) ? payload.posts : [];
  state.reviews = Array.isArray(payload.reviews) ? payload.reviews : [];
  state.maintenancePlans = Array.isArray(payload.maintenancePlans) ? payload.maintenancePlans : [];
  state.maintenanceMembers = Array.isArray(payload.maintenanceMembers) ? payload.maintenanceMembers : [];
  state.settings = payload.settings || {};
  state.siteContent = payload.siteContent || {};
  state.users = Array.isArray(payload.users) ? payload.users : [];
  state.activity = Array.isArray(payload.activity) ? payload.activity : [];
  state.meta = payload.meta || state.meta;
  state.permissions = payload.meta?.permissions || {};

  const rolePicker = document.getElementById("session-role");
  if (rolePicker && payload.meta?.activeRole) {
    state.currentRole = payload.meta.activeRole;
    rolePicker.value = state.currentRole;
  }
}

async function reloadAndRender(successMessage = "Saved.") {
  await loadDashboard();
  renderAll();
  applyPermissions();
  setDashStatus(successMessage, "success");
}
function setupLeadControls() {
  const leadTable = document.getElementById("lead-table-body");
  const leadFilters = ["lead-filter-city", "lead-filter-service", "lead-filter-status", "lead-search"];
  leadFilters.forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.addEventListener("input", renderLeadTable);
    if (node && node.tagName === "SELECT") node.addEventListener("change", renderLeadTable);
  });

  document.getElementById("export-leads-btn")?.addEventListener("click", () => {
    window.location.href = "/api/leads.csv";
  });

  leadTable?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.getAttribute("data-action");
    const id = target.getAttribute("data-id");
    if (!action || !id) return;

    const lead = state.leads.find((item) => item.id === id);
    if (!lead) return;

    if (action === "email-lead") {
      window.location.href = `mailto:${lead.email || ""}`;
      return;
    }

    if (action === "call-lead") {
      window.location.href = `tel:${lead.phone || ""}`;
      return;
    }

    if (action === "save-lead") {
      try {
        const statusValue = document.getElementById(`lead_status_${id}`)?.value || lead.status || "new";
        const notesValue = document.getElementById(`lead_notes_${id}`)?.value || "";
        await apiRequest(`/api/leads/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify({ status: statusValue, notes: notesValue })
        });
        await reloadAndRender("Lead updated.");
      } catch (error) {
        setDashStatus(error.message, "error");
      }
      return;
    }

    if (action === "delete-lead") {
      try {
        await apiRequest(`/api/leads/${encodeURIComponent(id)}`, { method: "DELETE" });
        await reloadAndRender("Lead deleted.");
      } catch (error) {
        setDashStatus(error.message, "error");
      }
    }
  });
}

async function syncIntegrationRecord(integration, action = "connect") {
  const nowLabel = `Updated ${formatDateInput(new Date())} via Integration Hub`;
  if (integration.module === "channels") {
    const existing = findChannelByName(integration.reference);
    const nextStatus = action === "flag" ? "paused" : "active";
    if (existing) {
      const payload = {
        name: sanitizeText(existing.name || integration.reference, 200),
        type: sanitizeText(existing.type || "ads", 40).toLowerCase(),
        status: nextStatus,
        spend: Number(existing.spend || 0),
        clicks: Number(existing.clicks || 0),
        leads: Number(existing.leads || 0),
        bookings: Number(existing.bookings || 0)
      };
      await apiRequest(`/api/channels/${encodeURIComponent(existing.id)}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      return;
    }

    const payload = {
      name: integration.reference,
      type: "ads",
      status: action === "flag" ? "testing" : "active",
      spend: 0,
      clicks: 0,
      leads: 0,
      bookings: 0
    };
    await apiRequest("/api/channels", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return;
  }

  const existing = findDirectoryByName(integration.reference);
  const nextStatus = action === "flag" ? "needs_update" : "live";
  if (existing) {
    await apiRequest(`/api/directories/${encodeURIComponent(existing.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: nextStatus,
        url: existing.url || integration.openUrl,
        manualUpdatedAt: nowLabel
      })
    });
    return;
  }

  await apiRequest("/api/directories", {
    method: "POST",
    body: JSON.stringify({
      name: integration.reference,
      status: nextStatus,
      url: integration.openUrl,
      loginNotes: "",
      manualUpdatedAt: nowLabel
    })
  });
}

function setupIntegrationControls() {
  const typeFilter = document.getElementById("integration-filter-type");
  const searchFilter = document.getElementById("integration-search");
  const grid = document.getElementById("integration-grid");
  const connectCoreButton = document.getElementById("connect-core-btn");

  if (typeFilter) typeFilter.addEventListener("change", renderIntegrationHub);
  if (searchFilter) searchFilter.addEventListener("input", renderIntegrationHub);

  grid?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.getAttribute("data-action");
    const key = target.getAttribute("data-key");
    if (!action || !key) return;

    const integration = INTEGRATION_CATALOG.find((item) => item.key === key);
    if (!integration) return;

    try {
      if (action === "connect-integration") {
        await syncIntegrationRecord(integration, "connect");
        await reloadAndRender(`${integration.name} connected.`);
      }
      if (action === "flag-integration") {
        await syncIntegrationRecord(integration, "flag");
        await reloadAndRender(`${integration.name} marked for update.`);
      }
    } catch (error) {
      setDashStatus(error.message, "error");
    }
  });

  connectCoreButton?.addEventListener("click", async () => {
    const coreKeys = ["google_ads", "bing_ads", "yahoo_ads", "google_maps", "apple_maps", "bbb", "yelp"];
    try {
      setDashStatus("Connecting core integrations...", "info");
      for (const key of coreKeys) {
        const integration = INTEGRATION_CATALOG.find((item) => item.key === key);
        if (!integration) continue;
        await syncIntegrationRecord(integration, "connect");
      }
      await reloadAndRender("Core integrations connected.");
    } catch (error) {
      setDashStatus(error.message, "error");
    }
  });
}

function setupModuleCrud(config) {
  const {
    formId,
    tableBodyId,
    resetId,
    hiddenId,
    buildPayload,
    endpoint,
    itemKey,
    fillForm,
    successLabel,
    updateMethod = "PUT"
  } = config;
  const form = document.getElementById(formId);
  const tableBody = document.getElementById(tableBodyId);
  const resetButton = document.getElementById(resetId);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const id = document.getElementById(hiddenId)?.value || "";
      const payload = buildPayload();
      if (id) {
        await apiRequest(`${endpoint}/${encodeURIComponent(id)}`, {
          method: updateMethod,
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest(endpoint, {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      clearForm(formId, hiddenId);
      await reloadAndRender(`${successLabel} saved.`);
    } catch (error) {
      setDashStatus(error.message, "error");
    }
  });

  resetButton?.addEventListener("click", () => clearForm(formId, hiddenId));

  tableBody?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.getAttribute("data-action");
    const id = target.getAttribute("data-id");
    if (!action || !id) return;

    const sourceArray = state[itemKey] || [];
    const item = sourceArray.find((entry) => entry.id === id);

    if (action.startsWith("edit-")) {
      if (item) fillForm(item);
      return;
    }

    if (action.startsWith("delete-")) {
      try {
        await apiRequest(`${endpoint}/${encodeURIComponent(id)}`, { method: "DELETE" });
        await reloadAndRender(`${successLabel} deleted.`);
      } catch (error) {
        setDashStatus(error.message, "error");
      }
    }
  });
}

function setupRoleSwitcher() {
  document.getElementById("session-role")?.addEventListener("change", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    try {
      await apiRequest("/api/session/role", {
        method: "PATCH",
        body: JSON.stringify({ role: target.value })
      }, false);
      state.currentRole = target.value;
      await reloadAndRender(`Role switched to ${target.value}.`);
    } catch (error) {
      setDashStatus(error.message, "error");
    }
  });
}

function setupPostFilters() {
  document.getElementById("post-filter-type")?.addEventListener("change", renderPostTable);
}

function setupGlobalActions() {
  document.getElementById("export-btn")?.addEventListener("click", () => {
    window.location.href = "/api/export.csv";
  });

  document.getElementById("sync-all-btn")?.addEventListener("click", async () => {
    try {
      await apiRequest("/api/sync", { method: "POST" });
      await reloadAndRender("Directory sync complete.");
    } catch (error) {
      setDashStatus(error.message, "error");
    }
  });

  document.getElementById("export-members-btn")?.addEventListener("click", () => {
    window.location.href = "/api/maintenance-members.csv";
  });
}

function setupSettingsForm() {
  const form = document.getElementById("settings-form");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = {
        businessName: sanitizeText(document.getElementById("settings-business")?.value || "", 260),
        phone: sanitizeText(document.getElementById("settings-phone")?.value || "", 80),
        email: sanitizeText(document.getElementById("settings-email")?.value || "", 260),
        address: sanitizeText(document.getElementById("settings-address")?.value || "", 260),
        serviceHours: sanitizeText(document.getElementById("settings-hours")?.value || "", 260),
        logoUrl: sanitizeText(document.getElementById("settings-logo")?.value || "", 2000),
        social: {
          facebook: sanitizeText(document.getElementById("settings-facebook")?.value || "", 2000),
          instagram: sanitizeText(document.getElementById("settings-instagram")?.value || "", 2000),
          linkedin: sanitizeText(document.getElementById("settings-linkedin")?.value || "", 2000)
        },
        tracking: {
          googleTagId: sanitizeText(document.getElementById("settings-google-tag")?.value || "", 120),
          bingTagId: sanitizeText(document.getElementById("settings-bing-tag")?.value || "", 120)
        },
        notifications: {
          enabled: Boolean(document.getElementById("settings-notify-enabled")?.checked),
          includeBusinessEmail: Boolean(document.getElementById("settings-notify-include-business-email")?.checked),
          subjectPrefix: sanitizeText(document.getElementById("settings-notify-subject-prefix")?.value || "", 120),
          recipients: parseList(document.getElementById("settings-notify-recipients")?.value || "")
            .map((email) => sanitizeText(email, 260).toLowerCase())
        }
      };
      await apiRequest("/api/settings", { method: "PUT", body: JSON.stringify(payload) });
      setSettingsNotificationStatus("Lead notification settings saved.", "success");
      await reloadAndRender("Settings updated.");
    } catch (error) {
      setSettingsNotificationStatus(error.message, "error");
      setDashStatus(error.message, "error");
    }
  });

  document.getElementById("test-notification-btn")?.addEventListener("click", async () => {
    try {
      setSettingsNotificationStatus("Sending test email...", "info");
      await apiRequest("/api/settings/notifications/test", { method: "POST" });
      setSettingsNotificationStatus("Test email sent. Check recipient inboxes.", "success");
      await reloadAndRender("Notification test email sent.");
    } catch (error) {
      setSettingsNotificationStatus(error.message, "error");
      setDashStatus(error.message, "error");
    }
  });
}

function setupSiteContentForm() {
  const form = document.getElementById("site-content-form");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = {
        hero: {
          eyebrow: sanitizeText(document.getElementById("site-hero-eyebrow")?.value || "", 260),
          title: sanitizeText(document.getElementById("site-hero-title")?.value || "", 1200),
          subtitle: sanitizeText(document.getElementById("site-hero-subtitle")?.value || "", 2000),
          backgroundImage: sanitizeText(document.getElementById("site-hero-bg")?.value || "", 2000)
        },
        services: {
          heading: sanitizeText(document.getElementById("site-service-heading")?.value || "", 1200),
          card1Image: sanitizeText(document.getElementById("site-service-img-1")?.value || "", 2000),
          card2Image: sanitizeText(document.getElementById("site-service-img-2")?.value || "", 2000),
          card3Image: sanitizeText(document.getElementById("site-service-img-3")?.value || "", 2000),
          card4Image: sanitizeText(document.getElementById("site-service-img-4")?.value || "", 2000)
        },
        expertise: {
          heading: sanitizeText(document.getElementById("site-expertise-heading")?.value || "", 1200),
          image: sanitizeText(document.getElementById("site-expertise-img")?.value || "", 2000)
        },
        promo: {
          title: sanitizeText(document.getElementById("site-promo-title")?.value || "", 1200),
          description: sanitizeText(document.getElementById("site-promo-desc")?.value || "", 2000),
          backgroundImage: sanitizeText(document.getElementById("site-promo-bg")?.value || "", 2000)
        },
        quickLinks: {
          card1Image: sanitizeText(document.getElementById("site-quick-img-1")?.value || "", 2000),
          card2Image: sanitizeText(document.getElementById("site-quick-img-2")?.value || "", 2000),
          card3Image: sanitizeText(document.getElementById("site-quick-img-3")?.value || "", 2000)
        },
        shop: {
          title: sanitizeText(document.getElementById("site-shop-title")?.value || "", 1200),
          subtitle: sanitizeText(document.getElementById("site-shop-subtitle")?.value || "", 2000),
          heroImage: sanitizeText(document.getElementById("site-shop-hero-img")?.value || "", 2000)
        },
        blog: {
          title: sanitizeText(document.getElementById("site-blog-title")?.value || "", 1200),
          subtitle: sanitizeText(document.getElementById("site-blog-subtitle")?.value || "", 2000),
          heroImage: sanitizeText(document.getElementById("site-blog-hero-img")?.value || "", 2000)
        }
      };

      await apiRequest("/api/site-content", { method: "PUT", body: JSON.stringify(payload) });
      await reloadAndRender("Website content updated.");
    } catch (error) {
      setDashStatus(error.message, "error");
    }
  });
}

function setupAutoSlug(sourceId, slugId) {
  const source = document.getElementById(sourceId);
  const slug = document.getElementById(slugId);
  if (!source || !slug) return;
  source.addEventListener("input", () => {
    if (!slug.value) slug.value = slugify(source.value);
  });
}

async function initializeDashboard() {
  try {
    setDashStatus("Loading dashboard...", "info");
    setupRoleSwitcher();
    setupGlobalActions();
    setupLeadControls();
    setupIntegrationControls();
    setupPostFilters();

    setupModuleCrud({
      formId: "location-form",
      tableBodyId: "location-table-body",
      resetId: "location-reset",
      hiddenId: "location-id",
      endpoint: "/api/locations",
      itemKey: "locations",
      successLabel: "Location",
      fillForm: fillLocationForm,
      buildPayload: () => ({
        city: sanitizeText(document.getElementById("location-city")?.value || "", 180),
        slug: sanitizeText(document.getElementById("location-slug")?.value || slugify(document.getElementById("location-city")?.value || ""), 120),
        imageUrl: sanitizeText(document.getElementById("location-image")?.value || "", 2000),
        published: Boolean(document.getElementById("location-published")?.checked),
        intro: sanitizeText(document.getElementById("location-intro")?.value || "", 2000),
        servicesSummary: sanitizeText(document.getElementById("location-services")?.value || "", 2000),
        testimonial: sanitizeText(document.getElementById("location-testimonial")?.value || "", 500),
        mapNote: sanitizeText(document.getElementById("location-map")?.value || "", 500)
      })
    });

    setupModuleCrud({
      formId: "service-form",
      tableBodyId: "service-table-body",
      resetId: "service-reset",
      hiddenId: "service-id",
      endpoint: "/api/service-pages",
      itemKey: "servicePages",
      successLabel: "Service",
      fillForm: fillServiceForm,
      buildPayload: () => ({
        name: sanitizeText(document.getElementById("service-name")?.value || "", 180),
        slug: sanitizeText(document.getElementById("service-slug")?.value || slugify(document.getElementById("service-name")?.value || ""), 120),
        imageUrl: sanitizeText(document.getElementById("service-image")?.value || "", 2000),
        active: Boolean(document.getElementById("service-active")?.checked),
        pricingNote: sanitizeText(document.getElementById("service-pricing")?.value || "", 260),
        description: sanitizeText(document.getElementById("service-description")?.value || "", 2000)
      })
    });

    setupModuleCrud({
      formId: "promotion-form",
      tableBodyId: "promotion-table-body",
      resetId: "promotion-reset",
      hiddenId: "promotion-id",
      endpoint: "/api/promotions",
      itemKey: "promotions",
      successLabel: "Promotion",
      fillForm: fillPromotionForm,
      buildPayload: () => ({
        title: sanitizeText(document.getElementById("promotion-title")?.value || "", 180),
        ctaText: sanitizeText(document.getElementById("promotion-cta")?.value || "", 120),
        startDate: document.getElementById("promotion-start")?.value || formatDateInput(new Date()),
        endDate: document.getElementById("promotion-end")?.value || formatDateInput(new Date()),
        status: document.getElementById("promotion-status")?.value || "draft",
        bannerImage: sanitizeText(document.getElementById("promotion-banner")?.value || "", 2000),
        pageTargets: parseList(document.getElementById("promotion-pages")?.value || ""),
        cityTargets: parseList(document.getElementById("promotion-cities")?.value || ""),
        description: sanitizeText(document.getElementById("promotion-description")?.value || "", 2000)
      })
    });

    setupModuleCrud({
      formId: "post-form",
      tableBodyId: "post-table-body",
      resetId: "post-reset",
      hiddenId: "post-id",
      endpoint: "/api/posts",
      itemKey: "posts",
      successLabel: "Post",
      fillForm: fillPostForm,
      buildPayload: () => ({
        title: sanitizeText(document.getElementById("post-title")?.value || "", 180),
        slug: sanitizeText(document.getElementById("post-slug")?.value || slugify(document.getElementById("post-title")?.value || ""), 120),
        category: sanitizeText(document.getElementById("post-category")?.value || "", 120),
        status: document.getElementById("post-status")?.value || "draft",
        postType: document.getElementById("post-type")?.value || "blog",
        priceText: sanitizeText(document.getElementById("post-price")?.value || "", 120),
        buyUrl: sanitizeText(document.getElementById("post-buy-url")?.value || "", 2000),
        badge: sanitizeText(document.getElementById("post-badge")?.value || "", 120),
        publishDate: document.getElementById("post-publish-date")?.value || formatDateInput(new Date()),
        imageUrl: sanitizeText(document.getElementById("post-image")?.value || "", 2000),
        metaTitle: sanitizeText(document.getElementById("post-meta-title")?.value || "", 260),
        metaDescription: sanitizeText(document.getElementById("post-meta-description")?.value || "", 260),
        excerpt: sanitizeText(document.getElementById("post-excerpt")?.value || "", 2000),
        content: sanitizeText(document.getElementById("post-content")?.value || "", 20000),
        mediaUrls: parseUrlList(document.getElementById("post-media-urls")?.value || "")
      })
    });

    setupModuleCrud({
      formId: "directory-form",
      tableBodyId: "directory-table-body",
      resetId: "directory-reset",
      hiddenId: "directory-id",
      endpoint: "/api/directories",
      itemKey: "directories",
      successLabel: "Directory",
      fillForm: fillDirectoryForm,
      updateMethod: "PATCH",
      buildPayload: () => ({
        name: sanitizeText(document.getElementById("directory-name")?.value || "", 180),
        status: document.getElementById("directory-status")?.value || "pending",
        url: sanitizeText(document.getElementById("directory-url")?.value || "", 2000),
        manualUpdatedAt: sanitizeText(document.getElementById("directory-updated")?.value || "", 120),
        loginNotes: sanitizeText(document.getElementById("directory-login")?.value || "", 2000)
      })
    });

    setupModuleCrud({
      formId: "review-form",
      tableBodyId: "review-table-body",
      resetId: "review-reset",
      hiddenId: "review-id",
      endpoint: "/api/reviews",
      itemKey: "reviews",
      successLabel: "Review",
      fillForm: fillReviewForm,
      buildPayload: () => ({
        reviewerName: sanitizeText(document.getElementById("review-name")?.value || "", 180),
        source: sanitizeText(document.getElementById("review-source")?.value || "", 120),
        rating: Number(document.getElementById("review-rating")?.value || 5),
        approved: Boolean(document.getElementById("review-approved")?.checked),
        city: sanitizeText(document.getElementById("review-city")?.value || "", 120),
        service: sanitizeText(document.getElementById("review-service")?.value || "", 120),
        mediaUrl: sanitizeText(document.getElementById("review-media")?.value || "", 2000),
        quote: sanitizeText(document.getElementById("review-quote")?.value || "", 2000)
      })
    });

    setupModuleCrud({
      formId: "plan-form",
      tableBodyId: "plan-table-body",
      resetId: "plan-reset",
      hiddenId: "plan-id",
      endpoint: "/api/maintenance/plans",
      itemKey: "maintenancePlans",
      successLabel: "Plan",
      fillForm: fillPlanForm,
      buildPayload: () => ({
        name: sanitizeText(document.getElementById("plan-name")?.value || "", 180),
        tier: sanitizeText(document.getElementById("plan-tier")?.value || "", 120),
        price: Number(document.getElementById("plan-price")?.value || 0),
        billingCycle: document.getElementById("plan-billing")?.value || "monthly",
        status: document.getElementById("plan-status")?.value || "active",
        features: parseList(document.getElementById("plan-features")?.value || "")
      })
    });

    setupModuleCrud({
      formId: "member-form",
      tableBodyId: "member-table-body",
      resetId: "member-reset",
      hiddenId: "member-id",
      endpoint: "/api/maintenance/members",
      itemKey: "maintenanceMembers",
      successLabel: "Member",
      fillForm: fillMemberForm,
      buildPayload: () => ({
        name: sanitizeText(document.getElementById("member-name")?.value || "", 180),
        email: sanitizeText(document.getElementById("member-email")?.value || "", 260),
        company: sanitizeText(document.getElementById("member-company")?.value || "", 260),
        planId: sanitizeText(document.getElementById("member-plan")?.value || "", 120),
        startDate: document.getElementById("member-start")?.value || formatDateInput(new Date()),
        status: document.getElementById("member-status")?.value || "active",
        notes: sanitizeText(document.getElementById("member-notes")?.value || "", 2000)
      })
    });

    setupModuleCrud({
      formId: "user-form",
      tableBodyId: "user-table-body",
      resetId: "user-reset",
      hiddenId: "user-id",
      endpoint: "/api/users",
      itemKey: "users",
      successLabel: "User",
      fillForm: fillUserForm,
      buildPayload: () => ({
        name: sanitizeText(document.getElementById("user-name")?.value || "", 180),
        email: sanitizeText(document.getElementById("user-email")?.value || "", 260),
        role: document.getElementById("user-role")?.value || "marketing",
        status: document.getElementById("user-status")?.value || "active"
      })
    });

    setupSettingsForm();
    setupSiteContentForm();
    setupAutoSlug("location-city", "location-slug");
    setupAutoSlug("service-name", "service-slug");
    setupAutoSlug("post-title", "post-slug");

    const today = formatDateInput(new Date());
    if (!document.getElementById("promotion-start")?.value) document.getElementById("promotion-start").value = today;
    if (!document.getElementById("promotion-end")?.value) document.getElementById("promotion-end").value = today;
    if (!document.getElementById("post-publish-date")?.value) document.getElementById("post-publish-date").value = today;
    if (!document.getElementById("member-start")?.value) document.getElementById("member-start").value = today;

    await loadDashboard();
    renderAll();
    applyPermissions();
    setDashStatus("Back office ready.", "success");
  } catch (error) {
    setDashStatus(error.message || "Failed to load dashboard.", "error");
  }
}

initializeDashboard();
