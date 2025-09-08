import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Target, Route, Code, Shuffle, Pointer, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- Graph Configuration ---
const MIN_NODES = 5;
const MAX_NODES = 50;
const NODE_RADIUS = 15;

// --- Node States (Unchanged) ---
const NODE_STATE = {
  IDLE: 'IDLE', START: 'START', END: 'END', ACTIVE: 'ACTIVE',
  VISITED: 'VISITED', CURRENT: 'CURRENT', PATH: 'PATH',
};

// --- Helper to generate a random graph (NOW PARAMETERIZED) ---
const generateRandomGraph = (width, height, nodeCount) => {
    const newNodes = [];
    const newEdges = [];
    const PADDING = NODE_RADIUS * 2.5;
    
    // Dynamically calculate edge count for good density
    const edgeCount = Math.floor(nodeCount * 1.4);

    for (let i = 0; i < nodeCount; i++) {
        let x, y, tooClose;
        let attempts = 0;
        do {
            tooClose = false;
            x = Math.random() * (width - PADDING * 2) + PADDING;
            y = Math.random() * (height - PADDING * 2) + PADDING;
            for (const node of newNodes) {
                const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
                if (distance < NODE_RADIUS * 3.5) {
                    tooClose = true;
                    break;
                }
            }
            attempts++;
        } while (tooClose && attempts < 100); // Add attempt limit to prevent infinite loops
        newNodes.push({ id: i, x, y, label: i });
    }

    const edgeSet = new Set();
    while (newEdges.length < edgeCount && newEdges.length < (nodeCount * (nodeCount - 1)) / 2) {
        const sourceId = Math.floor(Math.random() * nodeCount);
        const targetId = Math.floor(Math.random() * nodeCount);
        const edgeKey1 = `${sourceId}-${targetId}`;
        const edgeKey2 = `${targetId}-${sourceId}`;

        if (sourceId !== targetId && !edgeSet.has(edgeKey1)) {
            newEdges.push({ source: sourceId, target: targetId });
            edgeSet.add(edgeKey1);
            edgeSet.add(edgeKey2);
        }
    }
    return { nodes: newNodes, edges: newEdges };
};


