let map;
let routeLayers = [];
let ambulanceMarkers = [];
let emergencyMarkers = [];

const nodeCoords = {
    0: [31.634, 74.872],
    1: [31.642, 74.881],
    2: [31.628, 74.891],
    3: [31.651, 74.878],
    4: [31.638, 74.895],
    5: [31.622, 74.905],
    6: [31.655, 74.899],
    7: [31.645, 74.912],
    8: [31.658, 74.920],
    9: [31.662, 74.931]
};

function initMap() {
    map = L.map('map').setView([31.64, 74.88], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    addAmbulance(1, 0);
    addAmbulance(2, 3);
    addAmbulance(3, 7);
}

function addAmbulance(id, node) {
    let marker = L.marker(nodeCoords[node])
        .addTo(map)
        .bindPopup(`🚑 Ambulance ${id}`);

    ambulanceMarkers[id] = marker;
}

function drawEmergency(node) {

    const emergencyIcon = L.divIcon({
        html: "<div style='font-size:32px;'>🚨</div>",
        className: "",
        iconSize: [30, 30]
    });

    let marker = L.marker(nodeCoords[node], {
        icon: emergencyIcon
    }).addTo(map);

    emergencyMarkers.push(marker);
}

function drawRoute(route) {
    let coords = route.map(n => nodeCoords[n]);

    let line = L.polyline(coords, {
        color: "green",
        weight: 5
    }).addTo(map);

    routeLayers.push(line);

    return coords;
}

function animateAmbulance(id, coords) {

    let marker = ambulanceMarkers[id];
    if (!marker) return;   // prevent crash

    let segment = 0;
    let progress = 0;

    function move() {

        if (segment >= coords.length - 1) return;

        let [lat1, lng1] = coords[segment];
        let [lat2, lng2] = coords[segment + 1];

        progress += 0.02;   // 🔥 smaller = slower

        let lat = lat1 + (lat2 - lat1) * progress;
        let lng = lng1 + (lng2 - lng1) * progress;

        marker.setLatLng([lat, lng]);

        if (progress >= 1) {
            progress = 0;
            segment++;
        }

        requestAnimationFrame(move);
    }

    move();
}

async function dispatchAmbulances() {

    routeLayers.forEach(l => map.removeLayer(l));
    emergencyMarkers.forEach(e => map.removeLayer(e));
    routeLayers = [];
    emergencyMarkers = [];

    const resultsDiv = document.getElementById("dispatchResults");

    try {
        const res = await fetch("http://127.0.0.1:5000/api/dispatch", {
            method: "POST"
        });

        const data = await res.json();

        let html = "";

        data.dispatches.forEach(d => {

            drawEmergency(d.route[d.route.length - 1]);

            let coords = drawRoute(d.route);

            animateAmbulance(d.ambulance, coords);

            html += `
                <div>
                    🚑 ${d.ambulance} → 🚨 ${d.emergency}<br>
                    ETA: ${d.eta} min
                </div>
            `;
        });

        resultsDiv.innerHTML = html;

    } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = "Error";
    }
}

initMap();