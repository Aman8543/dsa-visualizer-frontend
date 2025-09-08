import { FaSearch } from "react-icons/fa";

export const algorithmsCodes = [
  {
    title: "Searching",
  //  icon: <FaSearch className="text-info" size={24} />,
    items: [
      {
        name: "Linear Search",
        codes: {
          cpp: `int linearSearch(int arr[], int n, int x) {
    for(int i = 0; i < n; i++) {
        if(arr[i] == x) return i;
    }
    return -1;
}`,
          java: `int linearSearch(int arr[], int x) {
    for(int i = 0; i < arr.length; i++) {
        if(arr[i] == x) return i;
    }
    return -1;
}`,
          python: `def linear_search(arr, x):
    for i in range(len(arr)):
        if arr[i] == x:
            return i
    return -1`
        }
      },
      {
        name: "Binary Search",
        codes: {
          cpp: `int binarySearch(int arr[], int l, int r, int x) {
    while(l <= r) {
        int mid = l + (r - l) / 2;
        if(arr[mid] == x) return mid;
        else if(arr[mid] < x) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}`,
          java: `int binarySearch(int arr[], int x) {
    int l = 0, r = arr.length - 1;
    while(l <= r) {
        int mid = l + (r - l) / 2;
        if(arr[mid] == x) return mid;
        else if(arr[mid] < x) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}`,
          python: `def binary_search(arr, x):
    l, r = 0, len(arr) - 1
    while l <= r:
        mid = (l + r) // 2
        if arr[mid] == x:
            return mid
        elif arr[mid] < x:
            l = mid + 1
        else:
            r = mid - 1
    return -1`
        }
      },
      {
        name: "Jump Search",
        codes: {
          cpp: `#include <cmath>
int jumpSearch(int arr[], int n, int x) {
    int step = sqrt(n);
    int prev = 0;
    while(arr[std::min(step, n) - 1] < x) {
        prev = step;
        step += sqrt(n);
        if(prev >= n) return -1;
    }
    for(int i = prev; i < std::min(step, n); i++) {
        if(arr[i] == x) return i;
    }
    return -1;
}`,
          java: `import java.lang.Math;
int jumpSearch(int arr[], int x) {
    int n = arr.length;
    int step = (int)Math.floor(Math.sqrt(n));
    int prev = 0;
    while(arr[Math.min(step, n)-1] < x) {
        prev = step;
        step += (int)Math.floor(Math.sqrt(n));
        if(prev >= n) return -1;
    }
    for(int i = prev; i < Math.min(step, n); i++) {
        if(arr[i] == x) return i;
    }
    return -1;
}`,
          python: `import math
def jump_search(arr, x):
    n = len(arr)
    step = int(math.sqrt(n))
    prev = 0
    while arr[min(step, n)-1] < x:
        prev = step
        step += int(math.sqrt(n))
        if prev >= n:
            return -1
    for i in range(prev, min(step, n)):
        if arr[i] == x:
            return i
    return -1`
        }
      },
      {
        name: "Exponential Search",
        codes: {
          cpp: `int binarySearch(int arr[], int l, int r, int x);
int exponentialSearch(int arr[], int n, int x) {
    if(arr[0] == x) return 0;
    int i = 1;
    while(i < n && arr[i] <= x) i *= 2;
    return binarySearch(arr, i/2, std::min(i, n-1), x);
}`,
          java: `int binarySearch(int arr[], int l, int r, int x);
int exponentialSearch(int arr[], int x) {
    if(arr[0] == x) return 0;
    int i = 1;
    while(i < arr.length && arr[i] <= x) i *= 2;
    return binarySearch(arr, i/2, Math.min(i, arr.length-1), x);
}`,
          python: `def binary_search(arr, l, r, x):
    while l <= r:
        mid = (l + r) // 2
        if arr[mid] == x:
            return mid
        elif arr[mid] < x:
            l = mid + 1
        else:
            r = mid - 1
    return -1

def exponential_search(arr, x):
    if arr[0] == x:
        return 0
    i = 1
    while i < len(arr) and arr[i] <= x:
        i *= 2
    return binary_search(arr, i//2, min(i, len(arr)-1), x)`
        }
      }
    ]
  },

  {
    title: "Sorting",
    //icon: <FaSortAmountDown className="text-success" size={24} />,
    items: [
      {
        name: "Bubble Sort",
        codes: {
          cpp: `void bubbleSort(int arr[], int n) {
    for(int i = 0; i < n-1; i++)
        for(int j = 0; j < n-i-1; j++)
            if(arr[j] > arr[j+1])
                std::swap(arr[j], arr[j+1]);
}`,
          java: `void bubbleSort(int[] arr) {
    for(int i = 0; i < arr.length-1; i++)
        for(int j = 0; j < arr.length-i-1; j++)
            if(arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
}`,
          python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n-1):
        for j in range(n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]`
        }
      },
      {
        name: "Selection Sort",
        codes: {
          cpp: `void selectionSort(int arr[], int n) {
    for(int i = 0; i < n-1; i++) {
        int minIdx = i;
        for(int j = i+1; j < n; j++)
            if(arr[j] < arr[minIdx]) minIdx = j;
        std::swap(arr[i], arr[minIdx]);
    }
}`,
          java: `void selectionSort(int[] arr) {
    for(int i = 0; i < arr.length-1; i++) {
        int minIdx = i;
        for(int j = i+1; j < arr.length; j++)
            if(arr[j] < arr[minIdx]) minIdx = j;
        int temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
    }
}`,
          python: `def selection_sort(arr):
    for i in range(len(arr)-1):
        min_idx = i
        for j in range(i+1, len(arr)):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]`
        }
      },
      {
        name: "Insertion Sort",
        codes: {
          cpp: `void insertionSort(int arr[], int n) {
    for(int i = 1; i < n; i++) {
        int key = arr[i], j = i - 1;
        while(j >= 0 && arr[j] > key) {
            arr[j+1] = arr[j];
            j--;
        }
        arr[j+1] = key;
    }
}`,
          java: `void insertionSort(int[] arr) {
    for(int i = 1; i < arr.length; i++) {
        int key = arr[i], j = i - 1;
        while(j >= 0 && arr[j] > key) {
            arr[j+1] = arr[j];
            j--;
        }
        arr[j+1] = key;
    }
}`,
          python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j+1] = arr[j]
            j -= 1
        arr[j+1] = key`
        }
      },
      {
        name: "Merge Sort",
        codes: {
          cpp: `void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int L[n1], R[n2];
    for(int i = 0; i < n1; i++) L[i] = arr[l + i];
    for(int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while(i < n1 && j < n2) arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while(i < n1) arr[k++] = L[i++];
    while(j < n2) arr[k++] = R[j++];
}
void mergeSort(int arr[], int l, int r) {
    if(l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m+1, r);
        merge(arr, l, m, r);
    }
}`,
          java: `void merge(int[] arr, int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int[] L = new int[n1];
    int[] R = new int[n2];
    for(int i = 0; i < n1; i++) L[i] = arr[l + i];
    for(int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while(i < n1 && j < n2) arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while(i < n1) arr[k++] = L[i++];
    while(j < n2) arr[k++] = R[j++];
}
void mergeSort(int[] arr, int l, int r) {
    if(l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m+1, r);
        merge(arr, l, m, r);
    }
}`,
          python: `def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr)//2
        L = arr[:mid]
        R = arr[mid:]
        merge_sort(L)
        merge_sort(R)
        i = j = k = 0
        while i < len(L) and j < len(R):
            if L[i] <= R[j]:
                arr[k] = L[i]
                i += 1
            else:
                arr[k] = R[j]
                j += 1
            k += 1
        while i < len(L):
            arr[k] = L[i]
            i += 1
            k += 1
        while j < len(R):
            arr[k] = R[j]
            j += 1
            k += 1`
        }
      },
    ]
  },
  
    {
    title: "Tree",
    //icon: <BsTree className="text-accent" size={24} />,
    items: [
      {
        name: "Binary Tree",
        codes: {
          cpp: `struct Node {
    int data;
    Node* left;
    Node* right;
    Node(int val) : data(val), left(NULL), right(NULL) {}
};
void inorder(Node* root) {
    if(root) {
        inorder(root->left);
        std::cout << root->data << " ";
        inorder(root->right);
    }
}`,
          java: `class Node {
    int data;
    Node left, right;
    Node(int val) { data = val; left = right = null; }
}
void inorder(Node root) {
    if(root != null) {
        inorder(root.left);
        System.out.print(root.data + " ");
        inorder(root.right);
    }
}`,
          python: `class Node:
    def __init__(self, val):
        self.data = val
        self.left = None
        self.right = None
def inorder(root):
    if root:
        inorder(root.left)
        print(root.data, end=" ")
        inorder(root.right)`
        }
      },
      {
        name: "Binary Search Tree",
        codes: {
          cpp: `Node* insert(Node* root, int val) {
    if(!root) return new Node(val);
    if(val < root->data) root->left = insert(root->left, val);
    else root->right = insert(root->right, val);
    return root;
}`,
          java: `Node insert(Node root, int val) {
    if(root == null) return new Node(val);
    if(val < root.data) root.left = insert(root.left, val);
    else root.right = insert(root.right, val);
    return root;
}`,
          python: `def insert(root, val):
    if root is None:
        return Node(val)
    if val < root.data:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root`
        }
      },
      {
        name: "AVL Tree",
        codes: {
          cpp: `// AVL Tree insert with rotation omitted for brevity
struct Node {
    int key, height;
    Node *left, *right;
    Node(int k) : key(k), height(1), left(NULL), right(NULL) {}
};`,
          java: `// AVL Tree insert with rotation omitted for brevity
class Node {
    int key, height;
    Node left, right;
    Node(int k) { key = k; height = 1; }
}`,
          python: `# AVL Tree insert with rotation omitted for brevity
class Node:
    def __init__(self, key):
        self.key = key
        self.height = 1
        self.left = None
        self.right = None`
        }
      },
      {
        name: "Segment Tree",
        codes: {
          cpp: `void buildTree(int arr[], int tree[], int node, int start, int end) {
    if(start == end) tree[node] = arr[start];
    else {
        int mid = (start + end) / 2;
        buildTree(arr, tree, 2*node, start, mid);
        buildTree(arr, tree, 2*node+1, mid+1, end);
        tree[node] = tree[2*node] + tree[2*node+1];
    }
}`,
          java: `void buildTree(int[] arr, int[] tree, int node, int start, int end) {
    if(start == end) tree[node] = arr[start];
    else {
        int mid = (start + end) / 2;
        buildTree(arr, tree, 2*node, start, mid);
        buildTree(arr, tree, 2*node+1, mid+1, end);
        tree[node] = tree[2*node] + tree[2*node+1];
    }
}`,
          python: `def build_tree(arr, tree, node, start, end):
    if start == end:
        tree[node] = arr[start]
    else:
        mid = (start + end) // 2
        build_tree(arr, tree, 2*node, start, mid)
        build_tree(arr, tree, 2*node+1, mid+1, end)
        tree[node] = tree[2*node] + tree[2*node+1]`
        }
      },
      {
        name: "Trie",
        codes: {
          cpp: `struct TrieNode {
    TrieNode* children[26];
    bool isEnd;
    TrieNode() { isEnd = false; for(int i = 0; i < 26; i++) children[i] = NULL; }
};
void insert(TrieNode* root, std::string word) {
    for(char c : word) {
        int idx = c - 'a';
        if(!root->children[idx]) root->children[idx] = new TrieNode();
        root = root->children[idx];
    }
    root->isEnd = true;
}`,
          java: `class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd = false;
}
void insert(TrieNode root, String word) {
    for(char c : word.toCharArray()) {
        int idx = c - 'a';
        if(root.children[idx] == null) root.children[idx] = new TrieNode();
        root = root.children[idx];
    }
    root.isEnd = true;
}`,
          python: `class TrieNode:
    def __init__(self):
        self.children = [None] * 26
        self.isEnd = False
def insert(root, word):
    for c in word:
        idx = ord(c) - ord('a')
        if not root.children[idx]:
            root.children[idx] = TrieNode()
        root = root.children[idx]
    root.isEnd = True`
        }
      }
    ]
  },

  {
  title: "Graph",
  //icon: <FaProjectDiagram className="text-warning" size={24} />,
  items: [
    {
      name: "BFS",
      codes: {
        cpp: `#include <queue>
void BFS(int start, std::vector<int> adj[], int V) {
    std::vector<bool> visited(V, false);
    std::queue<int> q;
    visited[start] = true;
    q.push(start);
    while(!q.empty()) {
        int node = q.front();
        q.pop();
        std::cout << node << " ";
        for(int neigh : adj[node]) {
            if(!visited[neigh]) {
                visited[neigh] = true;
                q.push(neigh);
            }
        }
    }
}`,
        java: `import java.util.*;
void BFS(int start, List<List<Integer>> adj, int V) {
    boolean[] visited = new boolean[V];
    Queue<Integer> q = new LinkedList<>();
    visited[start] = true;
    q.add(start);
    while(!q.isEmpty()) {
        int node = q.poll();
        System.out.print(node + " ");
        for(int neigh : adj.get(node)) {
            if(!visited[neigh]) {
                visited[neigh] = true;
                q.add(neigh);
            }
        }
    }
}`,
        python: `from collections import deque
def bfs(start, adj, V):
    visited = [False] * V
    queue = deque([start])
    visited[start] = True
    while queue:
        node = queue.popleft()
        print(node, end=" ")
        for neigh in adj[node]:
            if not visited[neigh]:
                visited[neigh] = True
                queue.append(neigh)`
      }
    },
    {
      name: "DFS",
      codes: {
        cpp: `void DFSUtil(int node, std::vector<int> adj[], std::vector<bool> &visited) {
    visited[node] = true;
    std::cout << node << " ";
    for(int neigh : adj[node])
        if(!visited[neigh])
            DFSUtil(neigh, adj, visited);
}
void DFS(int start, std::vector<int> adj[], int V) {
    std::vector<bool> visited(V, false);
    DFSUtil(start, adj, visited);
}`,
        java: `void DFSUtil(int node, List<List<Integer>> adj, boolean[] visited) {
    visited[node] = true;
    System.out.print(node + " ");
    for(int neigh : adj.get(node))
        if(!visited[neigh])
            DFSUtil(neigh, adj, visited);
}
void DFS(int start, List<List<Integer>> adj, int V) {
    boolean[] visited = new boolean[V];
    DFSUtil(start, adj, visited);
}`,
        python: `def dfs_util(node, adj, visited):
    visited[node] = True
    print(node, end=" ")
    for neigh in adj[node]:
        if not visited[neigh]:
            dfs_util(neigh, adj, visited)
def dfs(start, adj, V):
    visited = [False] * V
    dfs_util(start, adj, visited)`
      }
    },
    {
      name: "Dijkstra’s Algorithm",
      codes: {
        cpp: `#include <queue>
#include <climits>
void dijkstra(int V, std::vector<std::pair<int,int>> adj[], int src) {
    std::vector<int> dist(V, INT_MAX);
    dist[src] = 0;
    using pii = std::pair<int,int>;
    std::priority_queue<pii, std::vector<pii>, std::greater<pii>> pq;
    pq.push({0, src});
    while(!pq.empty()) {
        int u = pq.top().second;
        pq.pop();
        for(auto &p : adj[u]) {
            int v = p.first, w = p.second;
            if(dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
}`,
        java: `import java.util.*;
void dijkstra(int V, List<List<int[]>> adj, int src) {
    int[] dist = new int[V];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;
    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
    pq.add(new int[]{0, src});
    while(!pq.isEmpty()) {
        int[] curr = pq.poll();
        int u = curr[1];
        for(int[] edge : adj.get(u)) {
            int v = edge[0], w = edge[1];
            if(dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.add(new int[]{dist[v], v});
            }
        }
    }
}`,
        python: `import heapq
def dijkstra(V, adj, src):
    dist = [float('inf')] * V
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))`
      }
    },
    {
      name: "Kruskal’s Algorithm",
      codes: {
        cpp: `struct Edge { int u, v, w; };
int find(int parent[], int i) {
    return (parent[i] == i) ? i : (parent[i] = find(parent, parent[i]));
}
void Union(int parent[], int rank[], int x, int y) {
    if(rank[x] < rank[y]) parent[x] = y;
    else if(rank[x] > rank[y]) parent[y] = x;
    else { parent[y] = x; rank[x]++; }
}
void kruskal(int V, std::vector<Edge> edges) {
    int parent[V], rank[V] = {0};
    for(int i=0;i<V;i++) parent[i] = i;
    std::sort(edges.begin(), edges.end(), [](Edge a, Edge b){ return a.w < b.w; });
    for(auto e : edges) {
        int x = find(parent, e.u);
        int y = find(parent, e.v);
        if(x != y) {
            std::cout << e.u << " - " << e.v << " : " << e.w << "\\n";
            Union(parent, rank, x, y);
        }
    }
}`,
        java: `class Edge { int u, v, w; }
int find(int[] parent, int i) {
    if(parent[i] != i) parent[i] = find(parent, parent[i]);
    return parent[i];
}
void unionSet(int[] parent, int[] rank, int x, int y) {
    if(rank[x] < rank[y]) parent[x] = y;
    else if(rank[x] > rank[y]) parent[y] = x;
    else { parent[y] = x; rank[x]++; }
}
void kruskal(int V, List<Edge> edges) {
    int[] parent = new int[V];
    int[] rank = new int[V];
    for(int i=0;i<V;i++) parent[i] = i;
    edges.sort((a, b) -> a.w - b.w);
    for(Edge e : edges) {
        int x = find(parent, e.u);
        int y = find(parent, e.v);
        if(x != y) {
            System.out.println(e.u + " - " + e.v + " : " + e.w);
            unionSet(parent, rank, x, y);
        }
    }
}`,
        python: `class Edge:
    def __init__(self, u, v, w):
        self.u, self.v, self.w = u, v, w
def find(parent, i):
    if parent[i] != i:
        parent[i] = find(parent, parent[i])
    return parent[i]
def union(parent, rank, x, y):
    if rank[x] < rank[y]:
        parent[x] = y
    elif rank[x] > rank[y]:
        parent[y] = x
    else:
        parent[y] = x
        rank[x] += 1
def kruskal(V, edges):
    parent = [i for i in range(V)]
    rank = [0]*V
    edges.sort(key=lambda e: e.w)
    for e in edges:
        x, y = find(parent, e.u), find(parent, e.v)
        if x != y:
            print(f"{e.u} - {e.v} : {e.w}")
            union(parent, rank, x, y)`
      }
    },
    {
      name: "Prim’s Algorithm",
      codes: {
        cpp: `#include <queue>
void prim(int V, std::vector<std::pair<int,int>> adj[]) {
    std::vector<int> key(V, INT_MAX);
    std::vector<bool> inMST(V, false);
    key[0] = 0;
    using pii = std::pair<int,int>;
    std::priority_queue<pii, std::vector<pii>, std::greater<pii>> pq;
    pq.push({0, 0});
    while(!pq.empty()) {
        int u = pq.top().second;
        pq.pop();
        inMST[u] = true;
        for(auto &p : adj[u]) {
            int v = p.first, w = p.second;
            if(!inMST[v] && w < key[v]) {
                key[v] = w;
                pq.push({key[v], v});
            }
        }
    }
}`,
        java: `import java.util.*;
void prim(int V, List<List<int[]>> adj) {
    int[] key = new int[V];
    boolean[] inMST = new boolean[V];
    Arrays.fill(key, Integer.MAX_VALUE);
    key[0] = 0;
    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
    pq.add(new int[]{0, 0});
    while(!pq.isEmpty()) {
        int[] curr = pq.poll();
        int u = curr[1];
        inMST[u] = true;
        for(int[] edge : adj.get(u)) {
            int v = edge[0], w = edge[1];
            if(!inMST[v] && w < key[v]) {
                key[v] = w;
                pq.add(new int[]{key[v], v});
            }
        }
    }
}`,
        python: `import heapq
def prim(V, adj):
    key = [float('inf')] * V
    in_mst = [False] * V
    key[0] = 0
    pq = [(0, 0)]
    while pq:
        _, u = heapq.heappop(pq)
        in_mst[u] = True
        for v, w in adj[u]:
            if not in_mst[v] and w < key[v]:
                key[v] = w
                heapq.heappush(pq, (key[v], v))`
      }
    }
  ]
},

