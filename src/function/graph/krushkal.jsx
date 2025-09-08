import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, GitGraph, Code, Link, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const NODE_RADIUS = 20;
const NODE_COLORS = {
  default: 'bg-gray-400',
  inMST: 'bg-blue-600',
  activeComponent: 'bg-purple-600', // For nodes in components of active edge
};

const EDGE_COLORS = {
  default: 'stroke-gray-400',
  processed: 'stroke-gray-600', // Edges already considered but not added
  active: 'stroke-purple-600', // Current edge being evaluated
  inMST: 'stroke-blue-600', // Edges added to MST
  rejected: 'stroke-red-600', // Edge that would form a cycle
};

// --- Disjoint Set Union (DSU) Data Structure ---
class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.numComponents = n;
  }

  find(i) {
    if (this.parent[i] === i) {
      return i;
    }
    this.parent[i] = this.find(this.parent[i]);
    return this.parent[i];
  }

  union(i, j) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) {
      this.parent[rootJ] = rootI;
      this.numComponents--;
      return true;
    }
    return false;
  }

  // Helper for visualization: get all nodes belonging to a component
  getComponentNodes(root) {
    const nodes = [];
    for (let i = 0; i < this.parent.length; i++) {
      if (this.find(i) === root) {
        nodes.push(i);
      }
    }
    return nodes;
  }
}

// --- Helper to generate a random graph ---
const generateRandomGraph = (numNodes = 6, density = 0.5) => {
  const nodes = Array.from({ length: numNodes }, (_, i) => ({ id: i, x: 0, y: 0 }));
  const edges = [];
  const minWeight = 1;
  const maxWeight = 15;

  // Position nodes in a circle for better visualization
  const centerX = 300; // Relative to a viewbox or container
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

  // Ensure graph is connected enough for MST (optional, can result in disconnected graph if density is too low)
  if (edges.length === 0 && numNodes > 1) { // Add at least one edge if empty
    edges.push({ from: 0, to: 1, weight: Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight, id: `0-1` });
  }

  return { nodes, edges };
};

// --- Kruskal's Algorithm (Step-by-step) ---
function* kruskalGenerator(graphNodes, graphEdges) {
  const numNodes = graphNodes.length;
  const dsu = new DSU(numNodes);
  const mstEdges = [];
  let totalWeight = 0;
  let edgesConsidered = 0;
  let unionOperations = 0;

  // Sort all edges by weight
  const sortedEdges = [...graphEdges].sort((a, b) => a.weight - b.weight);

  yield {
    type: 'initialize',
    dsuParent: [...dsu.parent],
    mstEdges: [],
    currentEdge: null,
    activeComponentRoots: [],
    message: 'Graph initialized. Sorting edges by weight.',
    stats: { edgesConsidered, totalWeight, unionOperations },
    line: 3
  };

  for (const edge of sortedEdges) {
    edgesConsidered++;
    const rootFrom = dsu.find(edge.from);
    const rootTo = dsu.find(edge.to);

    yield {
      type: 'consider-edge',
      dsuParent: [...dsu.parent],
      mstEdges: [...mstEdges],
      currentEdge: edge,
      activeComponentRoots: [rootFrom, rootTo],
      message: `Considering edge (${edge.from}-${edge.to}) with weight ${edge.weight}.`,
      stats: { edgesConsidered, totalWeight, unionOperations },
      line: 6
    };

    if (rootFrom !== rootTo) {
      // Add edge to MST
      dsu.union(edge.from, edge.to);
      unionOperations++;
      mstEdges.push(edge);
      totalWeight += edge.weight;

      yield {
        type: 'add-to-mst',
        dsuParent: [...dsu.parent],
        mstEdges: [...mstEdges],
        currentEdge: edge,
        activeComponentRoots: [rootFrom, rootTo], // Show merge
        message: `Edge (${edge.from}-${edge.to}) added to MST. Merging components.`,
        stats: { edgesConsidered, totalWeight, unionOperations },
        line: 8
      };
    } else {
      // Edge forms a cycle
      yield {
        type: 'reject-edge',
        dsuParent: [...dsu.parent],
        mstEdges: [...mstEdges],
        currentEdge: edge,
        activeComponentRoots: [rootFrom, rootTo], // Show they are in same component
        message: `Edge (${edge.from}-${edge.to}) rejected: forms a cycle.`,
        stats: { edgesConsidered, totalWeight, unionOperations },
        line: 10
      };
    }

    if (mstEdges.length === numNodes - 1) {
      break; // MST is complete
    }
  }

  yield {
    type: 'finished',
    dsuParent: [...dsu.parent],
    mstEdges: [...mstEdges],
    currentEdge: null,
    activeComponentRoots: [],
    message: `Kruskal's finished. MST Total Weight: ${totalWeight}`,
    stats: { edgesConsidered, totalWeight, unionOperations },
    line: null
  };
}


