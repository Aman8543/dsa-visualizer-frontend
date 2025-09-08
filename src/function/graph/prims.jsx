import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, GitGraph, Code, Link, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const NODE_RADIUS = 20;
const NODE_COLORS = {
  default: 'bg-gray-400',
  inMST: 'bg-blue-600',
  active: 'bg-green-600', // Node currently being processed
  inFringe: 'bg-purple-600', // Nodes connected to MST but not yet in it
};

const EDGE_COLORS = {
  default: 'stroke-gray-400',
  processed: 'stroke-gray-600',
  active: 'stroke-green-600', // Current minimum edge being evaluated
  inMST: 'stroke-blue-600',
  rejected: 'stroke-red-600', // Edge considered but not the min for this step
};

// --- Min-Priority Queue ---
// A simple array-based min-priority queue for demonstration
class MinPriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(element, priority) {
    this.elements.push({ element, priority });
    this.elements.sort((a, b) => a.priority - b.priority); // Keep sorted
  }

  dequeue() {
    if (this.isEmpty()) return null;
    return this.elements.shift().element;
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  // Peek at the smallest element without removing it
  peek() {
    if (this.isEmpty()) return null;
    return this.elements[0].element;
  }

  // Check if an element (node) is in the queue
  contains(nodeId) {
    return this.elements.some(item => item.element.to === nodeId || item.element.from === nodeId);
  }

  // Get current elements for visualization
  getElements() {
    return this.elements.map(item => item.element);
  }
}

// --- Helper to generate a random graph ---
const generateRandomGraph = (numNodes = 6, density = 0.5) => {
  const nodes = Array.from({ length: numNodes }, (_, i) => ({ id: i, x: 0, y: 0 }));
  const edges = [];
  const minWeight = 1;
  const maxWeight = 15;

  const centerX = 300;
  const centerY = 200;
  const radius = 150;
  nodes.forEach((node, i) => {
    const angle = (i / numNodes) * 2 * Math.PI;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });

  for (let i = 0; i < numNodes; i++) {
    for (let j = i + 1; j < numNodes; j++) {
      if (Math.random() < density) {
        const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
        edges.push({ from: i, to: j, weight, id: `${i}-${j}` });
      }
    }
  }

  // Ensure graph is connected enough (add edges if too sparse)
  if (edges.length < numNodes - 1 && numNodes > 1) {
    // Basic connectivity: ensure each node has at least one edge
    for (let i = 0; i < numNodes; i++) {
      const connectedEdges = edges.filter(e => e.from === i || e.to === i);
      if (connectedEdges.length === 0 && i < numNodes - 1) {
        const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
        edges.push({ from: i, to: i + 1, weight, id: `${i}-${i+1}` });
      }
    }
  }

  return { nodes, edges };
};

