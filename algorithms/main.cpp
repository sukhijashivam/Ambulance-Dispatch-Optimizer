#include <iostream>
#include <vector>
#include "graph.h"
#include "dijkstra.h"
#include "dispatcher.h"

using namespace std;

int main() {
    cout << "STEP 1: Program started" << endl;

    try {
        cout << "STEP 2: Creating graph" << endl;

        Graph city(10);

        city.addEdge(0, 1, 2.5);
        city.addEdge(0, 2, 4.0);
        city.addEdge(1, 3, 3.0);
        city.addEdge(1, 4, 1.5);
        city.addEdge(2, 4, 2.0);
        city.addEdge(2, 5, 5.0);
        city.addEdge(3, 6, 2.0);
        city.addEdge(4, 6, 3.5);
        city.addEdge(4, 7, 2.0);
        city.addEdge(5, 7, 1.5);
        city.addEdge(6, 8, 1.0);
        city.addEdge(7, 8, 2.5);
        city.addEdge(8, 9, 1.0);

        cout << "STEP 3: Graph built" << endl;

        Dispatcher dispatcher(city);

        dispatcher.addAmbulance({1, 0, true, "available"});
        dispatcher.addAmbulance({2, 3, true, "available"});
        dispatcher.addAmbulance({3, 7, true, "available"});

        cout << "STEP 4: Ambulances added" << endl;

        vector<Emergency> emergencies = {
            {1, 9, 1, "cardiac"},
            {2, 5, 2, "accident"},
            {3, 2, 3, "injury"}
        };

        cout << "STEP 5: Emergencies created" << endl;

        vector<DispatchResult> results = dispatcher.handleAll(emergencies);

        cout << "STEP 6: Dispatcher finished" << endl;
        cout << "Results size: " << results.size() << endl;

        for (auto& r : results) {
            cout << "DISPATCH|"
                 << "ambulance:" << r.ambulanceId << "|"
                 << "emergency:" << r.emergencyId << "|"
                 << "distance:" << r.distance << "|"
                 << "eta:" << r.eta << "|route:";

            for (size_t i = 0; i < r.route.size(); i++) {
                if (i > 0) cout << "-";
                cout << r.route[i];
            }

            cout << "|success:1" << endl;
        }

        cout << "STEP 7: Done" << endl;

        return 0;

    } catch (const exception& e) {
        cout << "ERROR: " << e.what() << endl;
        return 1;
    }
}