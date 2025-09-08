import React, { useState, useRef, useEffect, useMemo } from "react";
import { Play, RotateCcw, ListPlus, Zap, PlusCircle, Trash2, AlertTriangle } from "lucide-react";

// Constants for visualization
const NODE_SIZE = 55; // Slightly larger for better visibility
const LEVEL_HEIGHT = 100; // Increased vertical spacing
const HORIZONTAL_SPACING_FACTOR = 1.3; // Multiplier for horizontal node spacing
const MAX_NODES = 30; // Strict limit on the number of nodes

const AVLVisualizer = () => {
  const [values, setValues] = useState("30, 20, 40, 10, 25, 35, 50");
  const [root, setRoot] = useState(null);
  const [highlightedNode, setHighlightedNode] = useState(null);
  const [message, setMessage] = useState("Enter numbers to build an AVL Tree!");
  const [animationSpeed, setAnimationSpeed] = useState(600);
  const [isAnimating, setIsAnimating] = useState(false);
  const [insertValue, setInsertValue] = useState("");
  const [deleteValue, setDeleteValue] = useState("");
  const timeoutsRef = useRef([]);
  const nodeCount = useMemo(() => countNodes(root), [root]);

  // Cleanup timeouts on component unmount
  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setIsAnimating(false);
  };
    
  // --- Core AVL Tree Logic ---

  function TreeNode(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.bf = 0; // Balance Factor
  }

  const getHeight = (node) => (node ? node.height : 0);

  const updateNodeMetrics = (node) => {
    if (node) {
      node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
      node.bf = getHeight(node.left) - getHeight(node.right);
    }
  };

  const rightRotate = (y) => {
    let x = y.left;
    let T2 = x.right;
    x.right = y;
    y.left = T2;
    updateNodeMetrics(y);
    updateNodeMetrics(x);
    return x;
  };

  const leftRotate = (x) => {
    let y = x.right;
    let T2 = y.left;
    y.left = x;
    x.right = T2;
    updateNodeMetrics(x);
    updateNodeMetrics(y);
    return y;
  };
    
  // --- Animation Queue System ---
  // A simple queue to manage sequential, timed animations
  class ActionQueue {
    constructor() {
      this.queue = [];
    }
    enqueue(action, delay) {
      this.queue.push({ action, delay });
    }
    dequeue() {
      return this.queue.shift();
    }
    isEmpty() {
      return this.queue.length === 0;
    }
  }

  const executeActions = (queue) => {
    if (queue.isEmpty()) {
      setIsAnimating(false);
      setHighlightedNode(null);
      setMessage("✅ AVL Tree is balanced.");
      return;
    }
    const { action, delay } = queue.dequeue();
    action();
    const timeoutId = setTimeout(() => executeActions(queue), delay);
    timeoutsRef.current.push(timeoutId);
  };

  // --- Main Operations (Insert, Build) ---

  const insertNode = (val) => {
    const value = parseInt(val, 10);
    if (isNaN(value)) {
      setMessage("❌ Please enter a valid number.");
      return;
    }
    if (nodeCount >= MAX_NODES) {
        setMessage(`❌ Node limit of ${MAX_NODES} reached.`);
        return;
    }

    clearTimeouts();
    setIsAnimating(true);
    setInsertValue("");
    
    const actionQueue = new ActionQueue();
    let newRoot = JSON.parse(JSON.stringify(root)); // Deep clone to manipulate

    const insertAndBalance = (node, v) => {
        if (!node) {
            actionQueue.enqueue(() => {
                setHighlightedNode(v);
                setMessage(`Inserted ${v}.`);
            }, animationSpeed);
            return new TreeNode(v);
        }

        actionQueue.enqueue(() => {
            setHighlightedNode(node.val);
            setMessage(`Inserting ${v}, visiting ${node.val}...`);
        }, animationSpeed);

        if (v < node.val) {
            node.left = insertAndBalance(node.left, v);
        } else if (v > node.val) {
            node.right = insertAndBalance(node.right, v);
        } else {
             actionQueue.enqueue(() => setMessage(`Value ${v} already exists.`), animationSpeed);
            return node; // Value already exists
        }

        updateNodeMetrics(node);
        const balance = node.bf;

        // Balance Checks and Rotations
        if (balance > 1 && v < node.left.val) { // LL Case
            actionQueue.enqueue(() => setMessage(` imbalance at ${node.val}. Right Rotating...`), animationSpeed);
            return rightRotate(node);
        }
        if (balance < -1 && v > node.right.val) { // RR Case
            actionQueue.enqueue(() => setMessage(` imbalance at ${node.val}. Left Rotating...`), animationSpeed);
            return leftRotate(node);
        }
        if (balance > 1 && v > node.left.val) { // LR Case
            actionQueue.enqueue(() => setMessage(` imbalance at ${node.val}. Left-Right Rotating...`), animationSpeed);
            node.left = leftRotate(node.left);
            return rightRotate(node);
        }
        if (balance < -1 && v < node.right.val) { // RL Case
            actionQueue.enqueue(() => setMessage(` imbalance at ${node.val}. Right-Left Rotating...`), animationSpeed);
            node.right = rightRotate(node.right);
            return leftRotate(node);
        }
        
        // Enqueue state update after each step
        actionQueue.enqueue(() => {
            setRoot(JSON.parse(JSON.stringify(newRoot)));
        }, 0);

        return node;
    };
    
    newRoot = insertAndBalance(newRoot, value);
    actionQueue.enqueue(() => setRoot(newRoot), 0);
    executeActions(actionQueue);
  };
    
  const buildTreeFromInput = () => {
    clearTimeouts();
    const arr = [...new Set(values.split(",").map(v => parseInt(v.trim())).filter(v => !isNaN(v)))]; // Unique values

    if (arr.length === 0) {
      setMessage("❌ Please enter valid, comma-separated numbers.");
      return;
    }
    if (arr.length > MAX_NODES) {
      setMessage(`❌ Input exceeds the maximum of ${MAX_NODES} nodes.`);
      return;
    }

    setIsAnimating(true);
    let tempRoot = null;
    const actionQueue = new ActionQueue();
    
    actionQueue.enqueue(() => setRoot(null), 0); // Clear the tree visually first

    arr.forEach(val => {
        // Enqueue the entire insertion logic for one value
        actionQueue.enqueue(() => {
            let innerQueue = new ActionQueue();
            
            const insertAndBalance = (node, v) => {
                if (!node) {
                    innerQueue.enqueue(() => setMessage(`Inserted ${v}`), animationSpeed);
                    return new TreeNode(v);
                }
                innerQueue.enqueue(() => {
                    setHighlightedNode(node.val);
                    setMessage(`Inserting ${v}, visiting ${node.val}...`);
                }, animationSpeed);

                if (v < node.val) node.left = insertAndBalance(node.left, v);
                else if (v > node.val) node.right = insertAndBalance(node.right, v);
                else return node;

                updateNodeMetrics(node);
                const balance = node.bf;
                 // Rotation logic identical to single insert...
                 if (balance > 1 && v < node.left.val) {
                    innerQueue.enqueue(() => setMessage(`Unbalanced at ${node.val}. Right Rotating...`), animationSpeed);
                    return rightRotate(node);
                }
                if (balance < -1 && v > node.right.val) {
                    innerQueue.enqueue(() => setMessage(`Unbalanced at ${node.val}. Left Rotating...`), animationSpeed);
                    return leftRotate(node);
                }
                if (balance > 1 && v > node.left.val) {
                    innerQueue.enqueue(() => setMessage(`Unbalanced at ${node.val}. Left-Right Rotating...`), animationSpeed);
                    node.left = leftRotate(node.left);
                    return rightRotate(node);
                }
                if (balance < -1 && v < node.right.val) {
                    innerQueue.enqueue(() => setMessage(`Unbalanced at ${node.val}. Right-Left Rotating...`), animationSpeed);
                    node.right = rightRotate(node.right);
                    return leftRotate(node);
                }
                return node;
            };
            
            tempRoot = insertAndBalance(tempRoot, val);
            innerQueue.enqueue(() => setRoot(JSON.parse(JSON.stringify(tempRoot))), 0);
            executeActions(innerQueue);
        }, 0);
    });
    
    executeActions(actionQueue);
  };

  // --- Utility and Rendering ---

  function countNodes(node) {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
  }

  const getTreeDimensions = (node) => {
    if (!node) return { width: 0, height: 0, positions: new Map() };
    
    let positions = new Map();
    let x = 0;
    
    function assignPositions(curr, depth) {
      if (!curr) return;
      assignPositions(curr.left, depth + 1);
      positions.set(curr.val, { x: x++, y: depth });
      assignPositions(curr.right, depth + 1);
    }
    
    assignPositions(node, 0);
    const height = getHeight(node);
    const width = positions.size;

    return { width, height, positions };
  };

  const treeDimensions = useMemo(() => getTreeDimensions(root), [root]);

  const renderNode = (node) => {
    if (!node || !treeDimensions.positions.has(node.val)) return null;
    
    const { x, y } = treeDimensions.positions.get(node.val);
    const posX = x * NODE_SIZE * HORIZONTAL_SPACING_FACTOR + NODE_SIZE;
    const posY = y * LEVEL_HEIGHT + NODE_SIZE;

    const leftChildPos = node.left ? treeDimensions.positions.get(node.left.val) : null;
    const rightChildPos = node.right ? treeDimensions.positions.get(node.right.val) : null;

    return (
      <g key={node.val}>
        {leftChildPos && (
          <line x1={posX} y1={posY} x2={leftChildPos.x * NODE_SIZE * HORIZONTAL_SPACING_FACTOR + NODE_SIZE} y2={leftChildPos.y * LEVEL_HEIGHT + NODE_SIZE} stroke="#94a3b8" strokeWidth="2" />
        )}
        {rightChildPos && (
          <line x1={posX} y1={posY} x2={rightChildPos.x * NODE_SIZE * HORIZONTAL_SPACING_FACTOR + NODE_SIZE} y2={rightChildPos.y * LEVEL_HEIGHT + NODE_SIZE} stroke="#94a3b8" strokeWidth="2" />
        )}
        <circle cx={posX} cy={posY} r={NODE_SIZE / 2} fill={highlightedNode === node.val ? "#facc15" : "#38bdf8"} stroke="#075985" strokeWidth="3" />
        <text x={posX} y={posY + 6} textAnchor="middle" fill="white" fontSize="1rem" fontWeight="bold">{node.val}</text>
        <text x={posX} y={posY - NODE_SIZE/2 - 8} textAnchor="middle" fill="#1e293b" fontSize="0.8rem" fontWeight="600">BF: {node.bf}</text>
        
        {renderNode(node.left)}
        {renderNode(node.right)}
      </g>
    );
  };
    
  const svgWidth = treeDimensions.width * NODE_SIZE * HORIZONTAL_SPACING_FACTOR + NODE_SIZE;
  const svgHeight = treeDimensions.height * LEVEL_HEIGHT + NODE_SIZE;

  const reset = () => {
    clearTimeouts();
    setRoot(null);
    setHighlightedNode(null);
    setValues("30, 20, 40, 10, 25, 35, 50");
    setMessage("Enter numbers to build an AVL Tree!");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-2xl">
        <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-center text-slate-800">AVL Tree Visualizer</h1>
        <div className="text-center mb-6">
             <span className={`font-mono px-3 py-1 rounded-full text-sm ${nodeCount >= MAX_NODES ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'}`}>
                Nodes: {nodeCount} / {MAX_NODES}
            </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
          <div className="lg:col-span-1">
            <label className="text-sm font-medium flex items-center gap-2 text-slate-600"><ListPlus size={16} /> Initial Values</label>
            <textarea rows="2" value={values} onChange={(e) => setValues(e.target.value)} disabled={isAnimating} className="textarea textarea-bordered w-full mt-1 disabled:bg-slate-200" />
            <button onClick={buildTreeFromInput} disabled={isAnimating} className="btn btn-secondary w-full mt-2">Build AVL Tree</button>
          </div>
          
          <div className="lg:col-span-1 flex flex-col gap-4">
              <div>
                  <label className="text-sm font-medium flex items-center gap-2 text-slate-600"><PlusCircle size={16} /> Insert Node</label>
                  <div className="flex gap-2 mt-1">
                    <input type="text" value={insertValue} onChange={(e) => setInsertValue(e.target.value)} disabled={isAnimating} className="input input-bordered w-full disabled:bg-slate-200" placeholder="e.g., 22"/>
                    <button onClick={() => insertNode(insertValue)} disabled={isAnimating || !insertValue} className="btn btn-success">Insert</button>
                  </div>
              </div>
              <div>
                  <label className="text-sm font-medium flex items-center gap-2 text-slate-600"><Trash2 size={16} /> Delete Node</label>
                  <div className="flex gap-2 mt-1">
                      <input type="text" value={deleteValue} onChange={(e) => setDeleteValue(e.target.value)} disabled={true} className="input input-bordered w-full disabled:bg-slate-200" placeholder="e.g., 10"/>
                      <button disabled={true} className="btn btn-error">Delete</button>
                  </div>
              </div>
          </div>

          <div className="lg:col-span-1">
             <label className="text-sm font-medium flex items-center gap-2 text-slate-600"><Zap size={16} /> Animation Speed</label>
             <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-mono">Slow</span>
                <span className="text-sm font-bold font-mono">{animationSpeed}ms</span>
                <span className="text-xs font-mono">Fast</span>
             </div>
             <input type="range" min="200" max="1200" step="50" value={animationSpeed} onChange={(e) => setAnimationSpeed(1400 - Number(e.target.value))} disabled={isAnimating} className="range range-primary" />
             <button onClick={reset} disabled={isAnimating} className="btn btn-outline btn-error w-full mt-4"><RotateCcw className="mr-2" /> Reset Tree</button>
          </div>
        </div>

        <div className="w-full bg-slate-50 rounded-lg p-2 overflow-x-auto border border-slate-200 min-h-[400px] flex items-center justify-center">
          {root ? (
            <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
              {renderNode(root)}
            </svg>
          ) : (
            <div className="text-slate-500">Tree is empty. Build a tree to visualize it.</div>
          )}
        </div>

        <div className="text-center mt-4 h-10 text-md font-medium text-slate-700 bg-slate-100 rounded-md flex items-center justify-center px-4">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AVLVisualizer;