import React, { useState, useRef, useEffect } from "react";
import { Play, RotateCcw, ListPlus, Zap, ChevronDown } from "lucide-react";

const NODE_SIZE = 48; // Circle size
const LEVEL_HEIGHT = 80; // Vertical distance between levels

const BinaryTreeVisualizer = () => {
  const [values, setValues] = useState("10, 5, 15, 3, 7, 12, 18");
  const [root, setRoot] = useState(null);
  const [highlighted, setHighlighted] = useState(null);
  const [message, setMessage] = useState("Enter values to build the tree!");
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  // Binary Tree Node
  function TreeNode(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }

  // Insert node into BST
  const insertNode = (root, val) => {
    if (!root) return new TreeNode(val);
    if (val < root.val) root.left = insertNode(root.left, val);
    else root.right = insertNode(root.right, val);
    return root;
  };

  // Build tree from input
  const buildTree = () => {
    clearTimeouts();
    setIsAnimating(false);
    setHighlighted(null);
    let arr = values
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((v) => !isNaN(v));
    if (arr.length === 0) {
      setMessage("❌ Please enter valid numbers.");
      return;
    }
    let newRoot = null;
    arr.forEach((num) => {
      newRoot = insertNode(newRoot, num);
    });
    setRoot(newRoot);
    setMessage("✅ Tree built successfully!");
  };

  // Traversal functions
  const preorder = (node, steps) => {
    if (!node) return;
    steps.push({ val: node.val, msg: `Visiting node ${node.val}` });
    preorder(node.left, steps);
    preorder(node.right, steps);
  };

  const inorder = (node, steps) => {
    if (!node) return;
    inorder(node.left, steps);
    steps.push({ val: node.val, msg: `Visiting node ${node.val}` });
    inorder(node.right, steps);
  };

  const postorder = (node, steps) => {
    if (!node) return;
    postorder(node.left, steps);
    postorder(node.right, steps);
    steps.push({ val: node.val, msg: `Visiting node ${node.val}` });
  };

  const levelOrder = (node, steps) => {
    if (!node) return;
    let queue = [node];
    while (queue.length) {
      let curr = queue.shift();
      steps.push({ val: curr.val, msg: `Visiting node ${curr.val}` });
      if (curr.left) queue.push(curr.left);
      if (curr.right) queue.push(curr.right);
    }
  };

  // Animate traversal
  const startTraversal = (type) => {
    if (!root) {
      setMessage("❌ Please build a tree first.");
      return;
    }
    clearTimeouts();
    setIsAnimating(true);
    setHighlighted(null);

    let steps = [];
    if (type === "pre") preorder(root, steps);
    if (type === "in") inorder(root, steps);
    if (type === "post") postorder(root, steps);
    if (type === "level") levelOrder(root, steps);

    steps.forEach((step, i) => {
      let id = setTimeout(() => {
        setHighlighted(step.val);
        setMessage(step.msg);
        if (i === steps.length - 1) {
          setIsAnimating(false);
        }
      }, i * animationSpeed);
      timeoutsRef.current.push(id);
    });
  };

  const reset = () => {
    clearTimeouts();
    setRoot(null);
    setHighlighted(null);
    setMessage("Enter values to build the tree!");
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
            fill={highlighted === node.val ? "#fbbf24" : "#60a5fa"}
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
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Binary Tree Visualizer</h1>

        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
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
              onClick={buildTree}
              disabled={isAnimating}
              className="btn btn-secondary btn-sm mt-2"
            >
              Build Tree
            </button>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Zap size={16} /> Animation Speed
            </label>
            <span className="text-sm font-mono text-gray-600">
              {animationSpeed}ms
            </span>
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
            className="btn btn-primary"
            onClick={() => startTraversal("pre")}
            disabled={isAnimating}
          >
            <Play className="mr-2" /> Preorder
          </button>
          <button
            className="btn btn-primary"
            onClick={() => startTraversal("in")}
            disabled={isAnimating}
          >
            <Play className="mr-2" /> Inorder
          </button>
          <button
            className="btn btn-primary"
            onClick={() => startTraversal("post")}
            disabled={isAnimating}
          >
            <Play className="mr-2" /> Postorder
          </button>
          <button
            className="btn btn-primary"
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

export default BinaryTreeVisualizer;
