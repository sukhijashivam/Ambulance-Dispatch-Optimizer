// dispatcher.h
#ifndef DISPATCHER_H
#define DISPATCHER_H

#include "graph.h"
#include "dijkstra.h"
#include <vector>
#include <string>
using namespace std;

// Represents one ambulance unit
struct Ambulance {
    int id;
    int locationNode;    // Which intersection it's parked at
    bool isAvailable;    // Is it free or on a mission?
    string status;       // "available", "dispatched", "returning"
};

// One emergency request coming in
struct Emergency {
    int id;
    int locationNode;    // Where is the emergency?
    int priority;        // 1 = Critical, 2 = High, 3 = Normal
    string type;         // "cardiac", "accident", "fire"
};

// Result of one dispatch decision
struct DispatchResult {
    int ambulanceId;
    int emergencyId;
    double distance;
    double eta;
    vector<int> route;
    bool success;         // false if no ambulance available
};

class Dispatcher {
public:
    vector<Ambulance> ambulances;
    Graph& cityGraph;
    
    Dispatcher(Graph& g);
    void addAmbulance(Ambulance a);
    
    // Assign best ambulance to ONE emergency
    DispatchResult assignBest(Emergency& emergency);
    
    // Handle MULTIPLE emergencies (priority-sorted)
    vector<DispatchResult> handleAll(vector<Emergency>& emergencies);
    
    // Free ambulance after job done
    void releaseAmbulance(int ambulanceId);
};

#endif