// --- The Main Visualizer Component ---
const DFSGraphVisualizer = () => {
    // --- NEW STATE for node count ---
    const [numNodes, setNumNodes] = useState(25);
    const [nodeCountInput, setNodeCountInput] = useState("25");

    const [graph, setGraph] = useState({ nodes: [], edges: [] });
    const [startNode, setStartNode] = useState(null);
    const [endNode, setEndNode] = useState(null);
    const [isVisualizing, setIsVisualizing] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(150);
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [nodeStates, setNodeStates] = useState({});
    const [edgeStates, setEdgeStates] = useState({});
    const [stats, setStats] = useState({ visited: 0, pathLength: 0 });
    const [message, setMessage] = useState('Select a start node.');
    const [highlightedLine, setHighlightedLine] = useState(null);
    const svgContainerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
    const timeoutRef = useRef(null);

    // Effect for responsive SVG dimensions
    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width } = entries[0].contentRect;
                setDimensions({ width, height: 500 });
            }
        });
        if (svgContainerRef.current) {
            resizeObserver.observe(svgContainerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

    // Effect to generate graph when dimensions are known or numNodes changes
    useEffect(() => {
        if (dimensions.width > 0) {
           handleApplyNodeCount(true); // Generate graph on initial load
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dimensions.width, numNodes]);

    // --- Core Algorithm (Unchanged) ---
    const generateDfsSteps = useCallback(() => {
        if (startNode === null || endNode === null) return;
        // ... (The entire generateDfsSteps function remains the same)
        const adj = new Map(graph.nodes.map(node => [node.id, []]));
        for (const edge of graph.edges) {
            adj.get(edge.source).push(edge.target);
            adj.get(edge.target).push(edge.source);
        }
        const animationSteps = [];
        const stack = [startNode];
        const visited = new Set();
        const parentMap = new Map();
        let visitedCount = 0;
        animationSteps.push({ type: 'push', nodeId: startNode, line: 4, message: `Starting DFS. Pushing Start Node ${startNode} to stack.` });
        while (stack.length > 0) {
            const currentNodeId = stack.pop();
            if (visited.has(currentNodeId)) {
                animationSteps.push({ type: 'backtrack', nodeId: currentNodeId, line: 14, message: `Node ${currentNodeId} already explored. Backtracking.` });
                continue;
            }
            visited.add(currentNodeId);
            visitedCount++;
            animationSteps.push({ type: 'pop', nodeId: currentNodeId, line: 7, stats: { visited: visitedCount, pathLength: 0 }, message: `Exploring Node ${currentNodeId}.` });
            if (currentNodeId === endNode) {
                animationSteps.push({ type: 'path-found', message: 'End node found!' });
                break;
            }
            const neighbors = adj.get(currentNodeId) || [];
            for (let i = neighbors.length - 1; i >= 0; i--) {
                const neighborId = neighbors[i];
                if (!visited.has(neighborId)) {
                    parentMap.set(neighborId, currentNodeId);
                    stack.push(neighborId);
                    animationSteps.push({ type: 'push', nodeId: neighborId, line: 11, message: `Found unvisited neighbor ${neighborId}. Pushing to stack.` });
                }
            }
        }
        if (visited.has(endNode)) {
            animationSteps.push({ type: 'path-start', line: 17, message: 'Reconstructing path from end to start.' });
            const path = [];
            let current = endNode;
            while (current !== undefined) {
                path.unshift(current);
                const parent = parentMap.get(current);
                 if (parent !== undefined) {
                    animationSteps.push({ type: 'path-edge', source: parent, target: current });
                }
                current = parent;
            }
            for (const nodeId of path) {
                animationSteps.push({ type: 'path-node', nodeId });
            }
            animationSteps.push({ type: 'path-end', message: `Path found! Length: ${path.length - 1} edges.`, stats: { visited: visitedCount, pathLength: path.length - 1 } });
        } else {
            animationSteps.push({ type: 'no-path', message: 'No path could be found to the end node.' });
        }
        setSteps(animationSteps);
    }, [startNode, endNode, graph]);

    // --- Animation Control (Unchanged) ---
    // ... (processStep, runAnimation, and its useEffect remain the same)
    const processStep = useCallback((step) => {
        if (!step) return;
        setMessage(step.message);
        setHighlightedLine(step.line);
        if (step.stats) setStats(step.stats);
        setNodeStates(prev => {
            const newStates = {...prev};
            const currentKey = Object.keys(newStates).find(key => newStates[key] === NODE_STATE.CURRENT);
            if(currentKey) newStates[currentKey] = NODE_STATE.ACTIVE;
            return newStates;
        });
        switch (step.type) {
            case 'push': setNodeStates(prev => ({...prev, [step.nodeId]: NODE_STATE.ACTIVE })); break;
            case 'pop': setNodeStates(prev => ({...prev, [step.nodeId]: NODE_STATE.CURRENT })); break;
            case 'backtrack': setNodeStates(prev => ({...prev, [step.nodeId]: NODE_STATE.VISITED })); break;
            case 'path-edge': setEdgeStates(prev => ({...prev, [`${step.source}-${step.target}`]: 'PATH', [`${step.target}-${step.source}`]: 'PATH' })); break;
            case 'path-node': setNodeStates(prev => ({...prev, [step.nodeId]: NODE_STATE.PATH })); break;
            case 'path-end': case 'no-path': setIsVisualizing(false); setIsPaused(false); break;
            default: break;
        }
    }, []);
    const runAnimation = useCallback(() => {
        if (currentStep >= steps.length || isPaused) {
            if (currentStep >= steps.length) setIsVisualizing(false);
            return;
        }
        timeoutRef.current = setTimeout(() => {
            processStep(steps[currentStep]);
            setCurrentStep(prev => prev + 1);
        }, animationSpeed);
    }, [currentStep, steps, isPaused, animationSpeed, processStep]);
    useEffect(() => {
        if (isVisualizing && !isPaused) runAnimation();
        return () => clearTimeout(timeoutRef.current);
    }, [isVisualizing, isPaused, runAnimation]);


    // --- UI Handlers (UPDATED) ---
    const resetAll = () => {
        clearTimeout(timeoutRef.current);
        setIsVisualizing(false);
        setIsPaused(false);
        setCurrentStep(0);
        setSteps([]);
        setStats({ visited: 0, pathLength: 0 });
        setHighlightedLine(null);
        setStartNode(null);
        setEndNode(null);
        setNodeStates({});
        setEdgeStates({});
        setMessage('Select a start node.');
    };

    const handleApplyNodeCount = (isInitialLoad = false) => {
        const newCount = parseInt(nodeCountInput, 10);
        if (isNaN(newCount)) {
            setNodeCountInput(String(numNodes)); // Reset if invalid
            return;
        }
        const clampedCount = Math.max(MIN_NODES, Math.min(newCount, MAX_NODES));
        
        if (!isInitialLoad || clampedCount !== numNodes) {
             setNumNodes(clampedCount);
        }
        setNodeCountInput(String(clampedCount));
        resetAll();
        setGraph(generateRandomGraph(dimensions.width, dimensions.height, clampedCount));
    };

    const handleRandomize = () => {
        resetAll();
        setGraph(generateRandomGraph(dimensions.width, dimensions.height, numNodes));
    };
    
    // ... (handleStart, handleNodeClick, etc. remain mostly the same)
    const handleStart = () => {
        // ...
        resetVisuals();
        generateDfsSteps();
        setIsVisualizing(true);
        setIsPaused(false);
        setCurrentStep(0);
        setMessage('Starting visualization...');
        setTimeout(() => {
            if(steps.length > 0) {
                 processStep(steps[0]);
                 setCurrentStep(1);
            }
        }, 50);
    };

    const resetVisuals = useCallback(() => {
        clearTimeout(timeoutRef.current);
        setIsVisualizing(false);
        setIsPaused(false);
        setCurrentStep(0);
        setSteps([]);
        setStats({ visited: 0, pathLength: 0 });
        setHighlightedLine(null);
        setNodeStates(prev => ({
            ...(startNode !== null && {[startNode]: NODE_STATE.START}),
            ...(endNode !== null && {[endNode]: NODE_STATE.END}),
        }));
        setEdgeStates({});
    }, [startNode, endNode]);

    const handleNodeClick = (nodeId) => {
        if (isVisualizing) return;
        if (startNode === null) {
            setStartNode(nodeId);
            setNodeStates({ [nodeId]: NODE_STATE.START });
            setMessage('Select an end node.');
        } else if (endNode === null && nodeId !== startNode) {
            setEndNode(nodeId);
            setNodeStates(prev => ({ ...prev, [nodeId]: NODE_STATE.END }));
            setMessage('Ready to visualize! Press Start.');
        } else {
            setStartNode(nodeId);
            setEndNode(null);
            setNodeStates({ [nodeId]: NODE_STATE.START });
            setMessage('Select an end node.');
        }
    };


    const codeString = `function dfs(graph, startNode, endNode) { /* ... */ }`; // Unchanged

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <header className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 tracking-tight">DFS Graph Visualizer</h1>
            <p className="text-gray-500">See Depth-First Search explore a graph by going deep before backtracking.</p>
        </header>
        
        {/* --- Controls --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-md border">
            {/* Main Actions */}
            <div className="flex justify-center items-center gap-2">
                <button className="btn btn-primary btn-lg shadow-md flex-grow" onClick={handleStart} disabled={isVisualizing || startNode === null || endNode === null}><Play className="mr-2"/> Start</button>
                <button className="btn btn-secondary btn-lg shadow-md" onClick={() => setIsPaused(!isPaused)} disabled={!isVisualizing}>{isPaused ? <Play size={20}/> : <Pause size={20}/>}</button>
            </div>
            {/* Graph & Node Controls */}
            <div className="flex flex-col gap-4">
                 <div className="flex justify-center items-center gap-2">
                   <button className="btn btn-ghost text-red-600 flex-grow" onClick={resetAll}><RotateCcw className="mr-2"/> Reset All</button>
                   <button className="btn btn-ghost flex-grow" onClick={handleRandomize} disabled={isVisualizing}><Shuffle className="mr-2"/> New Graph</button>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Nodes:</label>
                    <input type="range" min={MIN_NODES} max={MAX_NODES} value={nodeCountInput}
                        onChange={(e) => setNodeCountInput(e.target.value)} disabled={isVisualizing}
                        className="range range-accent range-sm flex-grow" />
                    <input type="number" value={nodeCountInput} min={MIN_NODES} max={MAX_NODES}
                        onChange={(e) => setNodeCountInput(e.target.value)} disabled={isVisualizing}
                        className="input input-bordered w-20 text-center" />
                    <button className="btn btn-accent btn-sm" onClick={() => handleApplyNodeCount()} disabled={isVisualizing}><Check size={16}/></button>
                </div>
            </div>
             {/* Speed Control */}
            <div className="flex flex-col justify-center">
                <div className="mb-1 flex justify-between items-center"><label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Zap size={16}/> Speed</label><span className="text-sm font-mono text-gray-500">{animationSpeed}ms</span></div>
                <input type="range" min="20" max="500" step="10" value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))} disabled={isVisualizing} className="range range-primary range-sm" />
            </div>
        </div>

        {/* --- Status Bar --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center items-center p-3 mb-6 bg-gray-100 rounded-md">
           <p className="font-medium text-gray-700 md:col-span-2 md:text-left flex items-center gap-2"><Pointer size={16}/> {message}</p>
           <div className="flex justify-center md:justify-end gap-6 font-mono text-sm"><span>Visited: <strong className="text-blue-600">{stats.visited}</strong></span><span>Path Edges: <strong className="text-purple-600">{stats.pathLength}</strong></span></div>
        </div>

        {/* --- Visualization Area (Unchanged) --- */}
        <div className="w-full bg-white rounded-lg border border-gray-200" ref={svgContainerRef}>
            <svg width={dimensions.width} height={dimensions.height}>
                 {/* SVG content for nodes and edges remains the same */}
                  <g>
                    {graph.edges.map(({ source, target }, i) => {
                         const sourceNode = graph.nodes.find(n => n.id === source);
                         const targetNode = graph.nodes.find(n => n.id === target);
                         if (!sourceNode || !targetNode) return null;
                         const isPath = edgeStates[`${source}-${target}`] === 'PATH';
                         return (
                            <motion.line key={i} x1={sourceNode.x} y1={sourceNode.y} x2={targetNode.x} y2={targetNode.y}
                                stroke={isPath ? "#a855f7" : "#cbd5e1"} strokeWidth={isPath ? 4 : 2}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                            />
                         )
                    })}
                    {graph.nodes.map(node => {
                        const state = nodeStates[node.id] || NODE_STATE.IDLE;
                        const colors = {
                            [NODE_STATE.IDLE]: "#64748b", [NODE_STATE.START]: "#10b981", [NODE_STATE.END]: "#ef4444",
                            [NODE_STATE.ACTIVE]: "#f59e0b", [NODE_STATE.VISITED]: "#67e8f9",
                            [NODE_STATE.CURRENT]: "#38bdf8", [NODE_STATE.PATH]: "#a855f7"
                        };
                         return (
                            <g key={node.id} onClick={() => handleNodeClick(node.id)} className="cursor-pointer">
                                <motion.circle cx={node.x} cy={node.y} r={NODE_RADIUS}
                                    fill={colors[state]} stroke="#f8fafc" strokeWidth={2}
                                    animate={state === NODE_STATE.CURRENT ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                                    transition={state === NODE_STATE.CURRENT ? { duration: 0.5, repeat: Infinity } : { duration: 0.2 }}
                                />
                                <text x={node.x} y={node.y} textAnchor="middle" dy=".3em" fill="white" fontSize="12" fontWeight="bold">
                                    {node.label}
                                </text>
                            </g>
                         )
                    })}
                </g>
            </svg>
        </div>

        {/* --- Legend & Code Block (Unchanged) --- */}
        {/* ... */}
         <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-4 border-t pt-4">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"><Target size={12} className="text-white"/></div><span>Start/End</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-amber-500"></div><span>In Stack</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-sky-400 animate-pulse"></div><span>Exploring</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-cyan-300"></div><span>Visited</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-500"></div><span>Path</span></div>
        </div>
        <div className="my-8">
            <details className="bg-gray-800 rounded-lg overflow-hidden group">
                <summary className="p-4 text-white font-medium cursor-pointer flex items-center gap-2 group-hover:bg-gray-700 transition-colors"><Code size={18}/> View Algorithm Code</summary>
                <div>
                     <SyntaxHighlighter language="javascript" style={oneDark} showLineNumbers wrapLines
                        lineProps={lineNumber => ({
                            style: { 
                                display: 'block', width: '100%', transition: 'background-color 0.3s ease',
                                backgroundColor: lineNumber === highlightedLine ? 'rgba(59, 130, 246, 0.3)' : undefined,
                                boxShadow: lineNumber === highlightedLine ? 'inset 3px 0 0 0 #3b82f6' : undefined,
                            }
                        })}>
                        {codeString}
                    </SyntaxHighlighter>
                </div>
            </details>
        </div>

      </div>
    </div>
  );
};

export default DFSGraphVisualizer;