// --- The Main Visualizer Component ---
const KruskalVisualizer = () => {
  const initialGraph = generateRandomGraph(6);
  const [nodes, setNodes] = useState(initialGraph.nodes);
  const [edges, setEdges] = useState(initialGraph.edges);

  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(300);

  const [dsuParent, setDsuParent] = useState([]);
  const [mstEdges, setMstEdges] = useState([]);
  const [currentEdge, setCurrentEdge] = useState(null); // The edge currently being processed
  const [activeComponentRoots, setActiveComponentRoots] = useState([]); // Roots of components involved in current edge
  const [message, setMessage] = useState('Ready to find Minimum Spanning Tree!');
  const [stats, setStats] = useState({ edgesConsidered: 0, totalWeight: 0, unionOperations: 0 });
  const [highlightedLine, setHighlightedLine] = useState(null);
  
  const timeoutRef = useRef(null);
  const generatorRef = useRef(null); // To store the generator instance

  // --- Reset Function ---
  const resetVisuals = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsSorting(false);
    setIsPaused(false);
    setDsuParent([]);
    setMstEdges([]);
    setCurrentEdge(null);
    setActiveComponentRoots([]);
    setStats({ edgesConsidered: 0, totalWeight: 0, unionOperations: 0 });
    setMessage('Ready to find Minimum Spanning Tree!');
    setHighlightedLine(null);
    generatorRef.current = null;
  }, []);

  // --- Start Algorithm ---
  const handleStart = useCallback(() => {
    resetVisuals();
    const newGenerator = kruskalGenerator(nodes, edges);
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
      setCurrentEdge(null); // Clear active edge
      setActiveComponentRoots([]);
      return;
    }

    setDsuParent(value.dsuParent);
    setMstEdges(value.mstEdges);
    setCurrentEdge(value.currentEdge);
    setActiveComponentRoots(value.activeComponentRoots);
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
    if (stats.edgesConsidered > 0 && !isInMst) { // If algorithm has started, and not in MST
        // Check if this edge was considered before the current active edge
        const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
        const currentIndex = sortedEdges.findIndex(e => e.id === currentEdge?.id);
        const edgeIndex = sortedEdges.findIndex(e => e.id === edge.id);
        if(edgeIndex < currentIndex) return EDGE_COLORS.processed;
    }
    return EDGE_COLORS.default;
  };

  // Determine node color
  const getNodeColor = (nodeId) => {
    if (mstEdges.some(edge => edge.from === nodeId || edge.to === nodeId)) {
        // If node has an edge in MST, it's part of the MST.
        // We only color it 'inMST' if its connected to at least one edge in the MST
    }
    
    const rootOfNode = dsuParent[nodeId] !== undefined ? new DSU(dsuParent.length).find(nodeId) : null;
    if (activeComponentRoots.includes(rootOfNode) && currentEdge && (currentEdge.from === nodeId || currentEdge.to === nodeId)) {
        return NODE_COLORS.activeComponent;
    }
    if (mstEdges.some(edge => edge.from === nodeId || edge.to === nodeId)) {
        return NODE_COLORS.inMST; // A node is part of MST if it's connected by an MST edge
    }
    return NODE_COLORS.default;
  };

  const codeString = `class DSU { // Disjoint Set Union
  constructor(n) { this.parent = Array.from({ length: n }, (_, i) => i); }
  find(i) {
    if (this.parent[i] === i) return i;
    return this.parent[i] = this.find(this.parent[i]);
  }
  union(i, j) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) {
      this.parent[rootJ] = rootI;
      return true; // Union happened
    }
    return false; // Already in same component
  }
}

function kruskal(nodes, edges) {
  const numNodes = nodes.length;
  const dsu = new DSU(numNodes);
  const mstEdges = [];
  let totalWeight = 0;

  // 1. Sort all edges by weight
  edges.sort((a, b) => a.weight - b.weight); // Line 3

  for (const edge of edges) { // Line 6
    const { from, to, weight } = edge;
    // 2. Check if adding the edge forms a cycle
    if (dsu.find(from) !== dsu.find(to)) { // Line 8
      // 3. If not, add it to MST and union components
      dsu.union(from, to);
      mstEdges.push(edge);
      totalWeight += weight;
      if (mstEdges.length === numNodes - 1) break; // Optimization: MST complete
    } // Line 10 (else, reject edge)
  }

  return { mstEdges, totalWeight };
}`;


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 tracking-tight">Kruskal's Algorithm Visualizer</h1>
          <p className="text-gray-500">Builds a Minimum Spanning Tree (MST) by adding edges in increasing order of weight, avoiding cycles.</p>
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
           <div className="flex justify-center md:justify-end gap-6 font-mono text-sm"><span>Edges Considered: <strong className="text-blue-600">{stats.edgesConsidered}</strong></span><span>MST Weight: <strong className="text-green-600">{stats.totalWeight}</strong></span></div>
        </div>

        {/* --- Visualization Area --- */}
        <div className="w-full aspect-video bg-gray-50 rounded-lg border border-gray-200 relative overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 600 400">
            {/* Edges */}
            {edges.map((edge) => {
              const fromPos = getNodePos(edge.from);
              const toPos = getNodePos(edge.to);
              const color = getEdgeColor(edge);

              // Calculate midpoint for weight text
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
                    x={midX} y={midY - 5} // Offset text slightly
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
                    animate={{ scale: (currentEdge && (currentEdge.from === node.id || currentEdge.to === node.id)) ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                  <text
                    x={node.x} y={node.y + 5}
                    className="fill-white text-[12px] font-bold pointer-events-none"
                    textAnchor="middle"
                  >
                    {node.id}
                  </text>
                  {dsuParent[node.id] !== undefined && ( // Show component parent/root
                     <text
                       x={node.x} y={node.y + NODE_RADIUS + 15}
                       className={`text-[10px] font-bold fill-gray-800`}
                       textAnchor="middle"
                     >
                       Root: {new DSU(dsuParent.length).find(node.id)}
                     </text>
                   )}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-4 border-t pt-4">
                <div className="flex items-center gap-2"><div className="w-4 h-2 bg-gray-400"></div><span>Default Edge</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-2 bg-gray-600"></div><span>Processed Edge</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-2 bg-purple-600"></div><span>Active Edge</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-2 bg-red-600"></div><span>Rejected Edge (Cycle)</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-2 bg-blue-600"></div><span>Edge in MST</span></div>
                <div className="flex items-center gap-2 mt-2"><div className="w-4 h-4 rounded-full bg-blue-600"></div><span>Node in MST</span></div>
                <div className="flex items-center gap-2 mt-2"><div className="w-4 h-4 rounded-full bg-purple-600"></div><span>Nodes of Active Edge</span></div>
            </div>

        {/* --- Code Block --- */}
        <div className="my-8">
            <details className="bg-gray-800 rounded-lg overflow-hidden group">
                <summary className="p-4 text-white font-medium cursor-pointer flex items-center gap-2 group-hover:bg-gray-700 transition-colors"><Code size={18}/> View Algorithm Code</summary>
                <div className="relative">
                    <SyntaxHighlighter language="javascript" style={oneDark} showLineNumbers wrapLines={true}
                        lineProps={lineNumber => {
                            const style = { display: 'block', width: '100%', transition: 'background-color 0.3s ease' };
                            if (lineNumber === highlightedLine) { style.backgroundColor = 'rgba(59, 130, 246, 0.3)'; style.boxShadow = 'inset 3px 0 0 0 #3b82f6'; }
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

export default KruskalVisualizer;