#include <iostream>
#include <fstream>

using namespace std;

int main() {
    cout << "TEST: Printing to console" << endl;
    
    ofstream f("test_output.txt");
    f << "TEST: Writing to file" << endl;
    f.close();
    
    cout << "TEST: File written successfully" << endl;
    return 0;
}
