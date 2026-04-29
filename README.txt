===== AMBULANCE OPTIMIZER SYSTEM - COMPLETE =====

✅ SYSTEM COMPONENTS:

1. C++ Dispatch Engine (algorithms/dispatch_engine.exe)
   ├─ Dijkstra's Algorithm: Finds shortest routes
   ├─ Greedy Dispatcher: Assigns nearest ambulance
   ├─ File Output: writes to algorithms/output.txt
   └─ Status: WORKING ✓

2. Python Flask Backend (backend/app.py - Port 5000)
   ├─ API Endpoint: /api/dispatch
   ├─ Graph Endpoint: /api/graph
   ├─ Status Endpoint: /api/status
   ├─ CORS Enabled: Yes
   └─ Status: RUNNING ✓

3. Frontend Web App (frontend/ - Port 8000)
   ├─ Map: Leaflet.js (no API key needed)
   ├─ UI: Emergency queue, ambulance status
   ├─ Visualization: Routes, ambulances, results
   └─ Status: RUNNING ✓

===== HOW TO USE =====

1. Open: http://localhost:8000

2. Add Emergencies:
   - Select location (0-9 nodes)
   - Choose priority (Critical/High/Normal)
   - Select type (Cardiac/Accident/Fire/Injury)
   - Click "+ Add to Queue"

3. Run Dispatch:
   - Click "🚀 Dispatch Ambulances" button
   - System will:
     a) Run C++ dispatcher
     b) Calculate optimal routes
     c) Show results on map
     d) Display ambulance assignments

4. View Results:
   - Map shows routes in different colors
   - Right panel shows dispatch details
   - Ambulance status updates automatically

===== TECHNICAL DETAILS =====

Graph Structure:
- 10 nodes (0-9): Hospital, Stations, Market, etc.
- 13 edges: Connected by roads with distances
- 3 ambulances: Starting at nodes 0, 3, 7

Algorithm Flow:
Input:  Emergency requests with location & priority
   ↓
Sort:   By priority (1=Critical first)
   ↓
Process: For each emergency:
   • Find all available ambulances
   • Run Dijkstra from each ambulance to emergency
   • Pick closest ambulance (greedy)
   • Mark as dispatched
   ↓
Output: Route, distance, ETA for each dispatch

===== OUTPUT EXAMPLE =====

DISPATCH|ambulance:3|emergency:1|distance:3.5|eta:5.25|route:7-8-9|success:1
DISPATCH|ambulance:2|emergency:2|distance:7|eta:10.5|route:3-6-8-7-5|success:1
DISPATCH|ambulance:1|emergency:3|distance:4|eta:6|route:0-2|success:1

===== STOPPING THE SYSTEM =====

To stop servers:
- Close the Terminal windows, OR
- Kill individual processes:
  - Backend: Ctrl+C in backend terminal
  - Frontend: Ctrl+C in frontend terminal

===== FILES STRUCTURE =====

AMBULANCE_OPTIMIZER/
├─ algorithms/
│  ├─ main.cpp (dispatcher logic)
│  ├─ dijkstra.cpp (pathfinding)
│  ├─ graph.cpp (city graph)
│  ├─ dispatcher.cpp (ambulance assignment)
│  ├─ dispatch_engine.exe (compiled executable)
│  ├─ output.txt (results written here)
│  └─ Makefile (for compilation)
│
├─ backend/
│  ├─ app.py (Flask server)
│  ├─ venv/ (Python virtual environment)
│  └─ requirement.txt (dependencies)
│
├─ frontend/
│  ├─ index.html (page structure)
│  ├─ style.css (styling)
│  ├─ app.js (JavaScript logic)
│  └─ ... (leaflet.js CDN)
│
├─ data/
│  ├─ ambulances.json
│  └─ city_graph.json
│
└─ START_SYSTEM.bat (one-click starter)

===== TROUBLESHOOTING =====

If frontend doesn't connect to backend:
- Make sure both terminals are running
- Check ports: Backend=5000, Frontend=8000
- Try refreshing the page

If dispatch returns no results:
- Ensure C++ engine compiled successfully
- Check algorithms/output.txt exists
- Verify ambulances are available

If map doesn't load:
- Check internet (Leaflet loads from CDN)
- Check browser console for errors

===== NEXT IMPROVEMENTS =====

□ Real-time emergency handling queue
□ Database persistence
□ Multi-user support
□ Advanced ambulance tracking
□ Traffic simulation
□ Mobile app
□ Send actual notifications

===== COMMANDS =====

Compile C++:
  cd algorithms && make

Run Backend:
  cd backend && python app.py

Run Frontend:
  cd frontend && python -m http.server 8000

Run All (Windows):
  START_SYSTEM.bat

===== END =====
