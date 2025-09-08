import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Target, Route, Code, Shuffle, Pointer, PlusCircle, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- Config ---
const DEFAULT_MAX_NODES_LIMIT = 24; // you can raise this safely to ~60
const NODE_RADIUS = 15;
const PADDING = NODE_RADIUS * 2;

const NODE_STATE = {
  IDLE: 'IDLE',
  START: 'START',
  END: 'END',
  VISITED: 'VISITED',
  CURRENT: 'CURRENT',
  PATH: 'PATH',
};

// --- Utility: build an easy grid-like sparse graph ---
const generateEasyGraph = (width, height, count) => {
  const nodes = [];
  const edges = [];

  // Choose rows/cols close to a square grid
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  const safeW = Math.max(width, 320);
  const safeH = Math.max(height, 320);

  const nodeSpacingX = cols > 1 ? (safeW - PADDING * 2) / (cols - 1) : 0;
  const nodeSpacingY = rows > 1 ? (safeH - PADDING * 2) / (rows - 1) : 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = r * cols + c;
      if (id >= count) break;
      const x = PADDING + c * nodeSpacingX;
      const y = PADDING + r * nodeSpacingY;
      nodes.push({ id, x, y, label: id });

      // grid connections (left and top) – undirected
      if (c > 0 && id - 1 >= 0) edges.push({ source: id, target: id - 1 });
      if (r > 0 && id - cols >= 0) edges.push({ source: id, target: id - cols });
    }
  }

  // add a few extra cross connections but keep degree small
  const degree = new Array(count).fill(0);
  for (const e of edges) {
    degree[e.source]++;
    degree[e.target]++;
  }
  const key = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;
  const existing = new Set(edges.map(e => key(e.source, e.target)));

  const extra = Math.min(Math.max(2, Math.floor(count / 4)), 10);
  let tries = 0;
  while (edges.length < count + extra && tries < 1000) {
    const a = Math.floor(Math.random() * count);
    const b = Math.floor(Math.random() * count);
    if (a === b) { tries++; continue; }
    const k = key(a, b);
    if (existing.has(k)) { tries++; continue; }
    if (degree[a] >= 4 || degree[b] >= 4) { tries++; continue; }
    edges.push({ source: a, target: b });
    existing.add(k);
    degree[a]++;
    degree[b]++;
  }

  return { nodes, edges };
};