// --- Prim's Algorithm (Step-by-step) ---
function* primGenerator(graphNodes, graphEdges, startNodeId = 0) {
  const numNodes = graphNodes.length;
  const mstNodes = new Set();
  const mstEdges = [];
  let totalWeight = 0;
  let edgesConsidered = 0;
  let activeNode = null;

  // Adjacency list for easy lookup
  const adj = new Map(graphNodes.map(node => [node.id, []]));
  graphEdges.forEach(edge => {
    adj.get(edge.from)?.push({ to: edge.to, weight: edge.weight, id: edge.id, originalEdge: edge });
    adj.get(edge.to)?.push({ to: edge.from, weight: edge.weight, id: edge.id, originalEdge: edge });
  });

  const pq = new MinPriorityQueue();

  // Start with node 0 (or a random one)
  mstNodes.add(startNodeId);
  activeNode = startNodeId;

  yield {
    type: 'initialize',
    mstNodes: [...mstNodes],
    mstEdges: [],
    pqElements: pq.getElements(),
    activeNode: activeNode,
    currentEdge: null,
    message: `Starting Prim's from node ${startNodeId}.`,
    stats: { edgesConsidered, totalWeight },
    line: 3
  };

  // Add all edges from the start node to the PQ
  for (const neighborEdge of adj.get(startNodeId) || []) {
    pq.enqueue({ from: startNodeId, to: neighborEdge.to, weight: neighborEdge.weight, id: neighborEdge.id, originalEdge: neighborEdge.originalEdge }, neighborEdge.weight);
  }

  yield {
    type: 'fringe-init',
    mstNodes: [...mstNodes],
    mstEdges: [],
    pqElements: pq.getElements(),
    activeNode: activeNode,
    currentEdge: null,
    message: `Added edges from node ${startNodeId} to priority queue.`,
    stats: { edgesConsidered, totalWeight },
    line: 5
  };


  while (!pq.isEmpty() && mstNodes.size < numNodes) {
    const minEdge = pq.dequeue(); // Smallest edge
    edgesConsidered++;

    if (mstNodes.has(minEdge.to)) { // If the 'to' node is already in MST, this edge forms a cycle
      yield {
        type: 'reject-edge',
        mstNodes: [...mstNodes],
        mstEdges: [...mstEdges],
        pqElements: pq.getElements(),
        activeNode: null, // No specific active node for rejected
        currentEdge: minEdge.originalEdge,
        message: `Edge (${minEdge.from}-${minEdge.to}) rejected: ${minEdge.to} is already in MST.`,
        stats: { edgesConsidered, totalWeight },
        line: 8
      };
      continue;
    }

    // Add the node and edge to MST
    mstNodes.add(minEdge.to);
    mstEdges.push(minEdge.originalEdge);
    totalWeight += minEdge.weight;
    activeNode = minEdge.to; // The new node added to MST becomes the active node for finding next edges

    yield {
      type: 'add-to-mst',
      mstNodes: [...mstNodes],
      mstEdges: [...mstEdges],
      pqElements: pq.getElements(),
      activeNode: activeNode,
      currentEdge: minEdge.originalEdge,
      message: `Added edge (${minEdge.from}-${minEdge.to}) with weight ${minEdge.weight} to MST.`,
      stats: { edgesConsidered, totalWeight },
      line: 9
    };

    // Add all edges from the newly added node's neighbors to the PQ
    for (const neighborEdge of adj.get(minEdge.to) || []) {
      if (!mstNodes.has(neighborEdge.to)) { // Only add if neighbor is not already in MST
        pq.enqueue({ from: minEdge.to, to: neighborEdge.to, weight: neighborEdge.weight, id: neighborEdge.id, originalEdge: neighborEdge.originalEdge }, neighborEdge.weight);
      }
    }

    yield {
      type: 'update-fringe',
      mstNodes: [...mstNodes],
      mstEdges: [...mstEdges],
      pqElements: pq.getElements(),
      activeNode: activeNode,
      currentEdge: minEdge.originalEdge,
      message: `Updated fringe with edges from node ${activeNode}.`,
      stats: { edgesConsidered, totalWeight },
      line: 11
    };
  }

  yield {
    type: 'finished',
    mstNodes: [...mstNodes],
    mstEdges: [...mstEdges],
    pqElements: pq.getElements(),
    activeNode: null,
    currentEdge: null,
    message: `Prim's finished. MST Total Weight: ${totalWeight}`,
    stats: { edgesConsidered, totalWeight },
    line: null
  };
}


