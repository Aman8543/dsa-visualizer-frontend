const algorithmDetails = {
  // --- Searching ---
  "Linear Search": {
    definition: "Checks each element sequentially until the target is found or the array ends.",
    working: [
      "Start from the first element.",
      "Compare each element with the target.",
      "If found, return the index.",
      "Otherwise, continue till the end."
    ],
    timeComplexity: { best: "O(1)", average: "O(n)", worst: "O(n)" }
  },
  "Binary Search": {
    definition: "Efficient search on sorted arrays by halving the search space each time.",
    working: [
      "Find the middle element.",
      "Compare it with the target.",
      "If equal, return index.",
      "If target is smaller, search left half.",
      "Else, search right half."
    ],
    timeComplexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)" }
  },
  "Jump Search": {
    definition: "Searches sorted arrays by jumping fixed steps and then linear search in a block.",
    working: [
      "Jump by √n steps until an element >= target.",
      "Do linear search in the previous block."
    ],
    timeComplexity: { best: "O(1)", average: "O(√n)", worst: "O(√n)" }
  },
  "Exponential Search": {
    definition: "Combines exponential jumps and binary search for fast searching in sorted arrays.",
    working: [
      "Find range where target may lie using exponential jumps.",
      "Apply binary search in that range."
    ],
    timeComplexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)" }
  },

  // --- Sorting ---
  "Bubble Sort": {
    definition: "Repeatedly compares and swaps adjacent elements if they are in the wrong order.",
    working: [
      "Compare adjacent elements.",
      "Swap if needed.",
      "Repeat for all elements until sorted."
    ],
    timeComplexity: { best: "O(n)", average: "O(n^2)", worst: "O(n^2)" }
  },
  "Selection Sort": {
    definition: "Selects the smallest element and places it at the beginning of the unsorted array.",
    working: [
      "Find the smallest element.",
      "Swap it with the current position.",
      "Repeat until sorted."
    ],
    timeComplexity: { best: "O(n^2)", average: "O(n^2)", worst: "O(n^2)" }
  },
  "Insertion Sort": {
    definition: "Builds sorted array by inserting one element at a time in the correct position.",
    working: [
      "Pick the next element.",
      "Insert it at correct place in sorted part.",
      "Shift elements to make space."
    ],
    timeComplexity: { best: "O(n)", average: "O(n^2)", worst: "O(n^2)" }
  },
  "Merge Sort": {
    definition: "Divide and conquer sort that splits array, sorts and merges it back.",
    working: [
      "Divide the array into halves.",
      "Sort both halves recursively.",
      "Merge the sorted halves."
    ],
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" }
  },
  "Quick Sort": {
    definition: "Divides array around a pivot and sorts subarrays recursively.",
    working: [
      "Choose a pivot.",
      "Partition array into < pivot and > pivot.",
      "Recursively sort both parts."
    ],
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n^2)" }
  },
  "Heap Sort": {
    definition: "Uses a heap structure to repeatedly extract the largest element.",
    working: [
      "Build a max heap.",
      "Swap root with last element.",
      "Heapify remaining elements."
    ],
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" }
  },

  // --- Tree ---
  "Binary Tree": {
    definition: "Hierarchical structure with each node having up to two children.",
    working: [
      "Start from the root node.",
      "Traverse left and right subtrees recursively."
    ],
    timeComplexity: { best: "O(log n)", average: "O(n)", worst: "O(n)" }
  },
  "Binary Search Tree": {
    definition: "Binary tree with left < root < right property for all nodes.",
    working: [
      "Insert: Recursively place based on value.",
      "Search: Traverse left or right depending on value."
    ],
    timeComplexity: { best: "O(log n)", average: "O(log n)", worst: "O(n)" }
  },
  "AVL Tree": {
    definition: "Self-balancing BST that maintains height balance for every node.",
    working: [
      "Insert as in BST.",
      "Check balance factor.",
      "Rotate (LL, RR, LR, RL) to maintain balance."
    ],
    timeComplexity: { best: "O(log n)", average: "O(log n)", worst: "O(log n)" }
  },
  "Segment Tree": {
    definition: "Tree for efficient range queries and updates.",
    working: [
      "Build tree from base array.",
      "For queries, combine left and right children.",
      "For updates, modify affected nodes."
    ],
    timeComplexity: { best: "O(log n)", average: "O(log n)", worst: "O(log n)" }
  },
  "Trie": {
    definition: "Tree used for efficient string prefix searching.",
    working: [
      "Each node represents a character.",
      "Traverse characters one by one.",
      "Insert/search/delete by traversing paths."
    ],
    timeComplexity: { best: "O(1)", average: "O(L)", worst: "O(L)" } // L = word length
  },

  // --- Graph ---
  "BFS": {
    definition: "Breadth-First Search traverses graph layer by layer using a queue.",
    working: [
      "Start from source node.",
      "Visit all neighbors using queue.",
      "Repeat for next level nodes."
    ],
    timeComplexity: { best: "O(V+E)", average: "O(V+E)", worst: "O(V+E)" }
  },
  "DFS": {
    definition: "Depth-First Search explores graph branches deeply using recursion or stack.",
    working: [
      "Start from source node.",
      "Recursively visit unvisited neighbors.",
      "Backtrack when no neighbors left."
    ],
    timeComplexity: { best: "O(V+E)", average: "O(V+E)", worst: "O(V+E)" }
  },
  "Dijkstra’s Algorithm": {
    definition: "Finds shortest path from source to all nodes in a weighted graph.",
    working: [
      "Use min-priority queue to pick lowest distance node.",
      "Update distances of adjacent nodes.",
      "Repeat until all nodes are visited."
    ],
    timeComplexity: { best: "O(V)", average: "O((V+E) log V)", worst: "O((V+E) log V)" }
  },
  "Kruskal’s Algorithm": {
    definition: "Finds Minimum Spanning Tree using greedy edge selection.",
    working: [
      "Sort all edges by weight.",
      "Use union-find to avoid cycles.",
      "Add edges until all nodes are connected."
    ],
    timeComplexity: { best: "O(E log E)", average: "O(E log V)", worst: "O(E log V)" }
  },
  "Prim’s Algorithm": {
    definition: "Builds MST by adding minimum weight edge to growing tree.",
    working: [
      "Start from any node.",
      "Add minimum weight edge that connects new vertex.",
      "Repeat until all vertices included."
    ],
    timeComplexity: { best: "O(V^2)", average: "O(E + log V)", worst: "O(E + log V)" }
  },

  // --- Dynamic Programming ---
  "Fibonacci": {
    definition: "Computes nth Fibonacci number using overlapping subproblems and memoization.",
    working: [
      "Base: Fib(0)=0, Fib(1)=1.",
      "Use recursion or bottom-up tabulation.",
      "Memoize results for reuse."
    ],
    timeComplexity: { best: "O(1)", average: "O(n)", worst: "O(n)" }
  },
  "0/1 Knapsack": {
    definition: "DP problem to maximize profit with weight limit, choosing items 0 or 1 time.",
    working: [
      "Create DP table of weights and values.",
      "Use inclusion-exclusion at each step.",
      "Final value = max profit with full capacity."
    ],
    timeComplexity: { best: "O(n)", average: "O(nW)", worst: "O(nW)" }
  },
  "Longest Common Subsequence": {
    definition: "Finds length of longest subsequence present in both sequences.",
    working: [
      "Create DP matrix.",
      "If characters match, move diagonally.",
      "Else, take max from top or left."
    ],
    timeComplexity: { best: "O(n)", average: "O(nm)", worst: "O(nm)" }
  },
  "Matrix Chain Multiplication": {
    definition: "Finds most efficient way to multiply chain of matrices.",
    working: [
      "Use DP to minimize scalar multiplications.",
      "Try all split points and take minimum cost.",
      "Build cost matrix bottom-up."
    ],
    timeComplexity: { best: "O(n)", average: "O(n^3)", worst: "O(n^3)" }
  },

  // --- Greedy ---
  "Activity Selection": {
    definition: "Selects maximum non-overlapping activities using greedy end-time sorting.",
    working: [
      "Sort activities by finish time.",
      "Pick activity that starts after previous one ends.",
      "Repeat till end."
    ],
    timeComplexity: { best: "O(1)", average: "O(n log n)", worst: "O(n log n)" }
  },
  "Huffman Coding": {
    definition: "Greedy algorithm to compress data using variable-length prefix codes.",
    working: [
      "Build min heap of characters by frequency.",
      "Combine lowest two until one root remains.",
      "Assign 0/1 path for binary encoding."
    ],
    timeComplexity: { best: "O(n)", average: "O(n log n)", worst: "O(n log n)" }
  },
  "Fractional Knapsack": {
    definition: "Maximizes value by taking fractional parts of items based on value/weight.",
    working: [
      "Sort items by value/weight ratio.",
      "Take items fully until capacity runs out.",
      "Take fractional part of the next item."
    ],
    timeComplexity: { best: "O(n)", average: "O(n log n)", worst: "O(n log n)" }
  },

  // --- Backtracking ---
  "N-Queens": {
    definition: "Place N queens on NxN board such that none attack each other.",
    working: [
      "Place queen row by row.",
      "Check for safe column in each row.",
      "Backtrack if no valid position."
    ],
    timeComplexity: { best: "O(n)", average: "O(n!)", worst: "O(n!)" }
  },
  "Sudoku Solver": {
    definition: "Fills a 9x9 grid so every row, column, and box contains 1–9.",
    working: [
      "Try filling empty cells 1–9.",
      "Check validity of placement.",
      "Backtrack if no number fits."
    ],
    timeComplexity: { best: "O(1)", average: "O(9^k)", worst: "O(9^k)" }
  },
  "Rat in a Maze": {
    definition: "Find path in maze from top-left to bottom-right using valid moves.",
    working: [
      "Move in allowed directions.",
      "Check bounds and blockages.",
      "Backtrack when stuck."
    ],
    timeComplexity: { best: "O(n)", average: "O(2^(n^2))", worst: "O(2^(n^2))" }
  },
  "Word Break": {
    definition: "Checks if string can be segmented into dictionary words.",
    working: [
      "Try splitting string at every index.",
      "Check if prefix is in dictionary.",
      "Backtrack if needed."
    ],
    timeComplexity: { best: "O(n)", average: "O(n^2)", worst: "O(2^n)" }
  }
};