{
  title: "Dynamic Programming",
 // icon: <FaLightbulb className="text-primary" size={24} />,
  items: [
    {
      name: "Fibonacci",
      codes: {
        cpp: `int fib(int n) {
    if(n <= 1) return n;
    int dp[n+1];
    dp[0] = 0; dp[1] = 1;
    for(int i = 2; i <= n; i++)
        dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}`,
        java: `int fib(int n) {
    if(n <= 1) return n;
    int dp[] = new int[n+1];
    dp[0] = 0; dp[1] = 1;
    for(int i = 2; i <= n; i++)
        dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}`,
        python: `def fib(n):
    if n <= 1:
        return n
    dp = [0]*(n+1)
    dp[0], dp[1] = 0, 1
    for i in range(2, n+1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]`
      }
    },
    {
      name: "0/1 Knapsack",
      codes: {
        cpp: `int knapSack(int W, int wt[], int val[], int n) {
    int dp[n+1][W+1];
    for(int i = 0; i <= n; i++) {
        for(int w = 0; w <= W; w++) {
            if(i == 0 || w == 0) dp[i][w] = 0;
            else if(wt[i-1] <= w)
                dp[i][w] = max(val[i-1] + dp[i-1][w-wt[i-1]], dp[i-1][w]);
            else
                dp[i][w] = dp[i-1][w];
        }
    }
    return dp[n][W];
}`,
        java: `int knapSack(int W, int wt[], int val[], int n) {
    int dp[][] = new int[n+1][W+1];
    for(int i = 0; i <= n; i++) {
        for(int w = 0; w <= W; w++) {
            if(i == 0 || w == 0) dp[i][w] = 0;
            else if(wt[i-1] <= w)
                dp[i][w] = Math.max(val[i-1] + dp[i-1][w-wt[i-1]], dp[i-1][w]);
            else
                dp[i][w] = dp[i-1][w];
        }
    }
    return dp[n][W];
}`,
        python: `def knapSack(W, wt, val, n):
    dp = [[0]*(W+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for w in range(W+1):
            if wt[i-1] <= w:
                dp[i][w] = max(val[i-1] + dp[i-1][w-wt[i-1]], dp[i-1][w])
            else:
                dp[i][w] = dp[i-1][w]
    return dp[n][W]`
      }
    },
    {
      name: "Longest Common Subsequence",
      codes: {
        cpp: `int lcs(string X, string Y) {
    int m = X.size(), n = Y.size();
    int dp[m+1][n+1];
    for(int i = 0; i <= m; i++) {
        for(int j = 0; j <= n; j++) {
            if(i == 0 || j == 0) dp[i][j] = 0;
            else if(X[i-1] == Y[j-1])
                dp[i][j] = 1 + dp[i-1][j-1];
            else
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
        }
    }
    return dp[m][n];
}`,
        java: `int lcs(String X, String Y) {
    int m = X.length(), n = Y.length();
    int dp[][] = new int[m+1][n+1];
    for(int i = 0; i <= m; i++) {
        for(int j = 0; j <= n; j++) {
            if(i == 0 || j == 0) dp[i][j] = 0;
            else if(X.charAt(i-1) == Y.charAt(j-1))
                dp[i][j] = 1 + dp[i-1][j-1];
            else
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        }
    }
    return dp[m][n];
}`,
        python: `def lcs(X, Y):
    m, n = len(X), len(Y)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if X[i-1] == Y[j-1]:
                dp[i][j] = 1 + dp[i-1][j-1]
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]`
      }
    },
    {
      name: "Matrix Chain Multiplication",
      codes: {
        cpp: `int matrixChainOrder(int p[], int n) {
    int dp[n][n];
    for(int i = 1; i < n; i++) dp[i][i] = 0;
    for(int L = 2; L < n; L++) {
        for(int i = 1; i < n - L + 1; i++) {
            int j = i + L - 1;
            dp[i][j] = INT_MAX;
            for(int k = i; k < j; k++) {
                int cost = dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j];
                dp[i][j] = min(dp[i][j], cost);
            }
        }
    }
    return dp[1][n-1];
}`,
        java: `int matrixChainOrder(int p[], int n) {
    int dp[][] = new int[n][n];
    for(int i = 1; i < n; i++) dp[i][i] = 0;
    for(int L = 2; L < n; L++) {
        for(int i = 1; i < n - L + 1; i++) {
            int j = i + L - 1;
            dp[i][j] = Integer.MAX_VALUE;
            for(int k = i; k < j; k++) {
                int cost = dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j];
                if(cost < dp[i][j]) dp[i][j] = cost;
            }
        }
    }
    return dp[1][n-1];
}`,
        python: `def matrix_chain_order(p):
    n = len(p)
    dp = [[0]*n for _ in range(n)]
    for L in range(2, n):
        for i in range(1, n-L+1):
            j = i+L-1
            dp[i][j] = float('inf')
            for k in range(i, j):
                cost = dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]
                dp[i][j] = min(dp[i][j], cost)
    return dp[1][n-1]`
      }
    }
  ]
},
{
  title: "Greedy",
  //icon: <FaBalanceScale className="text-secondary" size={24} />,
  items: [
    {
      name: "Activity Selection",
      codes: {
        cpp: `vector<int> activitySelection(vector<int>& start, vector<int>& finish) {
    vector<pair<int,int>> activities;
    for(int i = 0; i < start.size(); i++)
        activities.push_back({finish[i], start[i]});
    sort(activities.begin(), activities.end());
    vector<int> result;
    int lastFinish = -1;
    for(auto &act : activities) {
        if(act.second >= lastFinish) {
            result.push_back(act.second);
            lastFinish = act.first;
        }
    }
    return result;
}`,
        java: `List<Integer> activitySelection(int[] start, int[] finish) {
    List<int[]> activities = new ArrayList<>();
    for(int i = 0; i < start.length; i++)
        activities.add(new int[]{finish[i], start[i]});
    activities.sort(Comparator.comparingInt(a -> a[0]));
    List<Integer> result = new ArrayList<>();
    int lastFinish = -1;
    for(int[] act : activities) {
        if(act[1] >= lastFinish) {
            result.add(act[1]);
            lastFinish = act[0];
        }
    }
    return result;
}`,
        python: `def activity_selection(start, finish):
    activities = sorted(zip(finish, start))
    result = []
    last_finish = -1
    for f, s in activities:
        if s >= last_finish:
            result.append(s)
            last_finish = f
    return result`
      }
    },
    {
      name: "Huffman Coding",
      codes: {
        cpp: `// Requires priority_queue and Node struct
struct Node {
    char ch;
    int freq;
    Node *left, *right;
    Node(char c, int f) : ch(c), freq(f), left(NULL), right(NULL) {}
};
struct Compare {
    bool operator()(Node* l, Node* r) {
        return l->freq > r->freq;
    }
};`,
        java: `// Requires PriorityQueue and Node class
class Node {
    char ch;
    int freq;
    Node left, right;
    Node(char c, int f) { ch = c; freq = f; }
}`,
        python: `# Requires heapq
import heapq
class Node:
    def __init__(self, ch, freq):
        self.ch = ch
        self.freq = freq
        self.left = None
        self.right = None
    def __lt__(self, other):
        return self.freq < other.freq`
      }
    },
    {
      name: "Fractional Knapsack",
      codes: {
        cpp: `struct Item { int value, weight; };
bool cmp(Item a, Item b) {
    double r1 = (double)a.value/a.weight;
    double r2 = (double)b.value/b.weight;
    return r1 > r2;
}
double fractionalKnapsack(int W, Item arr[], int n) {
    sort(arr, arr+n, cmp);
    double res = 0.0;
    for(int i = 0; i < n; i++) {
        if(arr[i].weight <= W) {
            W -= arr[i].weight;
            res += arr[i].value;
        } else {
            res += arr[i].value * ((double)W / arr[i].weight);
            break;
        }
    }
    return res;
}`,
        java: `class Item { int value, weight; }
double fractionalKnapsack(int W, Item arr[]) {
    Arrays.sort(arr, (a, b) -> Double.compare((double)b.value/b.weight, (double)a.value/a.weight));
    double res = 0.0;
    for(Item i : arr) {
        if(i.weight <= W) {
            W -= i.weight;
            res += i.value;
        } else {
            res += i.value * ((double)W / i.weight);
            break;
        }
    }
    return res;
}`,
        python: `def fractional_knapsack(W, items):
    items.sort(key=lambda x: x[0]/x[1], reverse=True)
    res = 0.0
    for value, weight in items:
        if weight <= W:
            W -= weight
            res += value
        else:
            res += value * (W / weight)
            break
    return res`
      }
    }
  ]
},

