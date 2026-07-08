const API_BASE = window.location.origin;

let map;
let ambulances = [];   // {id, name, address, lat, lng, marker}
let emergencies = [];  // {id, name, address, priority, type, lat, lng, marker}
let routeLayers = [];

let ambIdCounter = 1;
let emIdCounter = 1;

const ROUTE_COLORS = ["#22c55e", "#3b82f6", "#f97316", "#eab308", "#a855f7", "#ec4899"];

const emergencyEmoji = { cardiac: "❤️", accident: "🚗", fire: "🔥", injury: "🩹" };
const priorityLabel = { "1": "🔴 Critical", "2": "🟠 High", "3": "🟡 Normal" };

// Tracks the exact location the user picked from the suggestion dropdown,
// so "Add" doesn't need to re-geocode free-typed text that might resolve
// to a different place than what was shown in the dropdown.
let selectedAmbLocation = null;
let selectedEmLocation = null;

function debounce(fn, delay) {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

async function fetchSuggestions(query) {
    if (!query || query.trim().length < 3) return [];
    const res = await fetch(`${API_BASE}/api/autocomplete?query=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok) return [];
    return data.suggestions || [];
}

function renderSuggestions(dropdownEl, suggestions, onSelect) {
    if (suggestions.length === 0) {
        dropdownEl.innerHTML = `<div class="suggestion-empty">No matches found</div>`;
        dropdownEl.classList.add("active");
        return;
    }
    dropdownEl.innerHTML = suggestions.map((s, idx) =>
        `<div class="suggestion-item" data-idx="${idx}">${s.display_name}</div>`
    ).join("");
    dropdownEl.classList.add("active");

    dropdownEl.querySelectorAll(".suggestion-item").forEach(el => {
        el.addEventListener("click", () => {
            const s = suggestions[parseInt(el.dataset.idx, 10)];
            onSelect(s);
            dropdownEl.classList.remove("active");
        });
    });
}

function attachAutocomplete(inputEl, dropdownEl, onSelect) {
    const debounced = debounce(async () => {
        const suggestions = await fetchSuggestions(inputEl.value);
        renderSuggestions(dropdownEl, suggestions, onSelect);
    }, 400);

    inputEl.addEventListener("input", debounced);

    // Hide dropdown when clicking elsewhere
    document.addEventListener("click", (e) => {
        if (e.target !== inputEl && !dropdownEl.contains(e.target)) {
            dropdownEl.classList.remove("active");
        }
    });
}

function initMap() {
    map = L.map('map').setView([30.34, 76.38], 12); // default view (Patiala) - re-centers once points are added

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
}

async function geocodeAddress(address) {
    const res = await fetch(`${API_BASE}/api/geocode?address=${encodeURIComponent(address)}`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Geocoding failed");
    }
    return data; // { lat, lng, display_name }
}

function fitMapToAllPoints() {
    const allMarkers = [...ambulances, ...emergencies].map(p => p.marker).filter(Boolean);
    if (allMarkers.length === 0) return;
    const group = L.featureGroup(allMarkers);
    map.fitBounds(group.getBounds().pad(0.2));
}

// ---------------- AMBULANCES ----------------

async function addAmbulance() {
    const nameInput = document.getElementById("ambName");
    const addressInput = document.getElementById("ambAddress");
    const address = addressInput.value.trim();

    if (!address) {
        alert("Please enter an address for the ambulance station.");
        return;
    }

    try {
        // If the user picked a suggestion from the dropdown, we already have
        // its exact coordinates - no need to geocode again.
        const geo = (selectedAmbLocation && selectedAmbLocation.display_name === address)
            ? selectedAmbLocation
            : await geocodeAddress(address);

        const name = nameInput.value.trim() || `Ambulance ${ambIdCounter}`;

        const marker = L.marker([geo.lat, geo.lng])
            .addTo(map)
            .bindPopup(`🚑 ${name}<br><small>${geo.display_name}</small>`);

        ambulances.push({
            id: ambIdCounter++,
            name,
            address: geo.display_name,
            lat: geo.lat,
            lng: geo.lng,
            marker
        });

        nameInput.value = "";
        addressInput.value = "";
        selectedAmbLocation = null;
        renderAmbulanceList();
        fitMapToAllPoints();
    } catch (err) {
        alert(err.message);
    }
}

function renderAmbulanceList() {
    const container = document.getElementById("ambulanceList");
    if (ambulances.length === 0) {
        container.innerHTML = `<p class="empty-msg">No ambulances added</p>`;
        return;
    }
    container.innerHTML = ambulances.map(a => `
        <div class="queue-item">
            <div>
                🚑 <b>${a.name}</b><br>
                <small style="color: var(--text-secondary)">${a.address}</small>
            </div>
        </div>
    `).join("");
}

// ---------------- EMERGENCIES ----------------

async function addEmergency() {
    const addressInput = document.getElementById("emAddress");
    const priority = document.getElementById("emPriority").value;
    const type = document.getElementById("emType").value;
    const address = addressInput.value.trim();

    if (!address) {
        alert("Please enter an emergency address.");
        return;
    }

    try {
        const geo = (selectedEmLocation && selectedEmLocation.display_name === address)
            ? selectedEmLocation
            : await geocodeAddress(address);

        const name = `Emergency ${emIdCounter}`;

        const icon = L.divIcon({
            html: `<div style="font-size:28px;">🚨</div>`,
            className: "",
            iconSize: [28, 28]
        });

        const marker = L.marker([geo.lat, geo.lng], { icon })
            .addTo(map)
            .bindPopup(`🚨 ${name} (${emergencyEmoji[type]})<br><small>${geo.display_name}</small>`);

        emergencies.push({
            id: emIdCounter++,
            name,
            address: geo.display_name,
            priority,
            type,
            lat: geo.lat,
            lng: geo.lng,
            marker
        });

        addressInput.value = "";
        selectedEmLocation = null;
        renderEmergencyQueue();
        fitMapToAllPoints();
    } catch (err) {
        alert(err.message);
    }
}

function renderEmergencyQueue() {
    const container = document.getElementById("emergencyQueue");
    if (emergencies.length === 0) {
        container.innerHTML = `<p class="empty-msg">No emergencies queued</p>`;
        return;
    }
    container.innerHTML = emergencies.map(e => `
        <div class="queue-item priority-${e.priority}">
            <div>
                ${emergencyEmoji[e.type]} <b>${e.name}</b> — ${priorityLabel[e.priority]}<br>
                <small style="color: var(--text-secondary)">${e.address}</small>
            </div>
        </div>
    `).join("");
}

// ---------------- OPTIMIZE DISPATCH ----------------

function clearRoutes() {
    routeLayers.forEach(l => map.removeLayer(l));
    routeLayers = [];
}

async function optimizeDispatch() {
    if (ambulances.length === 0 || emergencies.length === 0) {
        alert("Add at least one ambulance and one emergency first.");
        return;
    }

    clearRoutes();

    const payload = {
        ambulances: ambulances.map(a => ({ id: a.id, name: a.name, lat: a.lat, lng: a.lng })),
        emergencies: emergencies.map(e => ({ id: e.id, name: e.name, lat: e.lat, lng: e.lng }))
    };

    const matrixDiv = document.getElementById("distanceMatrix");
    const resultsDiv = document.getElementById("dispatchResults");
    matrixDiv.innerHTML = `<p class="empty-msg">Calculating real road distances...</p>`;
    resultsDiv.innerHTML = `<p class="empty-msg">Solving optimal assignment...</p>`;

    try {
        const res = await fetch(`${API_BASE}/api/dispatch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Dispatch failed");

        renderDistanceMatrix(data.matrix);
        renderAssignment(data.assignment, data.total_distance_km);
        drawAssignmentRoutes(data.assignment);
    } catch (err) {
        matrixDiv.innerHTML = `<p class="empty-msg">Error: ${err.message}</p>`;
        resultsDiv.innerHTML = "";
    }
}

function renderDistanceMatrix(matrix) {
    const matrixDiv = document.getElementById("distanceMatrix");

    const emNames = emergencies.map(e => e.name);
    let html = `<table class="dist-table"><thead><tr><th></th>`;
    emNames.forEach(name => html += `<th>${name}</th>`);
    html += `</tr></thead><tbody>`;

    matrix.forEach(row => {
        const amb = ambulances.find(a => a.id === row.ambulance_id);
        html += `<tr><td class="row-label">${amb ? amb.name : row.ambulance_id}</td>`;
        row.distances.forEach(cell => {
            const text = cell.distance_km !== null ? `${cell.distance_km} km` : "N/A";
            html += `<td>${text}</td>`;
        });
        html += `</tr>`;
    });

    html += `</tbody></table>`;
    matrixDiv.innerHTML = html;
}

function renderAssignment(assignment, totalDistanceKm) {
    const resultsDiv = document.getElementById("dispatchResults");

    if (assignment.length === 0) {
        resultsDiv.innerHTML = `<p class="empty-msg">No valid assignment found</p>`;
        return;
    }

    let html = assignment.map((a, idx) => `
        <div class="result-item" style="border-left-color: ${ROUTE_COLORS[idx % ROUTE_COLORS.length]}">
            <div class="result-header">
                <span>🚑 ${a.ambulance_name} → 🚨 ${a.emergency_name}</span>
            </div>
            <div class="result-detail">
                <span>Distance: ${a.distance_km} km</span>
                <span>ETA: ${a.eta_min} min</span>
            </div>
        </div>
    `).join("");

    html += `<div class="algo-item" style="margin-top: 8px;">
        <strong>Total distance</strong><span>${totalDistanceKm} km</span>
    </div>`;

    resultsDiv.innerHTML = html;
}

function drawAssignmentRoutes(assignment) {
    assignment.forEach((a, idx) => {
        if (!a.route || a.route.length === 0) return;
        const line = L.polyline(a.route, {
            color: ROUTE_COLORS[idx % ROUTE_COLORS.length],
            weight: 5,
            opacity: 0.85
        }).addTo(map);
        routeLayers.push(line);
    });

    const allLayers = [...routeLayers, ...ambulances.map(a => a.marker), ...emergencies.map(e => e.marker)].filter(Boolean);
    if (allLayers.length > 0) {
        map.fitBounds(L.featureGroup(allLayers).getBounds().pad(0.15));
    }
}

initMap();

attachAutocomplete(
    document.getElementById("ambAddress"),
    document.getElementById("ambSuggestions"),
    (s) => {
        selectedAmbLocation = s;
        document.getElementById("ambAddress").value = s.display_name;
    }
);

attachAutocomplete(
    document.getElementById("emAddress"),
    document.getElementById("emSuggestions"),
    (s) => {
        selectedEmLocation = s;
        document.getElementById("emAddress").value = s.display_name;
    }
);
