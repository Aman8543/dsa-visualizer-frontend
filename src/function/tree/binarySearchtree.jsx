import React, { useState, useRef, useEffect } from "react";
import { Play, RotateCcw, ListPlus, Zap, Search, PlusCircle, Trash2 } from "lucide-react";

const NODE_SIZE = 48;
const LEVEL_HEIGHT = 80;

const BSTVisualizer = () => {
  const [values, setValues] = useState("10, 5, 15, 3, 7, 12, 18");
  const [root, setRoot] = useState(null);
  const [highlighted, setHighlighted] = useState(null);
  const [foundNode, setFoundNode] = useState(null);
  const [message, setMessage] = useState("Enter numbers to create a BST!");
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchTarget, setSearchTarget] = useState("");
  const [insertValue, setInsertValue] = useState("");
  const [deleteValue, setDeleteValue] = useState("");
  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  function TreeNode(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }

  const insertNode = (root, val) => {
    if (!root) return new TreeNode(val);
    if (val < root.val) {
      root.left = insertNode(root.left, val);
    } else if (val > root.val) {
      root.right = insertNode(root.right, val);
    }
    return root;
  };
    
  // Animated Tree Build
  const buildTreeAnimated = () => {
    clearTimeouts();
    setIsAnimating(true);
    setRoot(null);
    setHighlighted(null);
    setFoundNode(null);
    setMessage("Building BST...");

    let arr = values
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((v) => !isNaN(v) && v !== "");

    if (!arr.length) {
      setMessage("❌ Invalid input.");
      setIsAnimating(false);
      return;
    }

    let aRoot = null;
    let step = 0;

    arr.forEach((num, index) => {
      let curr = aRoot;
      let stepsToInsert = [];
      while (curr) {
        stepsToInsert.push(curr.val);
        if (num < curr.val) {
          curr = curr.left;
        } else if (num > curr.val) {
          curr = curr.right;
        } else {
          // Skip duplicates
          return;
        }
      }
      
      stepsToInsert.forEach((val, i) => {
          let id = setTimeout(() => {
              setHighlighted(val);
              setMessage(`Finding position for ${num}...`);
          }, step * animationSpeed + i * animationSpeed);
          timeoutsRef.current.push(id);
      });
      step += stepsToInsert.length;

      let finalStepId = setTimeout(() => {
        aRoot = insertNode(aRoot, num);
        setRoot(JSON.parse(JSON.stringify(aRoot))); // Deep copy to trigger re-render
        setHighlighted(num);
        setMessage(`Inserted ${num}`);
        if (index === arr.length - 1) {
          setIsAnimating(false);
          setHighlighted(null);
          setMessage("✅ BST built successfully!");
        }
      }, step * animationSpeed);
      timeoutsRef.current.push(finalStepId);
      step++;
    });
  };

  const insertSingleNode = () => {
    const val = parseInt(insertValue, 10);
    if (isNaN(val)) {
      setMessage("❌ Enter a valid number to insert.");
      return;
    }
    setInsertValue("");
    clearTimeouts();
    setIsAnimating(true);
    setHighlighted(null);
    setFoundNode(null);
    setMessage(`Inserting ${val}...`);
  
    let curr = root;
    let steps = [];
  
    while (curr) {
      steps.push({ val: curr.val, msg: `Visiting ${curr.val}...` });
      if (val < curr.val) {
        curr = curr.left;
      } else if (val > curr.val) {
        curr = curr.right;
      } else {
        setMessage(`❌ Value ${val} already exists.`);
        setIsAnimating(false);
        return;
      }
    }
  
    steps.forEach((step, i) => {
      let id = setTimeout(() => {
        setHighlighted(step.val);
        setMessage(step.msg);
      }, i * animationSpeed);
      timeoutsRef.current.push(id);
    });
  
    let finalStepId = setTimeout(() => {
      const newRoot = insertNode(JSON.parse(JSON.stringify(root)), val);
      setRoot(newRoot);
      setHighlighted(val);
      setMessage(`✅ Inserted ${val}`);
      setIsAnimating(false);
    }, steps.length * animationSpeed);
    timeoutsRef.current.push(finalStepId);
  };
  
  const deleteSingleNode = () => {
    const val = parseInt(deleteValue, 10);
    if (isNaN(val)) {
      setMessage("❌ Enter a valid number to delete.");
      return;
    }
    setDeleteValue("");
    clearTimeouts();
    setIsAnimating(true);
    setHighlighted(null);
    setFoundNode(null);
    setMessage(`Deleting ${val}...`);
  
    let curr = root;
    let steps = [];
    while(curr && curr.val !== val) {
        steps.push({ val: curr.val, msg: `Visiting ${curr.val}...` });
        if(val < curr.val) curr = curr.left;
        else curr = curr.right;
    }

    if(!curr) {
        steps.push({ val: null, msg: `❌ ${val} not found.` });
    } else {
        steps.push({ val: curr.val, msg: `Found ${curr.val}. Deleting...` });
    }

    steps.forEach((step, i) => {
        let id = setTimeout(() => {
            setHighlighted(step.val);
            setMessage(step.msg);
        }, i * animationSpeed);
        timeoutsRef.current.push(id);
    });

    const finalStepId = setTimeout(() => {
        const newRoot = deleteNodeRecursive(JSON.parse(JSON.stringify(root)), val);
        setRoot(newRoot);
        setHighlighted(null);
        setMessage(`✅ Deleted ${val}`);
        setIsAnimating(false);
    }, steps.length * animationSpeed);
    timeoutsRef.current.push(finalStepId);
  };

  const deleteNodeRecursive = (currRoot, val) => {
      if(!currRoot) return null;

      if(val < currRoot.val) {
          currRoot.left = deleteNodeRecursive(currRoot.left, val);
      } else if (val > currRoot.val) {
          currRoot.right = deleteNodeRecursive(currRoot.right, val);
      } else {
          // Case 1: No child
          if(!currRoot.left && !currRoot.right) return null;
          // Case 2: One child
          if(!currRoot.left) return currRoot.right;
          if(!currRoot.right) return currRoot.left;
          // Case 3: Two children
          let successor = findMin(currRoot.right);
          currRoot.val = successor.val;
          currRoot.right = deleteNodeRecursive(currRoot.right, successor.val);
      }
      return currRoot;
  }
  
  const findMin = (node) => {
      while(node.left) {
          node = node.left;
      }
      return node;
  }

  // Search animation
  const searchNode = () => {
    if (!root) {
      setMessage("❌ Build a BST first.");
      return;
    }
    let target = parseInt(searchTarget, 10);
    if (isNaN(target)) {
      setMessage("❌ Enter a valid number to search.");
      return;
    }

    clearTimeouts();
    setIsAnimating(true);
    setHighlighted(null);
    setFoundNode(null);

    let steps = [];
    let curr = root;
    while (curr) {
      steps.push({
        val: curr.val,
        msg: `Visiting ${curr.val}...`,
        found: curr.val === target,
      });
      if (curr.val === target) break;
      if (target < curr.val) curr = curr.left;
      else curr = curr.right;
    }
    if (!curr) {
      steps.push({ val: null, msg: `❌ ${target} not found.` });
    }

    steps.forEach((step, i) => {
      let id = setTimeout(() => {
        setHighlighted(step.val);
        setMessage(step.msg);
        if (step.found) {
          setFoundNode(step.val);
          setIsAnimating(false);
        }
        if (i === steps.length - 1) setIsAnimating(false);
      }, i * animationSpeed);
      timeoutsRef.current.push(id);
    });
  };

  // Traversals
  const preorder = (node, steps) => {
    if (!node) return;
    steps.push({ val: node.val, msg: `Visiting ${node.val}` });
    preorder(node.left, steps);
    preorder(node.right, steps);
  };
  const inorder = (node, steps) => {
    if (!node) return;
    inorder(node.left, steps);
    steps.push({ val: node.val, msg: `Visiting ${node.val}` });
    inorder(node.right, steps);
  };
  const postorder = (node, steps) => {
    if (!node) return;
    postorder(node.left, steps);
    postorder(node.right, steps);
    steps.push({ val: node.val, msg: `Visiting ${node.val}` });
  };
  const levelOrder = (node, steps) => {
    if (!node) return;
    let q = [node];
    while (q.length) {
      let n = q.shift();
      steps.push({ val: n.val, msg: `Visiting ${n.val}` });
      if (n.left) q.push(n.left);
      if (n.right) q.push(n.right);
    }
  };

  const startTraversal = (type) => {
    if (!root) {
      setMessage("❌ Build a BST first.");
      return;
    }
    clearTimeouts();
    setIsAnimating(true);
    setHighlighted(null);
    setFoundNode(null);

    let steps = [];
    if (type === "pre") preorder(root, steps);
    if (type === "in") inorder(root, steps);
    if (type === "post") postorder(root, steps);
    if (type === "level") levelOrder(root, steps);

    steps.forEach((step, i) => {
      let id = setTimeout(() => {
        setHighlighted(step.val);
        setMessage(step.msg);
        if (i === steps.length - 1) setIsAnimating(false);
      }, i * animationSpeed);
      timeoutsRef.current.push(id);
    });
  };

  const reset = () => {
    clearTimeouts();
    setRoot(null);
    setHighlighted(null);
    setFoundNode(null);
    setMessage("Enter numbers to create a BST!");
    setIsAnimating(false);
  };

  // Recursive render
  const renderNode = (node, x, y, level) => {
    if (!node) return null;
    const offset = 200 / Math.pow(2, level);
    return (
      <>
        <g>
          <circle
            cx={x}
            cy={y}
            r={NODE_SIZE / 2}
            fill={
              foundNode === node.val
                ? "#22c55e"
                : highlighted === node.val
                ? "#fbbf24"
                : "#60a5fa"
            }
            stroke="#1e3a8a"
            strokeWidth="2"
          />
          <text
            x={x}
            y={y + 5}
            textAnchor="middle"
            fontSize="14"
            fill="white"
            fontWeight="bold"
          >
            {node.val}
          </text>
          {node.left && (
            <line
              x1={x}
              y1={y + NODE_SIZE / 2}
              x2={x - offset}
              y2={y + LEVEL_HEIGHT - NODE_SIZE / 2}
              stroke="#555"
              strokeWidth="2"
            />
          )}
          {node.right && (
            <line
              x1={x}
              y1={y + NODE_SIZE / 2}
              x2={x + offset}
              y2={y + LEVEL_HEIGHT - NODE_SIZE / 2}
              stroke="#555"
              strokeWidth="2"
            />
          )}
        </g>
        {renderNode(node.left, x - offset, y + LEVEL_HEIGHT, level + 1)}
        {renderNode(node.right, x + offset, y + LEVEL_HEIGHT, level + 1)}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Binary Search Tree Visualizer</h1>

        {/* Input Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <ListPlus size={16} /> Node Values (comma-separated)
            </label>
            <textarea
              rows="3"
              value={values}
              onChange={(e) => setValues(e.target.value)}
              disabled={isAnimating}
              className="textarea textarea-bordered w-full disabled:bg-gray-200"
            />
            <button
              onClick={buildTreeAnimated}
              disabled={isAnimating}
              className="btn btn-secondary btn-sm mt-2"
            >
              Build BST
            </button>
          </div>
          
          <div>
            <div className="flex flex-col gap-4">
              <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <PlusCircle size={16} /> Insert Node
                  </label>
                  <div className="flex gap-2">
                    <input type="text" value={insertValue} onChange={(e) => setInsertValue(e.target.value)} disabled={isAnimating} className="input input-bordered w-full disabled:bg-gray-200" />
                    <button onClick={insertSingleNode} disabled={isAnimating || !insertValue} className="btn btn-success btn-sm mt-2">Insert</button>
                  </div>
              </div>
              <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                      <Trash2 size={16} /> Delete Node
                  </label>
                  <div className="flex gap-2">
                      <input type="text" value={deleteValue} onChange={(e) => setDeleteValue(e.target.value)} disabled={isAnimating} className="input input-bordered w-full disabled:bg-gray-200" />
                      <button onClick={deleteSingleNode} disabled={isAnimating || !deleteValue} className="btn btn-error btn-sm mt-2">Delete</button>
                  </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Search size={16} /> Search Node
            </label>
            <input
              type="text"
              value={searchTarget}
              onChange={(e) => setSearchTarget(e.target.value)}
              disabled={isAnimating}
              className="input input-bordered w-full disabled:bg-gray-200"
            />
            <button
              onClick={searchNode}
              disabled={isAnimating || !searchTarget}
              className="btn btn-primary btn-sm mt-2"
            >
              Search
            </button>

            <div className="mt-4 flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Zap size={16} /> Animation Speed
              </label>
              <span className="text-sm font-mono">{animationSpeed}ms</span>
            </div>
            <input
              type="range"
              min="100"
              max="1500"
              step="100"
              value={1600 - animationSpeed}
              onChange={(e) => setAnimationSpeed(1600 - Number(e.target.value))}
              disabled={isAnimating}
              className="range range-primary"
            />
          </div>
        </div>

        {/* Traversal Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          <button
            className="btn btn-outline btn-primary"
            onClick={() => startTraversal("pre")}
            disabled={isAnimating}
          >
            <Play className="mr-2" /> Preorder
          </button>
          <button
            className="btn btn-outline btn-primary"
            onClick={() => startTraversal("in")}
            disabled={isAnimating}
          >
            <Play className="mr-2" /> Inorder
          </button>
          <button
            className="btn btn-outline btn-primary"
            onClick={() => startTraversal("post")}
            disabled={isAnimating}
          >
            <Play className="mr-2" /> Postorder
          </button>
          <button
            className="btn btn-outline btn-primary"
            onClick={() => startTraversal("level")}
            disabled={isAnimating}
          >
            <Play className="mr-2" /> Level Order
          </button>
          <button
            className="btn btn-ghost text-green-600"
            onClick={reset}
            disabled={isAnimating}
          >
            <RotateCcw className="mr-2" /> Reset
          </button>
        </div>

        {/* Tree Visualization */}
        <div className="flex justify-center bg-gray-50 rounded-md p-4 overflow-auto">
          <svg width="800" height="400">
            {root && renderNode(root, 400, 40, 1)}
          </svg>
        </div>

        {/* Message */}
        <div className="text-center mt-4 text-lg font-medium text-gray-700">
          {message}
        </div>
      </div>
    </div>
  );
};

export default BSTVisualizer;