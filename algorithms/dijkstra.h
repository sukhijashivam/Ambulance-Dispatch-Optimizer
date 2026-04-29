// dijkstra.h

#ifndef DIJKSTRA_H
#define DIJKSTRA_H

#include "graph.h"
#include <vector>
#include <climits>  // For INT_MAX (infinity)
using namespace std;

struct PathResult {
    double distance;          // Total shortest distance
    vector<int> path;         // Sequence of nodes: [0, 3, 7, 12]
    double estimatedTimeMin;  // ETA in minutes
};

PathResult dijkstra(Graph& g, int source, int destination);

#endif