export default function BFSGraphVisualizer() {
  // canvas
  const svgContainerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 480 });

  // graph controls
  const [maxNodesLimit, setMaxNodesLimit] = useState(DEFAULT_MAX_NODES_LIMIT);
  const [nodeCount, setNodeCount] = useState(12);
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [isCustomInputMode, setIsCustomInputMode] = useState(false);

  // selection
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);

  // animation
  const [animationSpeed, setAnimationSpeed] = useState(150);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const timeoutRef = useRef(null);

  // paint
  const [nodeStates, setNodeStates] = useState({});
  const [edgeStates, setEdgeStates] = useState({});
  const [stats, setStats] = useState({ visited: 0, pathLength: 0 });
  const [message, setMessage] = useState('Select a start node.');
  const [highlightedLine, setHighlightedLine] = useState(null);

  // custom IO
  const [customNodesInput, setCustomNodesInput] = useState('');
  const [customEdgesInput, setCustomEdgesInput] = useState('');

  // --- resize observer ---
  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width } = entries[0].contentRect;
      setDimensions(d => ({ ...d, width }));
    });
    if (svgContainerRef.current) ro.observe(svgContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // initial graph
  useEffect(() => {
    if (dimensions.width > 0 && !isCustomInputMode) {
      const safeCount = Math.min(Math.max(2, nodeCount), maxNodesLimit);
      const g = generateEasyGraph(dimensions.width, dimensions.height, safeCount);
      setGraph(g);
      setMessage('Default graph loaded. Select start and end nodes.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions.width, nodeCount, maxNodesLimit]);

  // helper
  const edgeKey = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;

  // --- BFS step builder (returns an array, does not mutate state directly) ---
  const buildBfsSteps = useCallback(() => {
    if (startNode == null || endNode == null) return [];

    const adj = new Map(graph.nodes.map(n => [n.id, []]));
    for (const e of graph.edges) {
      adj.get(e.source).push(e.target);
      adj.get(e.target).push(e.source);
    }
    // stable neighbor order (by id)
    for (const [k, arr] of adj) arr.sort((a, b) => a - b);

    const animation = [];
    const queue = [startNode];
    const visited = new Set([startNode]);
    const parent = new Map();
    let visitedCount = 0;

    animation.push({ type: 'enqueue', nodeId: startNode, line: 4, message: `Starting BFS. Enqueued ${startNode}.` });

    let found = false;
    while (queue.length) {
      const cur = queue.shift();
      visitedCount++;
      animation.push({ type: 'dequeue', nodeId: cur, line: 7, stats: { visited: visitedCount, pathLength: 0 }, message: `Dequeued ${cur}, exploring neighbors...` });
      if (cur === endNode) { found = true; break; }
      for (const nb of adj.get(cur) || []) {
        if (!visited.has(nb)) {
          visited.add(nb);
          parent.set(nb, cur);
          queue.push(nb);
          animation.push({ type: 'enqueue', nodeId: nb, line: 11, message: `Visited ${nb}, enqueued.` });
        }
      }
    }

    if (found) {
      animation.push({ type: 'path-start', line: 14, message: 'Path found! Reconstructing...' });
      const path = [];
      let cur = endNode;
      while (cur != null) {
        path.unshift(cur);
        const p = parent.get(cur);
        if (p != null) animation.push({ type: 'path-edge', source: p, target: cur, line: 16 });
        cur = p ?? null;
      }
      for (const n of path) animation.push({ type: 'path-node', nodeId: n, line: 16 });
      animation.push({ type: 'path-end', message: `Shortest path length: ${Math.max(0, path.length - 1)} edges.`, stats: { visited: visitedCount, pathLength: Math.max(0, path.length - 1) } });
    } else {
      animation.push({ type: 'no-path', message: 'No path could be found to the end node.' });
    }

    return animation;
  }, [graph, startNode, endNode]);

  // --- Controls ---
  const resetVisuals = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsVisualizing(false);
    setIsPaused(false);
    setCurrentStep(0);
    setSteps([]);
    setStats({ visited: 0, pathLength: 0 });
    setHighlightedLine(null);
    setEdgeStates({});
    setNodeStates(prev => {
      const ns = {};
      if (startNode != null) ns[startNode] = NODE_STATE.START;
      if (endNode != null) ns[endNode] = NODE_STATE.END;
      return ns;
    });
  }, [startNode, endNode]);

  const resetAll = useCallback(() => {
    resetVisuals();
    setStartNode(null);
    setEndNode(null);
    setMessage('Select a start node.');
  }, [resetVisuals]);

  const handleStart = () => {
    if (startNode == null || endNode == null) {
      setMessage('Please select both a start and an end node before starting.');
      return;
    }
    resetVisuals();
    const s = buildBfsSteps();
    setSteps(s);
    setIsVisualizing(true);
    setIsPaused(false);
    setMessage('Starting visualization...');
  };

  const handleNodeClick = (nodeId) => {
    if (isVisualizing) return;
    // decide next selection deterministically
    let newStart = startNode;
    let newEnd = endNode;

    if (newStart == null) {
      newStart = nodeId;
      newEnd = null;
      setMessage('Select an end node.');
    } else if (newEnd == null && nodeId !== newStart) {
      newEnd = nodeId;
      setMessage('Ready to visualize! Press Start.');
    } else {
      // restart selection from clicked node
      newStart = nodeId;
      newEnd = null;
      setMessage('Select an end node.');
    }

    setStartNode(newStart);
    setEndNode(newEnd);
    setNodeStates(() => {
      const ns = {};
      if (newStart != null) ns[newStart] = NODE_STATE.START;
      if (newEnd != null) ns[newEnd] = NODE_STATE.END;
      return ns;
    });
    setEdgeStates({});
    setStats({ visited: 0, pathLength: 0 });
    setHighlightedLine(null);
  };

  const handleGenerateEasyGraph = () => {
    setIsCustomInputMode(false);
    resetAll();
    const safeCount = Math.min(Math.max(2, nodeCount), maxNodesLimit);
    setGraph(generateEasyGraph(dimensions.width, dimensions.height, safeCount));
  };

  // --- Custom Graph Parsing ---
  const parseCustomGraph = () => {
    try {
      const partsN = customNodesInput.trim() ? customNodesInput.split(';') : [];
      const nodes = partsN.map(chunk => {
        const [sid, sx, sy] = chunk.trim().split(',');
        const id = parseInt(sid, 10);
        const x = parseFloat(sx);
        const y = parseFloat(sy);
        if (Number.isNaN(id) || Number.isNaN(x) || Number.isNaN(y) || id < 0) {
          throw new Error('Node format must be id,x,y with non-negative numbers');
        }
        return { id, x, y, label: id };
      });
      if (nodes.length === 0) throw new Error('No nodes provided.');
      if (nodes.length > maxNodesLimit) throw new Error(`Node count exceeds limit ${maxNodesLimit}.`);

      const idSet = new Set(nodes.map(n => n.id));
      if (idSet.size !== nodes.length) throw new Error('Node IDs must be unique.');

      const partsE = customEdgesInput.trim() ? customEdgesInput.split(';') : [];
      const ek = new Set();
      const edges = [];
      for (const chunk of partsE) {
        const [sa, sb] = chunk.trim().split(',');
        const a = parseInt(sa, 10);
        const b = parseInt(sb, 10);
        if (Number.isNaN(a) || Number.isNaN(b) || a < 0 || b < 0) throw new Error('Edge format must be source,target');
        if (!idSet.has(a) || !idSet.has(b)) throw new Error(`Edge references missing node: ${a},${b}`);
        if (a === b) continue; // skip self
        const k = edgeKey(a, b);
        if (!ek.has(k)) { ek.add(k); edges.push({ source: a, target: b }); }
      }

      resetAll();
      setGraph({ nodes, edges });
      setIsCustomInputMode(true);
      setMessage('Custom graph loaded. Select start and end nodes.');
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(`Error parsing custom graph: ${err.message}`);
      console.error(err);
    }
  };

  // keep custom textareas prefilled with current default graph (for easy editing)
  useEffect(() => {
    if (!isCustomInputMode && graph.nodes.length) {
      const nodesString = graph.nodes.map(n => `${n.id},${Math.round(n.x)},${Math.round(n.y)}`).join('; ');
      const edgesString = graph.edges.map(e => `${e.source},${e.target}`).join('; ');
      setCustomNodesInput(nodesString);
      setCustomEdgesInput(edgesString);
    }
  }, [graph, isCustomInputMode]);

  // --- Step runner ---
  const processStep = useCallback((step) => {
    if (!step) return;
    if (step.message) setMessage(step.message);
    if (step.line != null) setHighlightedLine(step.line);
    if (step.stats) setStats(step.stats);

    // mutate via functional updates to avoid stale closures
    setNodeStates(prev => {
      const ns = { ...prev };
      // demote any CURRENT to VISITED
      for (const k of Object.keys(ns)) if (ns[k] === NODE_STATE.CURRENT) ns[k] = NODE_STATE.VISITED;

      switch (step.type) {
        case 'dequeue':
          ns[step.nodeId] = NODE_STATE.CURRENT;
          break;
        case 'enqueue':
          ns[step.nodeId] = NODE_STATE.VISITED;
          break;
        case 'path-node':
          ns[step.nodeId] = NODE_STATE.PATH;
          break;
        case 'path-end':
        case 'no-path':
          if (startNode != null) ns[startNode] = NODE_STATE.START;
          if (endNode != null) ns[endNode] = NODE_STATE.END;
          break;
        default:
          break;
      }
      return ns;
    });

    if (step.type === 'path-edge') {
      setEdgeStates(prev => ({ ...prev, [edgeKey(step.source, step.target)]: 'PATH' }));
    }

    if (step.type === 'path-end' || step.type === 'no-path') {
      setIsVisualizing(false);
      setIsPaused(false);
    }
  }, [startNode, endNode]);

  const runAnimation = useCallback(() => {
    if (isPaused || !isVisualizing) return;
    if (currentStep >= steps.length) { setIsVisualizing(false); return; }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      processStep(steps[currentStep]);
      setCurrentStep(s => s + 1);
    }, Math.max(20, animationSpeed));
  }, [animationSpeed, currentStep, isPaused, isVisualizing, steps, processStep]);

  useEffect(() => {
    runAnimation();
    return () => clearTimeout(timeoutRef.current);
  }, [runAnimation]);

  const codeString = `function bfs(graph, startNode, endNode) {
  const queue = [startNode];
  const visited = new Set([startNode]);
  const parentMap = new Map();
  while (queue.length > 0) {
    const currentNode = queue.shift();
    if (currentNode === endNode) {
      return reconstructPath(parentMap, endNode);
    }
    for (const neighbor of graph.getNeighbors(currentNode)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parentMap.set(neighbor, currentNode);
        queue.push(neighbor);
      }
    }
  }
  return 'No Path Found';
}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 tracking-tight">BFS Graph Visualizer</h1>
          <p className="text-gray-500">See Breadth-First Search find the shortest path in a graph.</p>
        </header>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4 mb-4 p-4 bg-gray-50 rounded-md border">
          <div>
          <div className="flex justify-center items-center gap-3">
            <button className="btn btn-primary btn-lg shadow-md" onClick={handleStart} disabled={isVisualizing || startNode == null || endNode == null}>
              <Play className="mr-2"/> Start
            </button>
            <button className="btn btn-secondary btn-lg shadow-md" onClick={() => setIsPaused(p => !p)} disabled={!isVisualizing}>
              {isPaused ? <Play className="mr-2"/> : <Pause className="mr-2"/>} {isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>

          <div className="flex justify-center items-center gap-3">
            <button className="btn btn-ghost text-red-600" onClick={resetAll}><RotateCcw className="mr-2"/> Reset All</button>
            <button className="btn btn-ghost" onClick={handleGenerateEasyGraph} disabled={isVisualizing || isCustomInputMode === false}><Shuffle className="mr-2"/> Default Graph</button>
          </div>
        </div>

        <div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2"><Zap size={16}/> Speed</span>
              <input type="range" min="20" max="500" step="10" value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))} disabled={isVisualizing} className="range range-primary range-sm" />
              <span className="text-xs text-gray-500">{animationSpeed}ms</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Node Count</span>
              <input type="range" min={2} max={maxNodesLimit} value={nodeCount} onChange={(e) => setNodeCount(Number(e.target.value))} disabled={isVisualizing || isCustomInputMode} className="range range-sm" />
              <span className="text-xs text-gray-500">{nodeCount} / {maxNodesLimit}</span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Max Nodes Limit</span>
              <input type="number" min={2} max={100} value={maxNodesLimit} onChange={(e) => setMaxNodesLimit(Math.max(2, Math.min(100, Number(e.target.value) || 2)))} disabled={isVisualizing} className="input input-bordered input-sm" />
              <span className="text-xs text-gray-500">Raise this carefully for performance.</span>
            </label>
          </div>
        </div>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center items-center p-3 mb-6 bg-gray-100 rounded-md">
          <p className="font-medium text-gray-700 md:col-span-2 md:text-left flex items-center gap-2"><Pointer size={16}/> {message}</p>
          <div className="flex justify-center md:justify-end gap-6 font-mono text-sm"><span>Visited: <strong className="text-blue-600">{stats.visited}</strong></span><span>Path Edges: <strong className="text-purple-600">{stats.pathLength}</strong></span></div>
        </div>

        {/* Custom Graph IO */}
        <div className="mb-6 p-4 bg-blue-50  rounded-md  border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2 mb-3"><Edit size={20}/> Customize Graph (limit {maxNodesLimit} nodes)</h3>
          <div className="flex flex-col md:flex-row gap-4 mb-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nodes (id,x,y; ...)</label>
              <textarea className="textarea textarea-bordered w-full font-mono text-xs" rows={3} value={customNodesInput} onChange={(e) => setCustomNodesInput(e.target.value)} placeholder="e.g., 0,50,50; 1,150,50; 2,100,150" disabled={isVisualizing}></textarea>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Edges (sourceId,targetId; ...)</label>
              <textarea className="textarea textarea-bordered w-full font-mono text-xs" rows={3} value={customEdgesInput} onChange={(e) => setCustomEdgesInput(e.target.value)} placeholder="e.g., 0,1; 1,2; 2,0" disabled={isVisualizing}></textarea>
            </div>
          </div>
          <button className="btn btn-info btn-block" onClick={parseCustomGraph} disabled={isVisualizing}><PlusCircle className="mr-2"/> Load Custom Graph</button>
          <p className="text-sm text-gray-600 mt-2">IDs are 0-based integers. Coordinates are pixels inside the SVG. Use “Default Graph” to go back to an auto grid.</p>
        </div>

        {/* Visualization */}
        <div className="w-full bg-white rounded-lg border border-gray-200" ref={svgContainerRef}>
          <svg width={dimensions.width} height={dimensions.height} className="transition-all duration-300">
            <g>
              {/* edges */}
              {graph.edges.map(({ source, target }, i) => {
                const A = graph.nodes.find(n => n.id === source);
                const B = graph.nodes.find(n => n.id === target);
                if (!A || !B) return null;
                const isPath = edgeStates[edgeKey(source, target)] === 'PATH';
                return (
                  <motion.line key={`${edgeKey(source, target)}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={isPath ? '#a855f7' : '#cbd5e1'} strokeWidth={isPath ? 4 : 2} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} />
                );
              })}

              {/* nodes */}
              {graph.nodes.map(node => {
                const state = nodeStates[node.id] || NODE_STATE.IDLE;
                const colors = {
                  [NODE_STATE.IDLE]: '#64748b',
                  [NODE_STATE.START]: '#10b981',
                  [NODE_STATE.END]: '#ef4444',
                  [NODE_STATE.VISITED]: '#67e8f9',
                  [NODE_STATE.CURRENT]: '#38bdf8',
                  [NODE_STATE.PATH]: '#a855f7',
                };
                const strokeColors = {
                  [NODE_STATE.IDLE]: '#e2e8f0',
                  [NODE_STATE.START]: '#a7f3d0',
                  [NODE_STATE.END]: '#fecaca',
                  [NODE_STATE.VISITED]: '#a5f3fc',
                  [NODE_STATE.CURRENT]: '#7dd3fc',
                  [NODE_STATE.PATH]: '#d8b4fe',
                };
                return (
                  <g key={node.id} onClick={() => handleNodeClick(node.id)} className="cursor-pointer">
                    <motion.circle cx={node.x} cy={node.y} r={NODE_RADIUS} fill={colors[state]} stroke={strokeColors[state]} strokeWidth={3} animate={state === NODE_STATE.CURRENT ? { scale: [1, 1.25, 1] } : { scale: 1 }} transition={state === NODE_STATE.CURRENT ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }} />
                    <text x={node.x} y={node.y} textAnchor="middle" dy=".35em" fill="white" fontSize="12" fontWeight="bold">{node.label}</text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-4 border-t pt-4">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"><Target size={12} className="text-white"/></div><span>Start</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"><Route size={12} className="text-white"/></div><span>End</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-cyan-300"></div><span>Visited</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-sky-400 animate-pulse"></div><span>Current</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-500"></div><span>Path</span></div>
        </div>

        {/* Code */}
        <div className="my-8">
          <details className="bg-gray-800 rounded-lg overflow-hidden group">
            <summary className="p-4 text-white font-medium cursor-pointer flex items-center gap-2 group-hover:bg-gray-700 transition-colors"><Code size={18}/> View Algorithm Code</summary>
            <div className="relative">
              <SyntaxHighlighter language="javascript" style={oneDark} showLineNumbers wrapLines={true}
                lineProps={lineNumber => ({
                  style: {
                    display: 'block', width: '100%', transition: 'background-color 0.3s ease',
                    backgroundColor: lineNumber === highlightedLine ? 'rgba(59, 130, 246, 0.3)' : undefined,
                    boxShadow: lineNumber === highlightedLine ? 'inset 3px 0 0 0 #3b82f6' : undefined,
                  }
                })}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
