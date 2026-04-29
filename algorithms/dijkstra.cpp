#include "dijkstra.h"
#include <queue>
#include <vector>
#include <algorithm>   // 🔥 REQUIRED for reverse
#include <limits>      // 🔥 for numeric_limits
using namespace std;

PathResult dijkstra(Graph& g, int source, int destination) {
    int n = g.numNodes;

    // Use proper infinity
    const double INF = numeric_limits<double>::max();

    vector<double> dist(n, INF);
    vector<int> prev(n, -1);
    vector<bool> visited(n, false);

    // Min-heap: (distance, node)
    priority_queue<pair<double,int>, 
                   vector<pair<double,int>>, 
                   greater<pair<double,int>>> minHeap;

    dist[source] = 0.0;
    minHeap.push({0.0, source});

    while (!minHeap.empty()) {

        // ❗ FIX: avoid structured binding (or compile with -std=c++17)
        auto top = minHeap.top();
        int u = top.second;
        minHeap.pop();

        if (visited[u]) continue;
        visited[u] = true;

        // Early exit
        if (u == destination) break;

        // Relaxation
        for (Edge& edge : g.adjList[u]) {
            int v = edge.destination;
            double w = edge.weight;

            if (!visited[v] && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                prev[v] = u;
                minHeap.push({dist[v], v});
            }
        }
    }

    // 🔥 Handle unreachable case
    if (dist[destination] == INF) {
        return {INF, {}, -1};  // No path, ETA invalid
    }

    // Path reconstruction
    vector<int> path;
    int current = destination;

    while (current != -1) {
        path.push_back(current);
        current = prev[current];
    }

    reverse(path.begin(), path.end());

    // ETA calculation (avoid garbage values)
    double eta = (dist[destination] / 40.0) * 60.0;

    return {dist[destination], path, eta};
}