{
  title: "Backtracking",
  //icon: <FaUndo className="text-error" size={24} />,
  items: [
    {
      name: "N-Queens",
      codes: {
        cpp: `bool isSafe(vector<string> &board, int row, int col, int n) {
    for(int i = 0; i < col; i++)
        if(board[row][i] == 'Q') return false;
    for(int i = row, j = col; i >= 0 && j >= 0; i--, j--)
        if(board[i][j] == 'Q') return false;
    for(int i = row, j = col; i < n && j >= 0; i++, j--)
        if(board[i][j] == 'Q') return false;
    return true;
}`,
        java: `boolean isSafe(char[][] board, int row, int col, int n) {
    for(int i = 0; i < col; i++)
        if(board[row][i] == 'Q') return false;
    for(int i=row,j=col; i>=0 && j>=0; i--, j--)
        if(board[i][j] == 'Q') return false;
    for(int i=row,j=col; i<n && j>=0; i++, j--)
        if(board[i][j] == 'Q') return false;
    return true;
}`,
        python: `def is_safe(board, row, col, n):
    for i in range(col):
        if board[row][i] == 'Q':
            return False
    for i, j in zip(range(row, -1, -1), range(col, -1, -1)):
        if board[i][j] == 'Q':
            return False
    for i, j in zip(range(row, n), range(col, -1, -1)):
        if board[i][j] == 'Q':
            return False
    return True`
      }
    },
    {
      name: "Sudoku Solver",
      codes: {
        cpp: `bool isSafe(int grid[9][9], int row, int col, int num) {
    for(int x = 0; x < 9; x++)
        if(grid[row][x] == num || grid[x][col] == num) return false;
    int startRow = row - row%3, startCol = col - col%3;
    for(int i = 0; i < 3; i++)
        for(int j = 0; j < 3; j++)
            if(grid[i+startRow][j+startCol] == num) return false;
    return true;
}`,
        java: `boolean isSafe(int[][] grid, int row, int col, int num) {
    for(int x = 0; x < 9; x++)
        if(grid[row][x] == num || grid[x][col] == num) return false;
    int startRow = row - row%3, startCol = col - col%3;
    for(int i = 0; i < 3; i++)
        for(int j = 0; j < 3; j++)
            if(grid[i+startRow][j+startCol] == num) return false;
    return true;
}`,
        python: `def is_safe(grid, row, col, num):
    for x in range(9):
        if grid[row][x] == num or grid[x][col] == num:
            return False
    start_row, start_col = row - row % 3, col - col % 3
    for i in range(3):
        for j in range(3):
            if grid[i + start_row][j + start_col] == num:
                return False
    return True`
      }
    },
    {
      name: "Rat in a Maze",
      codes: {
        cpp: `bool solveMazeUtil(int maze[N][N], int x, int y, int sol[N][N]) {
    if(x == N-1 && y == N-1 && maze[x][y] == 1) {
        sol[x][y] = 1;
        return true;
    }
    if(x >= 0 && y >= 0 && x < N && y < N && maze[x][y] == 1) {
        sol[x][y] = 1;
        if(solveMazeUtil(maze, x+1, y, sol)) return true;
        if(solveMazeUtil(maze, x, y+1, sol)) return true;
        sol[x][y] = 0;
        return false;
    }
    return false;
}`,
        java: `boolean solveMazeUtil(int[][] maze, int x, int y, int[][] sol) {
    if(x == N-1 && y == N-1 && maze[x][y] == 1) {
        sol[x][y] = 1;
        return true;
    }
    if(x >= 0 && y >= 0 && x < N && y < N && maze[x][y] == 1) {
        sol[x][y] = 1;
        if(solveMazeUtil(maze, x+1, y, sol)) return true;
        if(solveMazeUtil(maze, x, y+1, sol)) return true;
        sol[x][y] = 0;
        return false;
    }
    return false;
}`,
        python: `def solve_maze_util(maze, x, y, sol):
    N = len(maze)
    if x == N-1 and y == N-1 and maze[x][y] == 1:
        sol[x][y] = 1
        return True
    if 0 <= x < N and 0 <= y < N and maze[x][y] == 1:
        sol[x][y] = 1
        if solve_maze_util(maze, x+1, y, sol):
            return True
        if solve_maze_util(maze, x, y+1, sol):
            return True
        sol[x][y] = 0
        return False
    return False`
      }
    },
{
  name: "Word Break",
  codes: {
    cpp: `bool wordBreakUtil(string s, unordered_set<string> &dict, int start) {
    if(start == s.size()) return true;
    for(int end = start + 1; end <= s.size(); end++) {
        if(dict.count(s.substr(start, end - start)) &&
           wordBreakUtil(s, dict, end)) {
            return true;
        }
    }
    return false;
}

bool wordBreak(string s, unordered_set<string> &dict) {
    return wordBreakUtil(s, dict, 0);
}`,
    java: `boolean wordBreakUtil(String s, Set<String> dict, int start) {
    if(start == s.length()) return true;
    for(int end = start + 1; end <= s.length(); end++) {
        if(dict.contains(s.substring(start, end)) &&
           wordBreakUtil(s, dict, end)) {
            return true;
        }
    }
    return false;
}

boolean wordBreak(String s, Set<String> dict) {
    return wordBreakUtil(s, dict, 0);
}`,
    python: `def word_break_util(s, word_dict, start):
    if start == len(s):
        return True
    for end in range(start + 1, len(s) + 1):
        if s[start:end] in word_dict and word_break_util(s, word_dict, end):
            return True
    return False

def word_break(s, word_dict):
    return word_break_util(s, word_dict, 0)`
  }
}
]

}

];

