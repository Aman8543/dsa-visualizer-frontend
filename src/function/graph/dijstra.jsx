import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Target, Code, Plus, Minus, GitGraph, X, CircleDot, CircleDashed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const NODE_RADIUS = 20;
const NODE_COLORS = {
  default: 'bg-gray-400',
  start: 'bg-green-600',
  end: 'bg-red-600',
  visited: 'bg-blue-500',
  current: 'bg-purple-600',
  path: 'bg-yellow-500',
  unvisited: 'bg-gray-400'
};

const EDGE_COLORS = {
  default: 'stroke-gray-400',
  active: 'stroke-purple-600',
  path: 'stroke-yellow-500',
};

// --- Helper to generate a random graph (for initial setup) ---
const generateRandomGraph = (numNodes = 8, density = 0.4) => {
  const nodes = Array.from({ length: numNodes }, (_, i) => ({ id: i, x: 0, y: 0 }));
  const edges = [];
  const minDistance = 1;
  const maxDistance = 10;

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
        const weight = Math.floor(Math.random() * (maxDistance - minDistance + 1)) + minDistance;
        edges.push({ from: i, to: j, weight });
        edges.push({ from: j, to: i, weight }); // Undirected graph for simplicity
      }
    }
  }

  // Ensure all nodes are connected (at least one edge)
  nodes.forEach(node => {
    if (!edges.some(edge => edge.from === node.id || edge.to === node.id)) {
      let otherNodeId = Math.floor(Math.random() * numNodes);
      while (otherNodeId === node.id) {
        otherNodeId = Math.floor(Math.random() * numNodes);
      }
      const weight = Math.floor(Math.random() * (maxDistance - minDistance + 1)) + minDistance;
      edges.push({ from: node.id, to: otherNodeId, weight });
      edges.push({ from: otherNodeId, to: node.id, weight });
    }
  });

  return { nodes, edges };
};

// --- Dijkstra's Algorithm (Step-by-step) ---
function* dijkstraGenerator(graphNodes, graphEdges, startNodeId, endNodeId) {
  const numNodes = graphNodes.length;
  const distances = new Array(numNodes).fill(Infinity);
  const previous = new Array(numNodes).fill(null);
  const visited = new Array(numNodes).fill(false);
  const adjacencyList = new Map();

  graphEdges.forEach(edge => {
    if (!adjacencyList.has(edge.from)) adjacencyList.set(edge.from, []);
    adjacencyList.get(edge.from).push({ to: edge.to, weight: edge.weight });
  });

  distances[startNodeId] = 0;
  let currentComparisons = 0;
  let currentUpdates = 0;

  // Priority Queue (simplified with just an array, could be optimized with a min-heap)
  let unvisited = [...graphNodes.map(node => node.id)];

  while (unvisited.length > 0) {
    // Find node with smallest distance among unvisited
    let currentId = -1;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentId = nodeId;
      }
    }

    if (currentId === -1 || minDistance === Infinity) break; // No path to remaining unvisited nodes

    yield {
      type: 'visit-node',
      distances: [...distances],
      previous: [...previous],
      visited: [...visited],
      currentNode: currentId,
      activeEdge: null,
      message: `Visiting node ${currentId} with current shortest distance ${distances[currentId]}.`,
      stats: { comparisons: currentComparisons, updates: currentUpdates },
      line: 6
    };

    visited[currentId] = true;
    unvisited = unvisited.filter(id => id !== currentId);

    if (currentId === endNodeId) break; // Reached the destination

    const neighbors = adjacencyList.get(currentId) || [];
    for (const neighbor of neighbors) {
      const { to: neighborId, weight } = neighbor;
      if (visited[neighborId]) continue; // Skip visited nodes

      currentComparisons++;
      yield {
        type: 'explore-neighbor',
        distances: [...distances],
        previous: [...previous],
        visited: [...visited],
        currentNode: currentId,
        activeEdge: { from: currentId, to: neighborId },
        message: `Exploring edge from ${currentId} to ${neighborId} (weight ${weight}).`,
        stats: { comparisons: currentComparisons, updates: currentUpdates },
        line: 9
      };

      const newDistance = distances[currentId] + weight;
      if (newDistance < distances[neighborId]) {
        currentUpdates++;
        distances[neighborId] = newDistance;
        previous[neighborId] = currentId;

        yield {
          type: 'update-distance',
          distances: [...distances],
          previous: [...previous],
          visited: [...visited],
          currentNode: currentId,
          activeEdge: { from: currentId, to: neighborId },
          message: `Updated distance to node ${neighborId} to ${newDistance}. Previous node: ${currentId}.`,
          stats: { comparisons: currentComparisons, updates: currentUpdates },
          line: 11
        };
      }
    }
  }

  const path = [];
  let currentPathNode = endNodeId;
  while (currentPathNode !== null && currentPathNode !== undefined) {
    path.unshift(currentPathNode);
    currentPathNode = previous[currentPathNode];
  }

  yield {
    type: 'finished',
    distances: [...distances],
    previous: [...previous],
    visited: [...visited],
    currentNode: null,
    activeEdge: null,
    path: distances[endNodeId] !== Infinity ? path : [],
    message: distances[endNodeId] !== Infinity ? `Shortest path found! Total distance: ${distances[endNodeId]}` : "No path found to destination.",
    stats: { comparisons: currentComparisons, updates: currentUpdates },
    line: null
  };
}