//tags

const tagsDetail= {
  // --- Searching ---
  "Linear Search": {
    tags: ["Algorithm", "Linear Search", "Brute Force", "O(n)"]
  },
  "Binary Search": {
    tags: ["Algorithm", "Binary Search", "Divide & Conquer", "O(log n)"]
  },
  "Jump Search": {
    tags: ["Algorithm", "Jump Search", "Searching", "O(√n)"]
  },
  "Exponential Search": {
    tags: ["Algorithm", "Exponential Search", "Divide & Conquer", "O(log n)"]
  },

  // --- Sorting ---
  "Bubble Sort": {
    tags: ["Algorithm", "Bubble Sort", "Sorting", "O(n^2)", "Brute Force"]
  },
  "Selection Sort": {
    tags: ["Algorithm", "Selection Sort", "Sorting", "O(n^2)", "Greedy"]
  },
  "Insertion Sort": {
    tags: ["Algorithm", "Insertion Sort", "Sorting", "O(n^2)", "Adaptive"]
  },
  "Merge Sort": {
    tags: ["Algorithm", "Merge Sort", "Sorting", "Divide & Conquer", "O(n log n)"]
  },
  "Quick Sort": {
    tags: ["Algorithm", "Quick Sort", "Sorting", "Divide & Conquer", "O(n log n)"]
  },
  "Heap Sort": {
    tags: ["Algorithm", "Heap Sort", "Sorting", "Heap", "O(n log n)"]
  },

  // --- Tree ---
  "Binary Tree": {
    tags: ["Algorithm", "Tree", "Binary Tree", "Traversal", "O(n)"]
  },
  "Binary Search Tree": {
    tags: ["Algorithm", "Tree", "Binary Search Tree", "Searching", "O(log n)"]
  },
  "AVL Tree": {
    tags: ["Algorithm", "Tree", "AVL Tree", "Self-Balancing", "O(log n)"]
  },
  "Segment Tree": {
    tags: ["Algorithm", "Tree", "Segment Tree", "Range Queries", "O(log n)"]
  },
  "Trie": {
    tags: ["Algorithm", "Tree", "Trie", "Prefix Search", "O(L)"]
  },

  // --- Graph ---
  "BFS": {
    tags: ["Algorithm", "Graph", "BFS", "Traversal", "O(V+E)"]
  },
  "DFS": {
    tags: ["Algorithm", "Graph", "DFS", "Traversal", "O(V+E)"]
  },
  "Dijkstra’s Algorithm": {
    tags: ["Algorithm", "Graph", "Shortest Path", "Greedy", "O(E log V)"]
  },
  "Kruskal’s Algorithm": {
    tags: ["Algorithm", "Graph", "MST", "Greedy", "Union-Find", "O(E log E)"]
  },
  "Prim’s Algorithm": {
    tags: ["Algorithm", "Graph", "MST", "Greedy", "O(E + log V)"]
  },

  // --- Dynamic Programming ---
  "Fibonacci": {
    tags: ["Algorithm", "Dynamic Programming", "Fibonacci", "Recursion", "O(n)"]
  },
  "0/1 Knapsack": {
    tags: ["Algorithm", "Dynamic Programming", "Knapsack", "Optimization", "O(nW)"]
  },
  "Longest Common Subsequence": {
    tags: ["Algorithm", "Dynamic Programming", "String", "LCS", "O(nm)"]
  },
  "Matrix Chain Multiplication": {
    tags: ["Algorithm", "Dynamic Programming", "Optimization", "O(n^3)"]
  },

  // --- Greedy ---
  "Activity Selection": {
    tags: ["Algorithm", "Greedy", "Scheduling", "O(n log n)"]
  },
  "Huffman Coding": {
    tags: ["Algorithm", "Greedy", "Compression", "Tree", "O(n log n)"]
  },
  "Fractional Knapsack": {
    tags: ["Algorithm", "Greedy", "Knapsack", "Fractional", "O(n log n)"]
  },

  // --- Backtracking ---
  "N-Queens": {
    tags: ["Algorithm", "Backtracking", "N-Queens", "Chess", "O(n!)"]
  },
  "Sudoku Solver": {
    tags: ["Algorithm", "Backtracking", "Sudoku", "Grid", "O(9^k)"]
  },
  "Rat in a Maze": {
    tags: ["Algorithm", "Backtracking", "Maze", "Pathfinding", "O(2^n)"]
  },
  "Word Break": {
    tags: ["Algorithm", "Backtracking", "String", "Dictionary", "O(2^n)"]
  }
};


export  {algorithmDetails, tagsDetail};