// --- The Main Visualizer Component ---
const PrimVisualizer = () => {
  const initialGraph = generateRandomGraph(6);
  const [nodes, setNodes] = useState(initialGraph.nodes);
  const [edges, setEdges] = useState(initialGraph.edges);

  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(300);

  const [mstNodes, setMstNodes] = useState(new Set());
  const [mstEdges, setMstEdges] = useState([]);
  const [pqElements, setPqElements] = useState([]); // Edges currently in the priority queue
  const [activeNode, setActiveNode] = useState(null); // The node just added to MST
  const [currentEdge, setCurrentEdge] = useState(null); // The edge currently being evaluated (min from PQ)
  const [message, setMessage] = useState('Ready to find Minimum Spanning Tree!');
  const [stats, setStats] = useState({ edgesConsidered: 0, totalWeight: 0 });
  const [highlightedLine, setHighlightedLine] = useState(null);
  
  const timeoutRef = useRef(null);
  const generatorRef = useRef(null);

  // --- Reset Function ---
  const resetVisuals = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsSorting(false);
    setIsPaused(false);
    setMstNodes(new Set());
    setMstEdges([]);
    setPqElements([]);
    setActiveNode(null);
    setCurrentEdge(null);
    setStats({ edgesConsidered: 0, totalWeight: 0 });
    setMessage('Ready to find Minimum Spanning Tree!');
    setHighlightedLine(null);
    generatorRef.current = null;
  }, []);

  // --- Start Algorithm ---
  const handleStart = useCallback(() => {
    resetVisuals();
    const newGenerator = primGenerator(nodes, edges, 0); // Always start from node 0 for consistency
    generatorRef.current = newGenerator;
    setIsSorting(true);
    setIsPaused(false);
  }, [nodes, edges, resetVisuals]);

  // --- Process a single step from the generator ---
  const processGeneratorStep = useCallback(() => {
    if (!generatorRef.current) return;

    const { value, done } = generatorRef.current.next();

    if (done) {
      setIsSorting(false);
      setIsPaused(false);
      setMessage(value.message);
      setHighlightedLine(value.line);
      setStats(value.stats);
      setCurrentEdge(null);
      setActiveNode(null);
      setPqElements(value.pqElements); // Update one last time
      setMstNodes(new Set(value.mstNodes));
      setMstEdges(value.mstEdges);
      return;
    }

    setMstNodes(new Set(value.mstNodes));
    setMstEdges(value.mstEdges);
    setPqElements(value.pqElements);
    setActiveNode(value.activeNode);
    setCurrentEdge(value.currentEdge);
    setMessage(value.message);
    setStats(value.stats);
    setHighlightedLine(value.line);

    if (isSorting && !isPaused) {
      timeoutRef.current = setTimeout(processGeneratorStep, animationSpeed);
    }
  }, [isSorting, isPaused, animationSpeed]);

  useEffect(() => {
    if (isSorting && !isPaused && generatorRef.current) {
      processGeneratorStep();
    }
    return () => clearTimeout(timeoutRef.current);
  }, [isSorting, isPaused, processGeneratorStep]);

  // --- UI Handlers ---
  const handlePauseResume = () => setIsPaused(!isPaused);
  const handleReset = () => {
    resetVisuals();
    const newGraph = generateRandomGraph(nodes.length);
    setNodes(newGraph.nodes);
    setEdges(newGraph.edges);
  };
  const handleRandomizeGraph = () => {
    resetVisuals();
    const newGraph = generateRandomGraph(5 + Math.floor(Math.random() * 4), 0.4 + Math.random() * 0.4); // 5-8 nodes, 40-80% density
    setNodes(newGraph.nodes);
    setEdges(newGraph.edges);
  };

  // Helper to get node position (e.g., for SVG lines)
  const getNodePos = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  // Determine edge color
  const getEdgeColor = (edge) => {
    const isInMst = mstEdges.some(mstEdge => mstEdge.id === edge.id);
    const isActive = currentEdge && currentEdge.id === edge.id;
    
    if (isInMst) return EDGE_COLORS.inMST;
    if (isActive) {
      if (message.includes('rejected')) return EDGE_COLORS.rejected;
      return EDGE_COLORS.active;
    }
    // Edges that have been considered (in PQ but not yet picked) or picked as min and not added
    const isProcessed = pqElements.some(pqEdge => pqEdge.id === edge.id) ||
                        (isSorting && !mstEdges.some(e => e.id === edge.id) && !isActive && stats.edgesConsidered > 0);

    if (isProcessed) {
        // Check if edge has already been "passed over" as not the minimum
        const sortedPq = [...pqElements].sort((a,b) => a.weight - b.weight);
        const minEdgeId = sortedPq[0]?.id;

        if (currentEdge && currentEdge.id !== edge.id && pqElements.some(e => e.id === edge.id)) {
            return EDGE_COLORS.processed;
        }
        if (message.includes('rejected') && currentEdge?.id === edge.id) {
            return EDGE_COLORS.rejected;
        }
    }
    return EDGE_COLORS.default;
  };

  // Determine node color
  const getNodeColor = (nodeId) => {
    if (mstNodes.has(nodeId)) {
        if (activeNode === nodeId) return NODE_COLORS.active; // The node just added to MST
        return NODE_COLORS.inMST;
    }
    // Nodes that are connected to the MST but not yet in it (i.e., in the fringe)
    // A node is in fringe if it's the 'to' part of an edge in PQ, and not yet in MST
    const isInFringe = pqElements.some(pqEdge => pqEdge.to === nodeId && !mstNodes.has(nodeId));
    if (isInFringe) return NODE_COLORS.inFringe;
    
    return NODE_COLORS.default;
  };

  const codeString = `class MinPriorityQueue { /* ... DSU-like structure for edges ... */ }

function prim(nodes, edges, startNodeId = 0) {
  const numNodes = nodes.length;
  const mstNodes = new Set();
  const mstEdges = [];
  let totalWeight = 0;

  const adj = buildAdjacencyList(nodes, edges); // Helper for graph traversal
  const pq = new MinPriorityQueue(); // Priority queue to store fringe edges

  // 1. Start with an arbitrary node (e.g., node 0)
  mstNodes.add(startNodeId); // Line 3

  // 2. Add all edges from the start node to the PQ
  for (const neighborEdge of adj.get(startNodeId)) { // Line 5
    pq.enqueue(neighborEdge, neighborEdge.weight);
  }

  // 3. While PQ is not empty and MST is not complete
  while (!pq.isEmpty() && mstNodes.size < numNodes) {
    const minEdge = pq.dequeue(); // Get the smallest edge from the fringe

    // 4. Check if the 'to' node of this edge is already in MST
    if (mstNodes.has(minEdge.to)) { // Line 8
      continue; // Skip, this edge forms a cycle with existing MST
    }

    // 5. Add the edge and its 'to' node to the MST
    mstNodes.add(minEdge.to); // Line 9
    mstEdges.push(minEdge);
    totalWeight += minEdge.weight;

    // 6. Add all edges from the newly added node to the PQ
    for (const neighborEdge of adj.get(minEdge.to)) { // Line 11
      if (!mstNodes.has(neighborEdge.to)) { // Only add if neighbor is not in MST
        pq.enqueue(neighborEdge, neighborEdge.weight);
      }
    }
  }

  return { mstEdges, totalWeight };
}`;


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 tracking-tight">Prim's Algorithm Visualizer</h1>
          <p className="text-gray-500">Grows a Minimum Spanning Tree (MST) from an arbitrary starting node by iteratively adding the cheapest edge that connects a node in the MST to a node outside the MST.</p>
        </header>

        {/* --- Configuration & Controls --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-md border">
          <div>
            <div className="mb-1 flex justify-between items-center"><label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Zap size={16}/> Speed</label><span className="text-sm font-mono text-gray-500">{animationSpeed}ms</span></div>
            <input type="range" min="50" max="1000" step="50" value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))} disabled={isSorting} className="range range-primary range-sm" />
          </div>
          <div className="flex items-center justify-end">
            <button className="btn btn-ghost btn-lg text-blue-600" onClick={handleRandomizeGraph} disabled={isSorting}><GitGraph className="mr-2"/> Randomize Graph</button>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 mb-4">
            <button className="btn btn-primary btn-lg shadow-md" onClick={handleStart} disabled={isSorting}><Play className="mr-2"/> Start</button>
            <button className="btn btn-secondary btn-lg shadow-md" onClick={handlePauseResume} disabled={!isSorting}>{isPaused ? <Play className="mr-2"/> : <Pause className="mr-2"/>} {isPaused ? 'Resume' : 'Pause'}</button>
            <button className="btn btn-ghost btn-lg text-red-600" onClick={handleReset}><RotateCcw className="mr-2"/> Reset Visuals</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center h-auto md:h-14 items-center p-3 mb-6 bg-gray-100 rounded-md">
           <p className="font-medium text-gray-700 md:col-span-2 md:text-left">{message}</p>
           <div className="flex justify-center md:justify-end gap-6 font-mono text-sm"><span>Edges Considered: <strong className="text-green-600">{stats.edgesConsidered}</strong></span><span>MST Weight: <strong className="text-blue-600">{stats.totalWeight}</strong></span></div>
        </div>

        {/* --- Visualization Area --- */}
        <div className="w-full aspect-video bg-gray-50 rounded-lg border border-gray-200 relative overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 600 400">
            {/* Edges */}
            {edges.map((edge) => {
              const fromPos = getNodePos(edge.from);
              const toPos = getNodePos(edge.to);
              const color = getEdgeColor(edge);

              const midX = (fromPos.x + toPos.x) / 2;
              const midY = (fromPos.y + toPos.y) / 2;

              return (
                <g key={edge.id}>
                  <line
                    x1={fromPos.x} y1={fromPos.y}
                    x2={toPos.x} y2={toPos.y}
                    className={`${color} stroke-[2px] transition-all duration-300`}
                  />
                  <text
                    x={midX} y={midY - 5}
                    className={`text-[10px] fill-gray-800 font-bold ${color === EDGE_COLORS.inMST ? 'fill-blue-700' : ''}`}
                    textAnchor="middle"
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              let nodeColorClass = getNodeColor(node.id);

              return (
                <g key={node.id}>
                  <motion.circle
                    cx={node.x} cy={node.y} r={NODE_RADIUS}
                    className={`${nodeColorClass} stroke-white stroke-[2px] transition-all duration-300`}
                    initial={false}
                    animate={{ scale: (activeNode === node.id || (currentEdge && (currentEdge.from === node.id || currentEdge.to === node.id))) ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                  <text
                    x={node.x} y={node.y + 5}
                    className="fill-white text-[12px] font-bold pointer-events-none"
                    textAnchor="middle"
                  >
                    {node.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-4 border-t pt-4">
                <div className="flex items-center gap-2"><div className="w-4 h-2 bg-gray-400"></div><span>Default Edge</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-2 bg-gray-600"></div><span>Processed Edge (In PQ)</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-2 bg-green-600"></div><span>Active Edge (Min in PQ)</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-2 bg-red-600"></div><span>Rejected Edge (Forms Cycle)</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-2 bg-blue-600"></div><span>Edge in MST</span></div>
                <div className="flex items-center gap-2 mt-2"><div className="w-4 h-4 rounded-full bg-blue-600"></div><span>Node in MST</span></div>
                <div className="flex items-center gap-2 mt-2"><div className="w-4 h-4 rounded-full bg-purple-600"></div><span>Node in Fringe (Connected to MST)</span></div>
                <div className="flex items-center gap-2 mt-2"><div className="w-4 h-4 rounded-full bg-green-600"></div><span>Active Node (Just Added to MST)</span></div>
            </div>

        {/* --- Code Block --- */}
        <div className="my-8">
            <details className="bg-gray-800 rounded-lg overflow-hidden group">
                <summary className="p-4 text-white font-medium cursor-pointer flex items-center gap-2 group-hover:bg-gray-700 transition-colors"><Code size={18}/> View Algorithm Code</summary>
                <div className="relative">
                    <SyntaxHighlighter language="javascript" style={oneDark} showLineNumbers wrapLines={true}
                        lineProps={lineNumber => {
                            const style = { display: 'block', width: '100%', transition: 'background-color 0.3s ease' };
                            if (lineNumber === highlightedLine) { style.backgroundColor = 'rgba(16, 185, 129, 0.3)'; style.boxShadow = 'inset 3px 0 0 0 #10b981'; } // Green for Prim's
                            return { style };
                        }}>
                        {codeString}
                    </SyntaxHighlighter>
                </div>
            </details>
        </div>
      </div>
    </div>
  );
};

export default PrimVisualizer;