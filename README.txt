Readme · MDCopy🚑 Ambulance Dispatch Optimizer
Real-time emergency response using Dijkstra + Greedy Matching

📸 Screenshots
Initial State
https://github.com/sukhijashivam/Ambulance-Dispatch-Optimizer/blob/main/screenshots/Screenshot%202026-04-29%20235140.png
After Dispatch
https://github.com/sukhijashivam/Ambulance-Dispatch-Optimizer/blob/main/screenshots/Screenshot%202026-04-29%20235140.png

✅ System Components
1. C++ Dispatch Engine (algorithms/dispatch_engine.exe)

Dijkstra's Algorithm — finds shortest routes
Greedy Dispatcher — assigns nearest ambulance
File Output — writes results to algorithms/output.txt

2. Python Flask Backend (backend/app.py — Port 5000)

POST /api/dispatch
GET /api/graph
GET /api/status
CORS Enabled

3. Frontend Web App (frontend/ — Port 8000)

Map: Leaflet.js (no API key needed)
Emergency queue, ambulance status, route visualization


📁 Project Structure
AMBULANCE_OPTIMIZER/
├── algorithms/
│   ├── main.cpp
│   ├── dijkstra.cpp
│   ├── graph.cpp
│   ├── dispatcher.cpp
│   ├── dispatch_engine.exe
│   ├── output.txt
│   └── Makefile
├── backend/
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── data/
│   ├── ambulances.json
│   └── city_graph.json
└── START_SYSTEM.bat

🧠 Algorithm Flow
Input:  Emergency requests with location & priority
   ↓
Sort:   By priority (Critical first)
   ↓
Process: For each emergency:
   • Find all available ambulances
   • Run Dijkstra from each ambulance to emergency
   • Pick closest ambulance (greedy)
   • Mark as dispatched
   ↓
Output: Route, distance, ETA for each dispatch
Routing: Dijkstra  |  Assignment: Greedy  |  Complexity: O((V+E) log V)

🗺️ Graph Structure

10 nodes (0–9): Hospital, Stations, Market, etc.
13 edges: Connected by roads with distances
3 ambulances: Starting at nodes 0, 3, 7


🚀 How to Run
Compile C++
bashcd algorithms && make
Run Backend
bashcd backend && python app.py
Run Frontend
bashcd frontend && python -m http.server 8000
Run All (Windows)
START_SYSTEM.bat
Open: http://localhost:8000

🖥️ How to Use

Select Location Node (0–9), Priority, and Type
Click + Add to Queue
Click 🚀 Dispatch Ambulances
View routes on map and results in the right panel


📤 Output Example
DISPATCH|ambulance:3|emergency:1|distance:3.5|eta:5.25|route:7-8-9|success:1
DISPATCH|ambulance:2|emergency:2|distance:7|eta:10.5|route:3-6-8-7-5|success:1
DISPATCH|ambulance:1|emergency:3|distance:4|eta:6|route:0-2|success:1

🔧 Troubleshooting
ProblemFixFrontend won't connectMake sure both terminals are running, check ports 5000 and 8000Dispatch returns no resultsCheck algorithms/output.txt exists, recompile if neededMap doesn't loadLeaflet loads from CDN — check internet connection

🔮 Planned Improvements

Real-time emergency handling queue
Database persistence
Advanced ambulance tracking
Traffic simulation
Mobile app
