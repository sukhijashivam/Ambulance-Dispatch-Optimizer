// graph.h
// A header file declares your data structures and functions
// Think of it as a "menu" — actual cooking happens in graph.cpp

#ifndef GRAPH_H   // Include guard — prevents double-including this file
#define GRAPH_H

#include <vector>
#include <string>
using namespace std;

// One road segment between two intersections
struct Edge {
    int destination;  // Which node this road leads to
    double weight;    // Distance in km or time in minutes
};

// The entire city road network
class Graph {
public:
    int numNodes;                        // Total intersections
    vector<vector<Edge>> adjList;        // Adjacency list
    
    Graph(int n);                        // Constructor
    void addEdge(int u, int v, double w); // Add a road (bidirectional)
    void printGraph();                   // Debug helper
};

#endif