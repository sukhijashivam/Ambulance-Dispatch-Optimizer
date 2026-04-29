# Makefile — tells compiler how to build your project
# Run: make
# Then: ./dispatch_engine

CXX = g++
CXXFLAGS = -std=c++17 -O2 -Wall

all: dispatch_engine

dispatch_engine: main.cpp graph.cpp dijkstra.cpp dispatcher.cpp
	$(CXX) $(CXXFLAGS) -o dispatch_engine main.cpp graph.cpp dijkstra.cpp dispatcher.cpp

clean:
	rm -f dispatch_engine