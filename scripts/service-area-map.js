(function () {
  "use strict";

  var CHICAGO_CENTER = [41.8781, -87.6298];
  var RADIUS_MILES = 100;
  var RADIUS_METERS = RADIUS_MILES * 1609.344;

  function initServiceAreaMap() {
    if (typeof window.L === "undefined") {
      return;
    }

    var mapElement = document.getElementById("service-area-map");
    if (!mapElement || mapElement.dataset.mapReady === "true") {
      return;
    }

    mapElement.dataset.mapReady = "true";

    var map = L.map(mapElement, {
      scrollWheelZoom: false
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    var serviceCircle = L.circle(CHICAGO_CENTER, {
      radius: RADIUS_METERS,
      color: "#124474",
      weight: 2,
      fillColor: "#124474",
      fillOpacity: 0.15
    }).addTo(map);

    L.marker(CHICAGO_CENTER).addTo(map).bindPopup("Chicago, IL (Center)");
    map.fitBounds(serviceCircle.getBounds(), { padding: [16, 16] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initServiceAreaMap);
  } else {
    initServiceAreaMap();
  }
})();
