// dispatcher.cpp
#include "dispatcher.h"
#include <algorithm>
#include <iostream>
#include <climits>
using namespace std;

Dispatcher::Dispatcher(Graph& g) : cityGraph(g) {}

void Dispatcher::addAmbulance(Ambulance a) {
    ambulances.push_back(a);
}

// Find the BEST ambulance for a single emergency
// "Best" = closest available ambulance
DispatchResult Dispatcher::assignBest(Emergency& emergency) {
    DispatchResult result;
    result.emergencyId = emergency.id;
    result.success = false;
    
    double bestDistance = 1e18;  // Start with "infinity"
    int bestAmbulanceIdx = -1;
    PathResult bestPath;
    
    // Check EVERY ambulance
    for (size_t i = 0; i < ambulances.size(); i++) {
        
        // Skip ambulances that are busy
        if (!ambulances[i].isAvailable) continue;
        
        // Run Dijkstra from this ambulance to the emergency
        PathResult pr = dijkstra(cityGraph, 
                                  ambulances[i].locationNode, 
                                  emergency.locationNode);
        
        // Is this ambulance closer than our current best?
        if (pr.distance < bestDistance) {
            bestDistance = pr.distance;
            bestAmbulanceIdx = i;
            bestPath = pr;
        }
    }
    
    // If we found a valid ambulance
    if (bestAmbulanceIdx != -1) {
        // Mark it as busy
        ambulances[bestAmbulanceIdx].isAvailable = false;
        ambulances[bestAmbulanceIdx].status = "dispatched";
        
        result.ambulanceId = ambulances[bestAmbulanceIdx].id;
        result.distance = bestDistance;
        result.eta = bestPath.estimatedTimeMin;
        result.route = bestPath.path;
        result.success = true;
    }
    
    return result;
}

// Handle multiple emergencies — sort by priority first!
vector<DispatchResult> Dispatcher::handleAll(vector<Emergency>& emergencies) {
    
    // SORT: Priority 1 (Critical) handled BEFORE Priority 3 (Normal)
    // This is a greedy decision — always serve most urgent first
    sort(emergencies.begin(), emergencies.end(), 
         [](const Emergency& a, const Emergency& b) {
             return a.priority < b.priority;  // Smaller number = higher priority
         });
    
    vector<DispatchResult> results;
    
    for (Emergency& em : emergencies) {
        DispatchResult r = assignBest(em);
        results.push_back(r);
        
        if (!r.success) {
            cout << "WARNING: No ambulance available for Emergency " 
                 << em.id << endl;
        }
    }
    
    return results;
}

void Dispatcher::releaseAmbulance(int ambulanceId) {
    for (auto& amb : ambulances) {
        if (amb.id == ambulanceId) {
            amb.isAvailable = true;
            amb.status = "available";
            break;
        }
    }
}