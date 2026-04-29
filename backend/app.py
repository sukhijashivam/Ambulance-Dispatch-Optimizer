from flask import Flask, jsonify
from flask_cors import CORS
import heapq

app = Flask(__name__)
CORS(app)

graph = {
    0: [(1,2.5),(2,4.0)],
    1: [(0,2.5),(3,3.0),(4,1.5)],
    2: [(0,4.0),(4,2.0),(5,5.0)],
    3: [(1,3.0),(6,2.0)],
    4: [(1,1.5),(2,2.0),(6,3.5),(7,2.0)],
    5: [(2,5.0),(7,1.5)],
    6: [(3,2.0),(4,3.5),(8,1.0)],
    7: [(4,2.0),(5,1.5),(8,2.5)],
    8: [(6,1.0),(7,2.5),(9,1.0)],
    9: [(8,1.0)]
}

def dijkstra(start, end):
    heap = [(0, start, [])]
    visited = set()

    while heap:
        dist, node, path = heapq.heappop(heap)

        if node in visited:
            continue
        visited.add(node)

        path = path + [node]

        if node == end:
            return dist, path

        for nei, w in graph[node]:
            heapq.heappush(heap, (dist + w, nei, path))

    return float('inf'), []

@app.route('/api/dispatch', methods=['POST'])
def dispatch():

    ambulances = [
        {"id":1,"node":0},
        {"id":2,"node":3},
        {"id":3,"node":7}
    ]

    emergencies = [
        {"id":1,"node":9,"priority":1},
        {"id":2,"node":5,"priority":2},
        {"id":3,"node":2,"priority":3}
    ]

    emergencies.sort(key=lambda x: x["priority"])

    used = set()
    results = []

    for e in emergencies:
        best = None
        best_dist = float('inf')
        best_path = []

        for amb in ambulances:
            if amb["id"] in used:
                continue

            dist, path = dijkstra(amb["node"], e["node"])

            if dist < best_dist:
                best_dist = dist
                best = amb
                best_path = path

        if best:
            used.add(best["id"])

            results.append({
                "ambulance": best["id"],
                "emergency": e["id"],
                "distance": round(best_dist, 2),
                "eta": round(best_dist/40*60, 2),
                "route": best_path,
                "success": 1
            })

    return jsonify({"dispatches": results})

if __name__ == '__main__':
    app.run(debug=True, port=5000)