// --- The Main Visualizer Component ---
const DijkstraVisualizer = () => {
  const initialGraph = generateRandomGraph(6);
  const [nodes, setNodes] = useState(initialGraph.nodes);
  const [edges, setEdges] = useState(initialGraph.edges);

  const [startNode, setStartNode] = useState(0);
  const [endNode, setEndNode] = useState(nodes.length - 1);

  const [isSorting, setIsSorting] = useState(false); // Using 'sorting' as a general term for algorithm running
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(300);

  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [distances, setDistances] = useState([]);
  const [previousNodes, setPreviousNodes] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [activeEdge, setActiveEdge] = useState(null); // { from, to }
  const [shortestPath, setShortestPath] = useState([]);

  const [message, setMessage] = useState('Ready to find the shortest path!');
  const [stats, setStats] = useState({ comparisons: 0, updates: 0 });
  const [highlightedLine, setHighlightedLine] = useState(null);

  const timeoutRef = useRef(null);
  const generatorRef = useRef(null); // To store the generator instance

  // --- Reset Function ---
  const resetVisuals = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsSorting(false);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setSteps([]);
    setDistances([]);
    setPreviousNodes([]);
    setVisitedNodes([]);
    setCurrentNode(null);
    setActiveEdge(null);
    setShortestPath([]);
    setStats({ comparisons: 0, updates: 0 });
    setMessage('Ready to find the shortest path!');
    setHighlightedLine(null);
    generatorRef.current = null;
  }, []);

  // --- Start Algorithm ---
  const handleStart = useCallback(() => {
    if (startNode === null || endNode === null || startNode >= nodes.length || endNode >= nodes.length) {
      setMessage("Please select valid start and end nodes.");
      return;
    }
    resetVisuals();
    const newGenerator = dijkstraGenerator(nodes, edges, startNode, endNode);
    generatorRef.current = newGenerator;
    setIsSorting(true);
    setIsPaused(false);
  }, [nodes, edges, startNode, endNode, resetVisuals]);

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
      setShortestPath(value.path || []);
      return;
    }

    setDistances(value.distances);
    setPreviousNodes(value.previous);
    setVisitedNodes(value.visited);
    setCurrentNode(value.currentNode);
    setActiveEdge(value.activeEdge);
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
  }, [isSorting, isPaused, processGeneratorStep]); // Rerun effect when these change

  // --- UI Handlers ---
  const handlePauseResume = () => setIsPaused(!isPaused);
  const handleReset = () => {
    resetVisuals();
    const newGraph = generateRandomGraph(nodes.length);
    setNodes(newGraph.nodes);
    setEdges(newGraph.edges);
    setStartNode(0);
    setEndNode(newGraph.nodes.length - 1);
  };
  const handleRandomizeGraph = () => {
    resetVisuals();
    const newGraph = generateRandomGraph(6 + Math.floor(Math.random() * 5)); // 6-10 nodes
    setNodes(newGraph.nodes);
    setEdges(newGraph.edges);
    setStartNode(0);
    setEndNode(newGraph.nodes.length - 1);
  };

  const codeString = `function dijkstra(graph, startNode) {
  const distances = {};
  const previous = {};
  const visited = new Set();
  const priorityQueue = []; // In a real scenario, use a Min-Heap

  // Initialize distances and priority queue
  for (const node of graph.nodes) {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  }
  distances[startNode] = 0;
  priorityQueue.push({ node: startNode, distance: 0 });

  while (priorityQueue.length > 0) {
    // Sort to simulate min-heap (take smallest distance)
    priorityQueue.sort((a, b) => a.distance - b.distance);
    const { node: currentNode, distance: currentDistance } = priorityQueue.shift();

    if (visited.has(currentNode)) continue;
    visited.add(currentNode);

    // If we've already found a shorter path, skip
    if (currentDistance > distances[currentNode]) continue;

    // Explore neighbors
    for (const edge of graph.edges.filter(e => e.from === currentNode)) {
      const neighbor = edge.to;
      const weight = edge.weight;
      const newDistance = distances[currentNode] + weight;

      // If a shorter path to neighbor is found
      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previous[neighbor] = currentNode;
        priorityQueue.push({ node: neighbor, distance: newDistance });
      }
    }
  }

  return { distances, previous };
}`;

  // Helper to get node position (e.g., for SVG lines)
  const getNodePos = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  // Determine edge color
  const getEdgeColor = (from, to) => {
    const isPath = shortestPath.includes(from) && shortestPath.includes(to) && shortestPath[shortestPath.indexOf(from) + 1] === to;
    const isActive = activeEdge && ((activeEdge.from === from && activeEdge.to === to) || (activeEdge.from === to && activeEdge.to === from));
    if (isPath) return EDGE_COLORS.path;
    if (isActive) return EDGE_COLORS.active;
    return EDGE_COLORS.default;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 tracking-tight">Dijkstra's Algorithm Visualizer</h1>
          <p className="text-gray-500">Finds the shortest path between two nodes in a weighted graph with non-negative edge weights.</p>
        </header>

        {/* --- Configuration & Controls --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-gray-50 rounded-md border">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><CircleDot size={16}/> Start Node</label>
            <select value={startNode} onChange={(e) => { resetVisuals(); setStartNode(Number(e.target.value)); }} disabled={isSorting} className="select select-bordered w-full">
              {nodes.map(node => (<option key={`start-${node.id}`} value={node.id}>Node {node.id}</option>))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><CircleDashed size={16}/> End Node</label>
            <select value={endNode} onChange={(e) => { resetVisuals(); setEndNode(Number(e.target.value)); }} disabled={isSorting} className="select select-bordered w-full">
              {nodes.map(node => (<option key={`end-${node.id}`} value={node.id}>Node {node.id}</option>))}
            </select>
          </div>
          <div>
            <div className="mb-1 flex justify-between items-center"><label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Zap size={16}/> Speed</label><span className="text-sm font-mono text-gray-500">{animationSpeed}ms</span></div>
            <input type="range" min="50" max="1000" step="50" value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))} disabled={isSorting} className="range range-primary range-sm" />
          </div>
        </div>

        <div className="flex justify-center items-center gap-4 mb-4">
            <button className="btn btn-primary btn-lg shadow-md" onClick={handleStart} disabled={isSorting || startNode === endNode}><Play className="mr-2"/> Start</button>
            <button className="btn btn-secondary btn-lg shadow-md" onClick={handlePauseResume} disabled={!isSorting}>{isPaused ? <Play className="mr-2"/> : <Pause className="mr-2"/>} {isPaused ? 'Resume' : 'Pause'}</button>
            <button className="btn btn-ghost btn-lg text-red-600" onClick={handleReset}><RotateCcw className="mr-2"/> Reset Graph</button>
            <button className="btn btn-ghost btn-lg text-blue-600" onClick={handleRandomizeGraph} disabled={isSorting}><GitGraph className="mr-2"/> Randomize</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center h-auto md:h-14 items-center p-3 mb-6 bg-gray-100 rounded-md">
           <p className="font-medium text-gray-700 md:col-span-2 md:text-left">{message}</p>
           <div className="flex justify-center md:justify-end gap-6 font-mono text-sm"><span>Comparisons: <strong className="text-blue-600">{stats.comparisons}</strong></span><span>Updates: <strong className="text-red-600">{stats.updates}</strong></span></div>
        </div>

        {/* --- Visualization Area --- */}
        <div className="w-full aspect-video bg-gray-50 rounded-lg border border-gray-200 relative overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 600 400">
            {/* Edges */}
            {edges.map((edge, i) => {
              const fromPos = getNodePos(edge.from);
              const toPos = getNodePos(edge.to);
              const color = getEdgeColor(edge.from, edge.to);

              // Calculate midpoint for weight text
              const midX = (fromPos.x + toPos.x) / 2;
              const midY = (fromPos.y + toPos.y) / 2;

              return (
                <g key={i}>
                  <line
                    x1={fromPos.x} y1={fromPos.y}
                    x2={toPos.x} y2={toPos.y}
                    className={`${color} stroke-[2px] transition-all duration-300`}
                  />
                  <text
                    x={midX} y={midY - 5} // Offset text slightly
                    className={`text-[10px] fill-gray-800 font-bold ${color === EDGE_COLORS.path ? 'fill-yellow-600' : ''}`}
                    textAnchor="middle"
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              let nodeColorClass = NODE_COLORS.unvisited;
              if (node.id === startNode) nodeColorClass = NODE_COLORS.start;
              else if (node.id === endNode) nodeColorClass = NODE_COLORS.end;
              else if (shortestPath.includes(node.id)) nodeColorClass = NODE_COLORS.path;
              else if (node.id === currentNode) nodeColorClass = NODE_COLORS.current;
              else if (visitedNodes[node.id]) nodeColorClass = NODE_COLORS.visited;

              return (
                <g key={node.id}>
                  <motion.circle
                    cx={node.x} cy={node.y} r={NODE_RADIUS}
                    className={`${nodeColorClass} stroke-white stroke-[2px] transition-all duration-300`}
                    initial={false}
                    animate={{ scale: (node.id === currentNode || node.id === startNode || node.id === endNode) ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                  <text
                    x={node.x} y={node.y + 5}
                    className="fill-white text-[12px] font-bold pointer-events-none"
                    textAnchor="middle"
                  >
                    {node.id}
                  </text>
                  {distances[node.id] !== Infinity && distances[node.id] !== undefined && (
                    <text
                      x={node.x} y={node.y + NODE_RADIUS + 15}
                      className={`text-[10px] font-bold ${nodeColorClass === NODE_COLORS.path ? 'fill-yellow-600' : 'fill-gray-800'}`}
                      textAnchor="middle"
                    >
                      D: {distances[node.id]}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-4 border-t pt-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-600"></div><span>Start Node</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-600"></div><span>End Node</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-600"></div><span>Current Node</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500"></div><span>Visited Node</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gray-400"></div><span>Unvisited Node</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-500"></div><span>Shortest Path</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-2 bg-purple-600"></div><span>Active Edge</span></div>
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

export default DijkstraVisualizer;
