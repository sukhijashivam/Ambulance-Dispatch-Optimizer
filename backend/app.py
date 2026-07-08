from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import numpy as np
import os
from scipy.optimize import linear_sum_assignment

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)


@app.route('/')
def serve_frontend():
    """Lets you open the whole app at http://127.0.0.1:5000/ instead of
    having to open frontend/index.html as a separate file."""
    return send_from_directory(FRONTEND_DIR, 'index.html')

# ---- External services (free, no API key needed) ----
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OSRM_TABLE_URL = "https://router.project-osrm.org/table/v1/driving/"
OSRM_ROUTE_URL = "https://router.project-osrm.org/route/v1/driving/"

# Nominatim's usage policy requires a real identifying User-Agent.
# Replace the contact email below with your own before deploying publicly.
HEADERS = {"User-Agent": "AmbulanceDispatchOptimizer/1.0 (contact: shivamsukhija002@gmail.com)"}


@app.route('/api/autocomplete', methods=['GET'])
def autocomplete():
    """Returns up to 5 matching real locations for a partial address, so the
    frontend can show a suggestion dropdown instead of blindly geocoding
    whatever the user finishes typing."""
    query = request.args.get('query', '').strip()
    if not query or len(query) < 3:
        return jsonify({"suggestions": []})

    try:
        params = {"q": query, "format": "json", "limit": 5, "addressdetails": 0}
        resp = requests.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        results = resp.json()
    except Exception as e:
        return jsonify({"error": f"Autocomplete service failed: {str(e)}"}), 502

    suggestions = [
        {
            "display_name": r["display_name"],
            "lat": float(r["lat"]),
            "lng": float(r["lon"])
        }
        for r in results
    ]
    return jsonify({"suggestions": suggestions})


@app.route('/api/geocode', methods=['GET'])
def geocode():
    """Converts a real address / place name into (lat, lng) using OpenStreetMap's
    Nominatim geocoder. Used by the frontend when the user types an address for
    an ambulance station or an emergency location."""
    query = request.args.get('address', '').strip()
    if not query:
        return jsonify({"error": "address query param is required"}), 400

    try:
        params = {"q": query, "format": "json", "limit": 1}
        resp = requests.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        results = resp.json()
    except Exception as e:
        return jsonify({"error": f"Geocoding service failed: {str(e)}"}), 502

    if not results:
        return jsonify({"error": f"No location found for '{query}'"}), 404

    place = results[0]
    return jsonify({
        "address": query,
        "display_name": place["display_name"],
        "lat": float(place["lat"]),
        "lng": float(place["lon"])
    })


def build_distance_matrix(ambulances, emergencies):
    """Single OSRM 'table' request returns real ROAD distance (m) and duration (s)
    between every ambulance and every emergency at once - much cheaper than calling
    the routing API once per pair."""
    all_points = ambulances + emergencies
    coord_str = ";".join(f"{p['lng']},{p['lat']}" for p in all_points)

    n_amb = len(ambulances)
    n_em = len(emergencies)
    sources = ";".join(str(i) for i in range(n_amb))
    destinations = ";".join(str(i) for i in range(n_amb, n_amb + n_em))

    url = f"{OSRM_TABLE_URL}{coord_str}"
    params = {
        "sources": sources,
        "destinations": destinations,
        "annotations": "distance,duration"
    }
    resp = requests.get(url, params=params, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    if data.get("code") != "Ok":
        raise RuntimeError(data.get("message", "OSRM table request failed"))

    return data["distances"], data["durations"]  # each: n_amb x n_em matrix (meters, seconds)


def get_route_geometry(start, end):
    """Real road route geometry between two points (for drawing on the map).
    Only called for the FINAL optimal pairs, not for every possible pair."""
    url = f"{OSRM_ROUTE_URL}{start['lng']},{start['lat']};{end['lng']},{end['lat']}"
    params = {"overview": "full", "geometries": "geojson"}
    resp = requests.get(url, params=params, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    if data.get("code") != "Ok" or not data.get("routes"):
        return []

    # OSRM returns [lng, lat] pairs; Leaflet expects [lat, lng].
    coords = data["routes"][0]["geometry"]["coordinates"]
    return [[lat, lng] for lng, lat in coords]


def to_cost_matrix(distances):
    """Converts the raw OSRM distance matrix (which may contain None for
    unreachable pairs) into a numpy float matrix with inf for unreachable cells,
    so the Hungarian algorithm never assigns an impossible pair."""
    return np.array(
        [[d if d is not None else np.inf for d in row] for row in distances],
        dtype=float
    )


@app.route('/api/dispatch', methods=['POST'])
def dispatch():
    body = request.get_json(force=True) or {}
    ambulances = body.get("ambulances", [])
    emergencies = body.get("emergencies", [])

    if not ambulances or not emergencies:
        return jsonify({"error": "At least one ambulance and one emergency are required"}), 400

    try:
        distances, durations = build_distance_matrix(ambulances, emergencies)
    except Exception as e:
        return jsonify({"error": f"Routing service failed: {str(e)}"}), 502

    cost_matrix = to_cost_matrix(distances)

    # Hungarian algorithm (scipy's linear_sum_assignment): finds the assignment
    # that minimizes TOTAL distance across ALL ambulance-emergency pairs at once.
    # This is different from "greedy nearest" - greedy can lock in a locally-good
    # choice early that forces a much worse pairing later; Hungarian looks at the
    # whole matrix together and guarantees the lowest possible combined distance.
    row_idx, col_idx = linear_sum_assignment(cost_matrix)

    # Full distance/ETA matrix - every ambulance vs every emergency - so the
    # frontend can show "from Ambulance 1 this emergency is X km, from
    # Ambulance 2 it's Y km" before revealing the final optimal choice.
    matrix_response = []
    for i, amb in enumerate(ambulances):
        row = []
        for j, em in enumerate(emergencies):
            d = distances[i][j]
            t = durations[i][j]
            row.append({
                "emergency_id": em["id"],
                "distance_km": round(d / 1000, 2) if d is not None else None,
                "duration_min": round(t / 60, 2) if t is not None else None
            })
        matrix_response.append({"ambulance_id": amb["id"], "distances": row})

    # Final optimal assignment - only these pairs get a real road route drawn.
    assignment = []
    for i, j in zip(row_idx, col_idx):
        if not np.isfinite(cost_matrix[i][j]):
            continue  # unreachable pair, skip
        amb = ambulances[i]
        em = emergencies[j]
        route = get_route_geometry(amb, em)
        assignment.append({
            "ambulance_id": amb["id"],
            "ambulance_name": amb.get("name", f"Ambulance {amb['id']}"),
            "emergency_id": em["id"],
            "emergency_name": em.get("name", f"Emergency {em['id']}"),
            "distance_km": round(distances[i][j] / 1000, 2),
            "eta_min": round(durations[i][j] / 60, 2),
            "route": route
        })

    total_distance_km = round(sum(a["distance_km"] for a in assignment), 2)

    return jsonify({
        "matrix": matrix_response,
        "assignment": assignment,
        "total_distance_km": total_distance_km
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
