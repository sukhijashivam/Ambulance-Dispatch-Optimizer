// graph.cpp
// Actual implementation of Graph class

#include "graph.h"
#include <iostream>
using namespace std;

// Constructor: Initialize adjacency list with n empty lists
// When we create Graph(10), we get 10 empty vectors ready for edges
Graph::Graph(int n) {
    numNodes = n;
    adjList.resize(n);  // Create n empty vectors
}

// Add a bidirectional road between node u and node v
// "Bidirectional" = you can drive both ways (like most city roads)
void Graph::addEdge(int u, int v, double w) {
    // u → v with weight w
    adjList[u].push_back({v, w});
    // v → u with weight w (same road, other direction)
    adjList[v].push_back({u, w});
}

void Graph::printGraph() {
    for (int i = 0; i < numNodes; i++) {
        cout << "Node " << i << " connects to: ";
        for (Edge e : adjList[i]) {
            cout << "(" << e.destination << ", " << e.weight << "km) ";
        }
        cout << endl;
    }
}