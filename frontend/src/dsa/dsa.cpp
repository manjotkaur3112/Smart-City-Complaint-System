#include <bits/stdc++.h>
using namespace std;

// Structure
struct Complaint {
    string complaintId;
    string title;
    string description;
    string priority;   // critical, high, medium, low
    long long createdAt;
    long long updatedAt;
};

// Priority Weight
int getPriorityWeight(string p) {
    if (p == "critical") return 4;
    if (p == "high") return 3;
    if (p == "medium") return 2;
    return 1;
}

// Get Value
long long getValue(Complaint item, string key) {
    if (key == "priority") return getPriorityWeight(item.priority);
    if (key == "createdAt") return item.createdAt;
    if (key == "updatedAt") return item.updatedAt;
    return 0;
}

// Bubble Sort
vector<Complaint> bubbleSort(vector<Complaint> arr, string key="createdAt", string order="desc") {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            long long v1 = getValue(arr[j], key);
            long long v2 = getValue(arr[j+1], key);

            bool swapNeeded = (order == "asc") ? v1 > v2 : v1 < v2;

            if (swapNeeded) swap(arr[j], arr[j+1]);
        }
    }
    return arr;
}

// Insertion Sort
vector<Complaint> insertionSort(vector<Complaint> arr, string key="createdAt", string order="desc") {
    for (int i = 1; i < arr.size(); i++) {
        Complaint curr = arr[i];
        long long currVal = getValue(curr, key);
        int j = i - 1;

        while (j >= 0) {
            long long prevVal = getValue(arr[j], key);
            bool move = (order == "asc") ? prevVal > currVal : prevVal < currVal;

            if (move) {
                arr[j+1] = arr[j];
                j--;
            } else break;
        }
        arr[j+1] = curr;
    }
    return arr;
}

// Selection Sort
vector<Complaint> selectionSort(vector<Complaint> arr, string key="createdAt", string order="desc") {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int idx = i;
        for (int j = i + 1; j < n; j++) {
            long long v1 = getValue(arr[idx], key);
            long long v2 = getValue(arr[j], key);

            bool update = (order == "asc") ? v2 < v1 : v2 > v1;

            if (update) idx = j;
        }
        swap(arr[i], arr[idx]);
    }
    return arr;
}

// Linear Search
vector<Complaint> linearSearch(vector<Complaint> arr, string query) {
    vector<Complaint> result;
    transform(query.begin(), query.end(), query.begin(), ::tolower);

    for (auto &item : arr) {
        string t = item.title, d = item.description;
        transform(t.begin(), t.end(), t.begin(), ::tolower);
        transform(d.begin(), d.end(), d.begin(), ::tolower);

        if (t.find(query) != string::npos || d.find(query) != string::npos)
            result.push_back(item);
    }
    return result;
}

// Compare IDs
int compareIds(string a, string b) {
    return stoi(a) - stoi(b);
}

// Binary Search
pair<Complaint, int> binarySearchById(vector<Complaint> arr, string target) {
    int lo = 0, hi = arr.size() - 1;

    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        int cmp = compareIds(arr[mid].complaintId, target);

        if (cmp == 0) return {arr[mid], mid};
        else if (cmp < 0) lo = mid + 1;
        else hi = mid - 1;
    }
    return {Complaint(), -1};
}

// Find Max
Complaint findMax(vector<Complaint> arr) {
    Complaint mx = arr[0];
    for (auto &i : arr) {
        if (getPriorityWeight(i.priority) > getPriorityWeight(mx.priority))
            mx = i;
    }
    return mx;
}

// Find Min
Complaint findMin(vector<Complaint> arr) {
    Complaint mn = arr[0];
    for (auto &i : arr) {
        if (getPriorityWeight(i.priority) < getPriorityWeight(mn.priority))
            mn = i;
    }
    return mn;
}

// Reverse
vector<Complaint> reverseArray(vector<Complaint> arr) {
    reverse(arr.begin(), arr.end());
    return arr;
}

// Count by Priority
map<string,int> countByPriority(vector<Complaint> arr) {
    map<string,int> cnt;
    for (auto &i : arr) cnt[i.priority]++;
    return cnt;
}

// MAIN FUNCTION (Demo)
int main() {

    vector<Complaint> data = {
        {"1","Water Issue","No water","high",1000,2000},
        {"2","Road Damage","Potholes","critical",2000,3000},
        {"3","Electricity","Power cut","medium",1500,2500}
    };

    cout << "Sorted by Priority (Bubble):\n";
    auto sorted = bubbleSort(data, "priority", "desc");
    for (auto &c : sorted) {
        cout << c.complaintId << " " << c.priority << endl;
    }

    cout << "\nSearch 'water':\n";
    auto res = linearSearch(data, "water");
    for (auto &c : res) {
        cout << c.title << endl;
    }

    cout << "\nMax Priority:\n";
    cout << findMax(data).priority << endl;

    cout << "\nMin Priority:\n";
    cout << findMin(data).priority << endl;

    return 0;
}