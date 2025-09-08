import React from 'react';
// Import icons from react-icons
import { FaSearch, FaSortAmountDown, FaProjectDiagram, FaBalanceScale, FaLightbulb, FaUndo } from 'react-icons/fa';
import { BsTree } from 'react-icons/bs';

import BinarySearchVisualizer from './function/binarySearch';
import LinearSearchVisualizer from './function/LinearSearch';
import JumpSearchVisualizer from './function/jumpSearch';
import ExponentialSearchVisualizer from './function/exponentialSearch';

//sort
import MergeSortVisualizer from './function/mergeShort';
import BubbleSortVisualizer from './function/bubbleSort';
import SelectionSortVisualizer from './function/selectionShort';
import InsertionSortVisualizer from './function/insertionShort';
import HeapSortVisualizer from './function/heapSort';
import QuickSortVisualizer from './function/quicksort';

//tree
import BinaryTreeVisualizer from './function/tree/binarytree';
import BSTVisualizer from './function/tree/binarySearchtree';
import AVLVisualizer from './function/tree/avlTree';
import SegmentTreeVisualizer from './function/tree/segmentTree';
import TrieVisualizer from './function/tree/trie';

//graph
import BFSVisualizer from './function/graph/bsf';
import DFSGraphVisualizer from './function/graph/dfs';
import DijkstraVisualizer from './function/graph/dijstra';
import KruskalVisualizer from './function/graph/krushkal';
import PrimVisualizer from './function/graph/prims';

import DefaultFunction from "./function/default";

const globaldata=[
      {
        title: "Searching",
        icon: <FaSearch className="text-info" size={24} />,
        items: ["Linear Search", "Binary Search", "Jump Search", "Exponential Search"],
        func:[LinearSearchVisualizer,BinarySearchVisualizer,JumpSearchVisualizer,ExponentialSearchVisualizer]
      },
      {
        title: "Sorting",
        icon: <FaSortAmountDown className="text-success" size={24} />,
        items: ["Bubble Sort", "Selection Sort", "Insertion Sort", "Merge Sort", "Quick Sort", "Heap Sort"],
        func:[BubbleSortVisualizer,SelectionSortVisualizer,InsertionSortVisualizer,MergeSortVisualizer,QuickSortVisualizer,HeapSortVisualizer]
      },
      {
        title: "Tree",
        icon: <BsTree className="text-accent" size={24} />,
        items: ["Binary Tree", "Binary Search Tree", "AVL Tree", "Segment Tree", "Trie"],
        func:[BinaryTreeVisualizer,BSTVisualizer,AVLVisualizer,SegmentTreeVisualizer,TrieVisualizer]
      },
      {
        title: "Graph",
        icon: <FaProjectDiagram className="text-warning" size={24} />,
        items: ["BFS", "DFS", "Dijkstra’s Algorithm", "Kruskal’s Algorithm", "Prim’s Algorithm"],
        func:[BFSVisualizer,DFSGraphVisualizer,DijkstraVisualizer,KruskalVisualizer,PrimVisualizer]
      },
      // {
      //   title: "Dynamic Programming",
      //   icon: <FaLightbulb className="text-primary" size={24} />,
      //   items: ["Fibonacci", "0/1 Knapsack", "Longest Common Subsequence", "Matrix Chain Multiplication"],
      //   func:[DefaultFunction,DefaultFunction,DefaultFunction,DefaultFunction]
      // },
      // {
      //   title: "Greedy",
      //   icon: <FaBalanceScale className="text-secondary" size={24} />,
      //   items: ["Activity Selection", "Huffman Coding", "Fractional Knapsack"],
      //   func:[DefaultFunction,DefaultFunction,DefaultFunction]
      // },
      // {
      //   title: "Backtracking",
      //   icon: <FaUndo className="text-error" size={24} />,
      //   items: ["N-Queens", "Sudoku Solver", "Rat in a Maze", "Word Break"],
      //   func:[DefaultFunction,DefaultFunction,DefaultFunction,DefaultFunction]
      // },
    ];

export default globaldata;