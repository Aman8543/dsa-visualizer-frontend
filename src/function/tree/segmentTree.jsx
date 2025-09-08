import React, { useState, useRef, useEffect, useMemo } from "react";
import { Zap, RotateCcw, ListPlus, ShieldQuestion, Edit3, AlertTriangle } from "lucide-react";

// --- Constants ---
const NODE_SIZE = 60; // Size of each node circle (diameter)
const LEVEL_HEIGHT = 100; // Vertical spacing between levels
const HORIZONTAL_SPACING_UNIT = NODE_SIZE * 1.5; // Base unit for horizontal spacing between nodes
const MAX_ELEMENTS = 16; // Strict limit on the number of elements in the input array

const SegmentTreeVisualizer = () => {
  // --- State Management ---
  const [inputArray, setInputArray] = useState("3, 7, 2, 5, 8, 1, 6, 4");
  const [tree, setTree] = useState([]); // Array representation of the segment tree nodes
  const [operation, setOperation] = useState("sum"); // 'sum', 'min', or 'max'
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(600); // Milliseconds per animation step

  // State for interactive operations (query/update)
  const [queryRange, setQueryRange] = useState({ start: "1", end: "5" });
  const [updateInfo, setUpdateInfo] = useState({ index: "2", value: "9" });
  const [queryResult, setQueryResult] = useState(null);

  // States for visual highlighting during animations
  const [message, setMessage] = useState("Enter an array to build a Segment Tree.");
  const [highlightedNodes, setHighlightedNodes] = useState([]); // [{ index: treeIdx, color: '#hex' }]
  const [highlightedArrayRange, setHighlightedArrayRange] = useState({ start: -1, end: -1 });

  const timeoutsRef = useRef([]); // To keep track of active timeouts for cleanup

  // --- Effect for Cleanup on Component Unmount ---
  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  // --- Animation Control Utilities ---
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setIsAnimating(false);
  };

  // Orchestrates a sequence of animation actions with controlled delays
  const runAnimations = (actions) => {
    clearAllTimeouts(); // Clear any ongoing animations before starting new ones
    if (actions.length === 0) {
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    let cumulativeDelay = 0;
    actions.forEach(({ func, delay }, i) => {
      const timeoutId = setTimeout(() => {
        func();
        if (i === actions.length - 1) { // If this is the last action, end animation
          setIsAnimating(false);
          setHighlightedNodes([]);
          setHighlightedArrayRange({ start: -1, end: -1 });
        }
      }, cumulativeDelay);
      timeoutsRef.current.push(timeoutId);
      cumulativeDelay += delay;
    });
  };

  // --- Reset Function ---
  const resetState = () => {
    clearAllTimeouts();
    setTree([]);
    setHighlightedNodes([]);
    setHighlightedArrayRange({ start: -1, end: -1 });
    setMessage("Enter an array to build a Segment Tree.");
    setQueryResult(null);
    setInputArray("3, 7, 2, 5, 8, 1, 6, 4"); // Reset input for user convenience
  };

  // --- Segment Tree Core Logic Helpers ---
  const merge = (val1, val2) => {
    if (operation === "sum") return val1 + val2;
    if (operation === "min") return Math.min(val1, val2);
    if (operation === "max") return Math.max(val1, val2);
    return 0; // Fallback or error
  };

  const getIdentityElement = () => {
    if (operation === "sum") return 0;
    if (operation === "min") return Infinity;
    if (operation === "max") return -Infinity;
  };

  // --- Tree Layout Calculation (for responsive SVG rendering) ---
  // This function computes the x, y pixel coordinates for each node in the tree
  // based on its logical position, ensuring nodes do not overlap horizontally.
  // It returns a map of nodeIndex -> {pixelX, pixelY} and the overall SVG viewBox dimensions.
  const getTreeLayout = (currentTree, arrayLength) => {
    // Return default empty layout if tree data is not available
    if (!currentTree || currentTree.length === 0 || !currentTree[0]) {
      return { nodes: new Map(), svgWidth: 0, svgHeight: 0, viewBox: "0 0 0 0" };
    }

    const nodePositions = new Map();
    let currentRelativeX = 0; // Counter for inorder traversal to determine relative X-order

    // Step 1: Assign a unique, ordered relativeX to each node using inorder traversal.
    // This ensures correct horizontal ordering and spacing without overlaps.
    function assignRelativeX(idx) {
      if (!currentTree[idx]) return; // Stop if node doesn't exist

      assignRelativeX(2 * idx + 1); // Traverse left child recursively
      
      // Assign relative X and calculate its level (depth) for the current node
      nodePositions.set(idx, {
        relativeX: currentRelativeX,
        level: Math.floor(Math.log2(idx + 1)) // Level in a 0-indexed perfect binary tree
      });
      currentRelativeX++; // Increment for the next node in the inorder sequence

      assignRelativeX(2 * idx + 2); // Traverse right child recursively
    }

    assignRelativeX(0); // Start the inorder traversal from the root (index 0)

    // Step 2: Calculate actual pixel coordinates based on relative X and level.
    // Also, determine the overall bounding box (min/max pixel coordinates) for the SVG viewBox.
    let minPixelX = Infinity, maxPixelX = -Infinity;
    let maxPixelY = -Infinity; // minPixelY will be 0 as the root is effectively at y=0

    const finalNodePositions = new Map();
    const totalRelativeUnits = currentRelativeX; // Total width in "relative units" (number of leaves)

    // Calculate the horizontal offset needed to center the entire tree in the SVG
    const centeringOffsetX = (totalRelativeUnits * HORIZONTAL_SPACING_UNIT - NODE_SIZE) / 2;

    nodePositions.forEach((pos, idx) => {
      // Calculate pixel coordinates for the center of the node
      const pixelX = pos.relativeX * HORIZONTAL_SPACING_UNIT + NODE_SIZE / 2 - centeringOffsetX;
      const pixelY = pos.level * LEVEL_HEIGHT + NODE_SIZE / 2;

      // Store final pixel positions and original node data for rendering
      finalNodePositions.set(idx, {
        pixelX,
        pixelY,
        value: currentTree[idx].value,
        range: currentTree[idx].range,
      });

      // Update the bounding box for the SVG viewBox calculation
      minPixelX = Math.min(minPixelX, pixelX - NODE_SIZE / 2); // Left edge of the node
      maxPixelX = Math.max(maxPixelX, pixelX + NODE_SIZE / 2); // Right edge of the node
      maxPixelY = Math.max(maxPixelY, pixelY + NODE_SIZE / 2); // Bottom edge of the node
    });
    
    // Add padding around the calculated bounding box for visual spacing
    const paddingX = NODE_SIZE;
    const paddingY = NODE_SIZE / 2;

    minPixelX -= paddingX;
    maxPixelX += paddingX;
    maxPixelY += paddingY;

    // Calculate effective width and height for the SVG viewBox
    const svgContentWidth = Math.max(0, maxPixelX - minPixelX);
    const svgContentHeight = Math.max(0, maxPixelY - (0)); // Tree starts at y=0

    return {
      nodes: finalNodePositions,
      // Fixed large width/height for SVG element to allow CSS scaling,
      // viewBox handles the actual content scaling
      svgWidth: Math.max(800, svgContentWidth), // Ensure a minimum SVG width
      svgHeight: Math.max(400, svgContentHeight), // Ensure a minimum SVG height
      // viewBox string: "x y width height"
      viewBox: `${minPixelX} ${0} ${svgContentWidth} ${svgContentHeight}`,
    };
  };

  // Memoize the tree layout calculations for performance.
  // This hook ensures that layout is recalculated only when `tree` or `inputArray` changes,
  // preventing unnecessary re-renders and improving animation smoothness.
  const treeLayout = useMemo(() => {
    const parsedInputArrayLength = inputArray.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n)).length;
    return getTreeLayout(tree, parsedInputArrayLength);
  }, [tree, inputArray]); // Dependencies: `tree` data and `inputArray` string (its length affects tree shape)


  // --- Segment Tree Operations ---

  // Build Operation
  const buildSegmentTree = () => {
    resetState(); // Reset visual state before building
    const arr = inputArray.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    
    // Input validation for array length
    if (arr.length === 0) {
      setMessage("❌ Please enter at least one number.");
      return;
    }
    if (arr.length > MAX_ELEMENTS) {
      setMessage(`❌ Input exceeds the maximum of ${MAX_ELEMENTS} elements.`);
      return;
    }
    
    // Calculate the required size for the segment tree array (max 4*N, typically)
    const treeSize = 2 * Math.pow(2, Math.ceil(Math.log2(arr.length))) - 1;
    const newTree = new Array(treeSize).fill(null); // Initialize segment tree array
    const actions = []; // To store a sequence of animation steps

    // Recursive helper function for building the tree
    function build(treeIndex, start, end) {
      // Step 1: Highlight the current array range being processed for this node
      actions.push({ func: () => {
          setHighlightedArrayRange({ start, end });
          setMessage(`Building node for array range [${start}-${end}]...`);
      }, delay: animationSpeed / 2 });

      if (start === end) { // Base case: If it's a leaf node (corresponds to a single element in input array)
        newTree[treeIndex] = { value: arr[start], range: [start, end] };
        actions.push({ func: () => {
          setTree([...newTree]); // Update React state to re-render the tree
          setHighlightedNodes([{ index: treeIndex, color: '#38bdf8' }]); // Highlight the new leaf node as built (blue)
          setMessage(`Leaf node for index ${start} with value ${arr[start]}.`);
        }, delay: animationSpeed });
        return;
      }

      // Recursive step: For internal nodes, build children first
      const mid = Math.floor((start + end) / 2);
      build(2 * treeIndex + 1, start, mid); // Build left child
      build(2 * treeIndex + 2, mid + 1, end); // Build right child
      
      // Step 2: After children are built, merge their values to get current node's value
      const mergedValue = merge(newTree[2 * treeIndex + 1].value, newTree[2 * treeIndex + 2].value);
      newTree[treeIndex] = { value: mergedValue, range: [start, end] };

      actions.push({ func: () => {
        setTree([...newTree]); // Update React state with the newly computed node
        setHighlightedNodes([
          { index: treeIndex, color: '#facc15' }, // Highlight current node (yellow)
          { index: 2 * treeIndex + 1, color: '#60a5fa' }, // Highlight left child (blue)
          { index: 2 * treeIndex + 2, color: '#60a5fa' }, // Highlight right child (blue)
        ]);
        setMessage(`Combining values from children of [${start}-${end}]: ${newTree[2 * treeIndex + 1].value} & ${newTree[2 * treeIndex + 2].value} => ${mergedValue}.`);
      }, delay: animationSpeed });
    }
    
    build(0, 0, arr.length - 1); // Start building from the root of the segment tree (index 0)
    actions.push({ func: () => setMessage("✅ Segment Tree built successfully!"), delay: animationSpeed });
    runAnimations(actions); // Execute the collected animation steps
  };

  // Query Operation
  const performQuery = () => {
    const startIdx = parseInt(queryRange.start, 10);
    const endIdx = parseInt(queryRange.end, 10);
    const arrLength = inputArray.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n)).length;

    // Input and tree state validation
    if (isNaN(startIdx) || isNaN(endIdx) || startIdx > endIdx || startIdx < 0 || endIdx >= arrLength) {
        setMessage("❌ Invalid query range. Please use valid indices.");
        return;
    }
    if (!tree.length || !tree[0]) {
        setMessage("❌ Tree is empty. Build a tree first to perform a query.");
        return;
    }
    
    clearAllTimeouts(); // Clear any ongoing animations
    const actions = []; // Collect animation steps
    let finalResult = getIdentityElement(); // Initialize result with identity element for current operation

    // Recursive helper for performing the query
    function query(treeIndex, nodeStart, nodeEnd) {
        actions.push({ func: () => {
            setHighlightedNodes([{ index: treeIndex, color: '#fbbf24' }]); // Highlight node being visited (yellow)
            setHighlightedArrayRange({ start: startIdx, end: endIdx }); // Keep array range highlighted
            setMessage(`Querying range [${startIdx}-${endIdx}], visiting tree node [${nodeStart}-${nodeEnd}]...`);
        }, delay: animationSpeed });
        
        // Case 1: No overlap with query range
        if (endIdx < nodeStart || startIdx > nodeEnd) {
            actions.push({ func: () => {
                setHighlightedNodes([{ index: treeIndex, color: '#9ca3af' }]); // No overlap color (grey)
                setMessage(`Node [${nodeStart}-${nodeEnd}] has no overlap with query range. Returning identity.`);
            }, delay: animationSpeed });
            return getIdentityElement(); // Return identity element as this node's value is not relevant
        }

        // Case 2: Total overlap with query range
        if (startIdx <= nodeStart && endIdx >= nodeEnd) {
            actions.push({ func: () => {
                setHighlightedNodes([{ index: treeIndex, color: '#4ade80' }]); // Total overlap color (green)
                setMessage(`Node [${nodeStart}-${nodeEnd}] is fully within query range. Taking value: ${tree[treeIndex].value}.`);
            }, delay: animationSpeed });
            return tree[treeIndex].value; // Return the node's precomputed value
        }

        // Case 3: Partial overlap (recurse to children)
        actions.push({ func: () => setMessage(`Partial overlap for [${nodeStart}-${nodeEnd}]. Recursing to children...`), delay: animationSpeed });
        const mid = Math.floor((nodeStart + nodeEnd) / 2);
        const leftResult = query(2 * treeIndex + 1, nodeStart, mid); // Query left child
        const rightResult = query(2 * treeIndex + 2, mid + 1, nodeEnd); // Query right child
        
        const mergedQueryResult = merge(leftResult, rightResult); // Merge results from children
        actions.push({ func: () => {
            setHighlightedNodes([{ index: treeIndex, color: '#a78bfa' }]); // Combining results color (purple)
            setMessage(`Combining results from children: ${leftResult} and ${rightResult} => ${mergedQueryResult}.`);
        }, delay: animationSpeed });
        return mergedQueryResult;
    }
    
    finalResult = query(0, 0, arrLength - 1); // Start query from the root of the segment tree (index 0)
    actions.push({ func: () => {
        setMessage(`✅ Query Result for range [${startIdx}-${endIdx}] is ${finalResult}.`);
        setQueryResult(finalResult); // Display final result
    }, delay: animationSpeed });
    runAnimations(actions); // Execute the collected animation steps
  };
    
  // Update Operation
  const performUpdate = () => {
      const index = parseInt(updateInfo.index, 10);
      const value = parseInt(updateInfo.value, 10);
      const arrLength = inputArray.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n)).length;

      // Input and tree state validation
      if (isNaN(index) || isNaN(value) || index < 0 || index >= arrLength) {
          setMessage("❌ Invalid update index or value. Please use valid indices.");
          return;
      }
      if (!tree.length || !tree[0]) {
          setMessage("❌ Tree is empty. Build a tree first to perform an update.");
          return;
      }

      clearAllTimeouts(); // Clear any ongoing animations
      const actions = []; // Collect animation steps
      const newTree = JSON.parse(JSON.stringify(tree)); // Deep copy the tree to modify it

      // Recursive helper for performing the update
      function update(treeIndex, nodeStart, nodeEnd) {
          actions.push({ func: () => {
               setHighlightedNodes([{ index: treeIndex, color: '#fbbf24' }]); // Highlight node being visited (yellow)
               setHighlightedArrayRange({ start: index, end: index }); // Highlight the updated element in the original array
               setMessage(`Traversing to update index ${index} to ${value}, visiting tree node [${nodeStart}-${nodeEnd}]...`);
          }, delay: animationSpeed });

          // Base case: If it's a leaf node and its range matches the update index
          if (nodeStart === nodeEnd) {
              newTree[treeIndex].value = value; // Update the leaf node's value
              actions.push({ func: () => {
                   setHighlightedNodes([{ index: treeIndex, color: '#4ade80' }]); // Highlight updated leaf (green)
                   setMessage(`Updated leaf node at index ${nodeStart} to ${value}.`);
                   setTree([...newTree]); // Trigger re-render with updated value
              }, delay: animationSpeed });
              return;
          }

          // Recursive step: Determine which child covers the update index and recurse
          const mid = Math.floor((nodeStart + nodeEnd) / 2);
          if (index <= mid) {
              update(2 * treeIndex + 1, nodeStart, mid); // Go left
          } else {
              update(2 * treeIndex + 2, mid + 1, nodeEnd); // Go right
          }
          
          // After children are updated, propagate the change upwards by merging children's values
          newTree[treeIndex].value = merge(newTree[2 * treeIndex + 1].value, newTree[2 * treeIndex + 2].value);
          actions.push({ func: () => {
              setHighlightedNodes([{ index: treeIndex, color: '#a78bfa' }]); // Propagating update color (purple)
              setMessage(`Propagating update upwards. Node [${nodeStart}-${nodeEnd}] new value: ${newTree[treeIndex].value}.`);
              setTree([...newTree]); // Trigger re-render with propagated value
          }, delay: animationSpeed });
      }

      update(0, 0, arrLength - 1); // Start update from the root of the segment tree

      // Also update the source array input string to reflect the change visually
      const currentArray = inputArray.split(",").map(n => parseInt(n.trim()));
      currentArray[index] = value;
      setInputArray(currentArray.join(", ")); // Update the text input field

      actions.push({ func: () => setMessage(`✅ Update to index ${index} complete.`), delay: animationSpeed });
      runAnimations(actions); // Execute the collected animation steps
  };
    
  // --- Rendering JSX for SVG ---
  // Renders a single node and recursively its children
  const renderTreeSvg = (treeIndex) => {
    // Retrieve pre-calculated position and data for the current node
    const nodeData = treeLayout.nodes.get(treeIndex);
    if (!nodeData) return null; // If node doesn't exist in layout map (e.g., beyond array bounds)

    const { pixelX, pixelY, value, range } = nodeData;
    const highlight = highlightedNodes.find(h => h.index === treeIndex); // Check if this node is highlighted

    // Get child indices and their layout data
    const leftChildIdx = 2 * treeIndex + 1;
    const rightChildIdx = 2 * treeIndex + 2;
    const leftChildData = treeLayout.nodes.get(leftChildIdx);
    const rightChildData = treeLayout.nodes.get(rightChildIdx);

    return (
      <g key={treeIndex}> {/* Use treeIndex as key for unique identification */}
        {/* Lines connecting parent to children */}
        {leftChildData && (
          <line x1={pixelX} y1={pixelY + NODE_SIZE / 2} 
                x2={leftChildData.pixelX} y2={leftChildData.pixelY - NODE_SIZE / 2} 
                stroke="#9ca3af" strokeWidth="2" />
        )}
        {rightChildData && (
          <line x1={pixelX} y1={pixelY + NODE_SIZE / 2} 
                x2={rightChildData.pixelX} y2={rightChildData.pixelY - NODE_SIZE / 2} 
                stroke="#9ca3af" strokeWidth="2" />
        )}
        
        {/* Node Circle */}
        <circle cx={pixelX} cy={pixelY} r={NODE_SIZE / 2} 
                fill={highlight ? highlight.color : "#cbd5e1"} // Conditional fill color for highlighting
                stroke="#475569" strokeWidth="3" />
        
        {/* Node Value Text (centered within the circle) */}
        <text x={pixelX} y={pixelY} textAnchor="middle" dy=".3em" 
              fill="#1e293b" fontSize="1rem" fontWeight="bold">
          {value}
        </text>
        
        {/* Node Range Text (displayed below the circle) */}
        <text x={pixelX} y={pixelY + NODE_SIZE / 2 + 15} textAnchor="middle" 
              fill="#475569" fontSize="0.8rem">
          [{range.join('-')}]
        </text>

        {/* Recursively render children */}
        {renderTreeSvg(leftChildIdx)}
        {renderTreeSvg(rightChildIdx)}
      </g>
    );
  };

  // Get current number of elements in the input array for display purposes
  const currentArrayLength = inputArray.split(",").map(n => parseInt(n.trim())).filter(n => !isNaN(n)).length;

  return (
    <div className="min-h-screen bg-slate-100 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-2xl">
        <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-center text-slate-800">Segment Tree Visualizer</h1>
        
        {/* Node Count Display and Warnings */}
        <div className="text-center mb-6">
             <span className={`font-mono px-3 py-1 rounded-full text-sm ${currentArrayLength > MAX_ELEMENTS ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'}`}>
                Array Elements: {currentArrayLength} / {MAX_ELEMENTS}
            </span>
            {currentArrayLength > MAX_ELEMENTS && (
                <p className="text-red-500 text-sm mt-1 flex items-center justify-center">
                    <AlertTriangle size={16} className="mr-1"/> Input array is too large! Max {MAX_ELEMENTS} elements.
                </p>
            )}
        </div>

        {/* Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            {/* Build Controls */}
            <div className="p-4 bg-slate-50 rounded-lg border">
                <label className="text-sm font-medium flex items-center gap-2 text-slate-600"><ListPlus size={16} /> Input Array</label>
                <input type="text" value={inputArray} onChange={e => setInputArray(e.target.value)} disabled={isAnimating} className="input input-bordered w-full mt-1" />
                <select value={operation} onChange={e => setOperation(e.target.value)} disabled={isAnimating} className="select select-bordered w-full mt-2">
                    <option value="sum">Range Sum</option>
                    <option value="min">Range Minimum</option>
                    <option value="max">Range Maximum</option>
                </select>
                <button onClick={buildSegmentTree} disabled={isAnimating || currentArrayLength === 0 || currentArrayLength > MAX_ELEMENTS} className="btn btn-secondary w-full mt-2">Build Tree</button>
            </div>
            {/* Query Controls */}
            <div className="p-4 bg-slate-50 rounded-lg border">
                <label className="text-sm font-medium flex items-center gap-2 text-slate-600"><ShieldQuestion size={16} /> Range Query</label>
                <div className="flex gap-2 mt-1">
                    <input type="text" value={queryRange.start} onChange={e => setQueryRange({...queryRange, start: e.target.value})} disabled={isAnimating || !tree.length} className="input input-bordered w-full" placeholder="Start Index" />
                    <input type="text" value={queryRange.end} onChange={e => setQueryRange({...queryRange, end: e.target.value})} disabled={isAnimating || !tree.length} className="input input-bordered w-full" placeholder="End Index" />
                </div>
                 <button onClick={performQuery} disabled={isAnimating || !tree.length} className="btn btn-primary w-full mt-2">Query</button>
                 {queryResult !== null && <div className="mt-2 text-center font-bold text-slate-700">Result: {queryResult}</div>}
            </div>
            {/* Update Controls */}
            <div className="p-4 bg-slate-50 rounded-lg border">
                 <label className="text-sm font-medium flex items-center gap-2 text-slate-600"><Edit3 size={16} /> Point Update</label>
                <div className="flex gap-2 mt-1">
                    <input type="text" value={updateInfo.index} onChange={e => setUpdateInfo({...updateInfo, index: e.target.value})} disabled={isAnimating || !tree.length} className="input input-bordered w-full" placeholder="Index" />
                    <input type="text" value={updateInfo.value} onChange={e => setUpdateInfo({...updateInfo, value: e.target.value})} disabled={isAnimating || !tree.length} className="input input-bordered w-full" placeholder="New Value" />
                </div>
                <button onClick={performUpdate} disabled={isAnimating || !tree.length} className="btn btn-accent w-full mt-2">Update</button>
            </div>
             {/* General Controls */}
            <div className="p-4 bg-slate-50 rounded-lg border">
                 <label className="text-sm font-medium flex items-center gap-2 text-slate-600"><Zap size={16} /> Animation Speed</label>
                 <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-mono">Slow (1000ms)</span>
                    <span className="text-sm font-bold font-mono">{animationSpeed}ms</span>
                    <span className="text-xs font-mono">Fast (100ms)</span>
                 </div>
                 <input type="range" min="100" max="1000" step="50" 
                    value={animationSpeed} // Direct value for slider
                    onChange={e => setAnimationSpeed(Number(e.target.value))} // Direct speed setting
                    disabled={isAnimating} className="range range-primary" />
                 <button onClick={resetState} disabled={isAnimating} className="btn btn-outline btn-error w-full mt-8"><RotateCcw className="mr-2" /> Reset</button>
            </div>
        </div>

        {/* Visualization Area */}
        <div className="w-full bg-slate-50 rounded-lg p-2 overflow-x-auto border border-slate-200 min-h-[400px] flex flex-col items-center justify-center">
            {tree.length > 0 && treeLayout.svgWidth > 0 && treeLayout.svgHeight > 0 ? (
                <>
                {/* Segment Tree SVG */}
                {/* SVG width/height are based on calculated content size. viewBox ensures proper scaling and centering. */}
                <svg width={treeLayout.svgWidth} height={treeLayout.svgHeight} viewBox={treeLayout.viewBox} className="min-w-[400px] flex-grow">
                    {renderTreeSvg(0)} {/* Start rendering from the root of the tree (index 0) */}
                </svg>
                
                {/* Original Array Visualization (below the tree) */}
                <div className="flex mt-8 p-2">
                    {inputArray.split(",").map((val, i) => (
                        <div key={i} className="flex flex-col items-center mx-1">
                            <div className={`w-12 h-12 flex items-center justify-center font-bold text-lg border-2 rounded 
                                ${i >= highlightedArrayRange.start && i <= highlightedArrayRange.end ? 'bg-sky-200 border-sky-500' : 'bg-white border-slate-400'}`}>
                                {val.trim()}
                            </div>
                            <div className="text-xs mt-1 text-slate-500">Index {i}</div>
                        </div>
                    ))}
                </div>
                </>
            ) : (
                <div className="text-slate-500 text-center">Tree is empty. Enter an array and click "Build Tree" to visualize it.</div>
            )}
        </div>

        {/* Message Bar */}
        <div className="text-center mt-4 h-10 text-md font-medium text-slate-700 bg-slate-100 rounded-md flex items-center justify-center px-4">
            <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default SegmentTreeVisualizer;