import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, RotateCcw, Zap, ListPlus, Shuffle, Code, GitMerge, UnfoldVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MAX_ARRAY_SIZE = 15; // Keep it small for tree visibility
const MAX_VALUE = 100;

// --- Helper Functions ---
const generateRandomArray = () => {
  const size = Math.floor(Math.random() * 8) + 8; // 8 to 15
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
};

// --- Main Visualizer Component ---
const HeapSortVisualizer = () => {
  const [array, setArray] = useState(generateRandomArray());
  const [arrayInput, setArrayInput] = useState(array.join(', '));
  const [arrayMessage, setArrayMessage] = useState('');
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(400);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const [phase, setPhase] = useState(null);
  const [pointers, setPointers] = useState({ parent: null, left: null, right: null, largest: null });
  const [swappedIndices, setSwappedIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [heapSize, setHeapSize] = useState(null);
  const [message, setMessage] = useState('Ready to sort!');
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0 });
  const [highlightedLine, setHighlightedLine] = useState(null);

  const timeoutRef = useRef(null);

  // --- Step Generation ---
  const generateSteps = useCallback((arr) => {
    const animationSteps = [];
    const workingArr = [...arr];
    const n = workingArr.length;
    let comparisons = 0, swaps = 0;

    const siftDown = (start, end) => {
      let root = start;
      while (root * 2 + 1 <= end) {
        let child = root * 2 + 1;
        let swap = root;
        
        animationSteps.push({ type: 'compare', pointers: { parent: root, left: child, right: child + 1 <= end ? child + 1 : null, largest: null }, arrayState: [...workingArr], stats: { comparisons, swaps }, message: `Sifting down from node ${workingArr[root]}.` });
        
        if (workingArr[swap] < workingArr[child]) { swap = child; }
        comparisons++;
        if (child + 1 <= end && workingArr[swap] < workingArr[child + 1]) { swap = child + 1; }
        comparisons++;
        
        animationSteps.push({ type: 'compare', pointers: { parent: root, left: child, right: child + 1 <= end ? child + 1 : null, largest: swap }, arrayState: [...workingArr], stats: { comparisons, swaps }, message: `Largest is ${workingArr[swap]}.`});

        if (swap === root) { return; }
        else {
          swaps++;
          animationSteps.push({ type: 'swap', indices: [root, swap], arrayState: [...workingArr], stats: { comparisons, swaps }, message: `Swapping ${workingArr[root]} and ${workingArr[swap]}.` });
          [workingArr[root], workingArr[swap]] = [workingArr[swap], workingArr[root]];
          root = swap;
        }
      }
    };

    animationSteps.push({ type: 'phase-change', phase: 'heapify', heapSize: n, message: 'Phase 1: Building the Max Heap.' });
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) { siftDown(i, n - 1); }

    animationSteps.push({ type: 'phase-change', phase: 'sorting', heapSize: n, message: 'Phase 2: Extracting max element and sorting.' });
    for (let i = n - 1; i > 0; i--) {
      swaps++;
      animationSteps.push({ type: 'swap-root', indices: [0, i], arrayState: [...workingArr], stats: { comparisons, swaps }, heapSize: i, message: `Swapping max element ${workingArr[0]} with heap end ${workingArr[i]}.` });
      [workingArr[0], workingArr[i]] = [workingArr[i], workingArr[0]];
      animationSteps.push({ type: 'lock', index: i, arrayState: [...workingArr], stats: { comparisons, swaps }, heapSize: i, message: `${workingArr[i]} is now sorted.` });
      siftDown(0, i - 1);
    }
    
    animationSteps.push({ type: 'lock', index: 0, arrayState: [...workingArr], stats: { comparisons, swaps }, heapSize: 0, message: 'Array is fully sorted!' });
    setSteps(animationSteps);
  }, []);

  // --- Animation Control ---
  const processStep = useCallback((step) => {
    if (!step) return;
    setMessage(step.message);
    setStats(step.stats);
    setHighlightedLine(step.line || null);
    setSwappedIndices([]);

    switch (step.type) {
      case 'phase-change': setPhase(step.phase); setHeapSize(step.heapSize); break;
      case 'compare': setArray(step.arrayState); setPointers(step.pointers); break;
      case 'swap': case 'swap-root':
        setArray(step.arrayState);
        setSwappedIndices(step.indices);
        const nextStep = steps[currentStep];
        if (nextStep) setArray(nextStep.arrayState);
        break;
      case 'lock':
        setArray(step.arrayState);
        setSortedIndices(prev => [...prev, step.index]);
        setHeapSize(step.heapSize);
        setPointers({});
        if(step.heapSize === 0) { setIsSorting(false); setIsPaused(false); }
        break;
      default: break;
    }
  }, [steps, currentStep]);
  
  const runAnimation = useCallback(() => {
    if (currentStep >= steps.length || isPaused) { if (currentStep >= steps.length) setIsSorting(false); return; }
    timeoutRef.current = setTimeout(() => { processStep(steps[currentStep]); setCurrentStep(prev => prev + 1); }, animationSpeed);
  }, [currentStep, steps, isPaused, animationSpeed, processStep]);

  useEffect(() => { if (isSorting && !isPaused) runAnimation(); return () => clearTimeout(timeoutRef.current); }, [isSorting, isPaused, runAnimation]);

  const resetVisuals = useCallback(() => { clearTimeout(timeoutRef.current); setIsSorting(false); setIsPaused(false); setCurrentStep(0); setSteps([]); setPointers({}); setSortedIndices([]); setSwappedIndices([]); setStats({ comparisons: 0, swaps: 0 }); setMessage('Ready to sort!'); setHighlightedLine(null); setPhase(null); setHeapSize(null); }, []);
  const handleStart = () => { resetVisuals(); generateSteps(array); setIsSorting(true); setIsPaused(false); setCurrentStep(0); setTimeout(() => { processStep(steps[0]); setCurrentStep(1); }, 50); };
  const handlePauseResume = () => setIsPaused(!isPaused);
  const handleReset = () => { resetVisuals(); setArray(arrayInput.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0) || generateRandomArray()); };
  const handleSetArray = () => { resetVisuals(); let newArr = arrayInput.split(',').map(s=>Number(s.trim())).filter(n=>!isNaN(n) && n > 0); if(newArr.length===0){setArrayMessage('❌ Invalid input.');return;} if(newArr.length>MAX_ARRAY_SIZE){setArrayMessage(`❌ Max size is ${MAX_ARRAY_SIZE}.`);return;} setArray(newArr); setArrayMessage('✅ Array set!'); };
  const handleRandomize = () => { resetVisuals(); const newArr = generateRandomArray(); setArray(newArr); setArrayInput(newArr.join(', ')); };
  
  const codeString = `function heapSort(arr) { /* ... */ }`;
  const treeStructure = useMemo(() => { if (array.length === 0) return { nodes: [], lines: [] }; const nodes = [], lines = [], width = 800; const dfs = (index, level, x, parentPos) => { if (index >= array.length) return; const pos = { x, y: level * 100 + 50 }; nodes.push({ value: array[index], index, pos }); if (parentPos) lines.push({ x1: parentPos.x, y1: parentPos.y, x2: pos.x, y2: pos.y, index }); const offset = width / Math.pow(2, level + 2); dfs(2 * index + 1, level + 1, x - offset, pos); dfs(2 * index + 2, level + 1, x + offset, pos); }; dfs(0, 0, width / 2, null); return { nodes, lines }; }, [array]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 tracking-tight">Heap Sort Visualizer</h1>
          <p className="text-gray-500">The ultimate visual guide to Heap Sort's two-phase process: Heapify and Sort-down.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-md border">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><ListPlus size={16}/> Your Array (max {MAX_ARRAY_SIZE})</label>
            <div className="flex gap-2"><input value={arrayInput} onChange={(e) => setArrayInput(e.target.value)} disabled={isSorting} className="input input-bordered w-full disabled:bg-gray-200"/><button onClick={handleSetArray} disabled={isSorting} className="btn btn-primary">Set</button></div>
            <button onClick={handleRandomize} disabled={isSorting} className="btn btn-ghost btn-sm text-primary mt-2 flex items-center gap-2"><Shuffle size={16}/> Randomize</button>
            {arrayMessage && <p className="text-sm text-blue-600 mt-2">{arrayMessage}</p>}
          </div>
          <div>
            <div className="mb-1 flex justify-between items-center"><label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Zap size={16}/> Speed</label><span className="text-sm font-mono text-gray-500">{animationSpeed}ms</span></div>
            <input type="range" min="50" max="1000" step="25" value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))} disabled={isSorting} className="range range-primary range-sm" />
          </div>
        </div>
        
        <div className="flex justify-center items-center gap-4 mb-4">
          <button className="btn btn-primary btn-lg shadow-md" onClick={handleStart} disabled={isSorting}><Play className="mr-2"/> Start</button>
          <button className="btn btn-secondary btn-lg shadow-md" onClick={handlePauseResume} disabled={!isSorting}>{isPaused ? <Play className="mr-2"/> : <Pause className="mr-2"/>} {isPaused ? 'Resume' : 'Pause'}</button>
          <button className="btn btn-ghost btn-lg text-red-600" onClick={handleReset}><RotateCcw className="mr-2"/> Reset</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center h-auto md:h-14 items-center p-3 mb-6 bg-gray-100 rounded-md">
           <p className="font-medium text-gray-700 md:col-span-2 md:text-left">{message}</p>
           <div className="flex justify-center md:justify-end gap-6 font-mono text-black text-sm"><span>Comparisons: <strong className="text-blue-600">{stats?.comparisons}</strong></span><span>Swaps: <strong className="text-red-600">{stats?.swaps}</strong></span></div>
        </div>

        <div className="w-full bg-white p-4 rounded-lg border border-gray-200">
            <div className="h-16 flex items-center justify-center">
              <AnimatePresence>{phase && <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className={`text-xl font-bold p-3 rounded-lg shadow-md flex items-center gap-2 ${phase === 'heapify' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{phase === 'heapify' ? <><GitMerge/> Building Max Heap</> : <><UnfoldVertical/> Sorting Phase</>}</motion.div>}</AnimatePresence>
            </div>
            
            <div className="relative w-full overflow-x-auto mb-8" style={{ height: `${(Math.floor(Math.log2(array.length)) + 1) * 100}px` }}>
                <svg className="absolute top-0 left-0 w-full h-full" style={{width: 800}}>{treeStructure.lines.map((line, i) => <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} className="stroke-gray-300" strokeWidth="2" />)}</svg>
                {treeStructure.nodes.map(node => {
                  const isParent = pointers.parent === node.index, isLargest = pointers.largest === node.index, isSwapping = swappedIndices.includes(node.index), isSorted = sortedIndices.includes(node.index);
                  let nodeBgColor = 'bg-sky-200', nodeTextColor = 'text-gray-800', ring = '';
                  if(isParent) ring = 'ring-4 ring-blue-500'; if(isLargest) ring = 'ring-4 ring-purple-500'; if(isSwapping) { nodeBgColor = 'bg-red-400'; nodeTextColor = 'text-white'; } if(isSorted) { nodeBgColor = 'bg-green-500'; nodeTextColor = 'text-white'; }
                  return (
                    <motion.div key={node.index} layoutId={`node-${node.index}`} transition={{type:'spring',stiffness:300,damping:30}} className="absolute" style={{top:node.pos.y-24,left:node.pos.x-24,zIndex:isParent||isLargest?10:5}}>
                      <div className="relative w-12 h-12">
                        <div className={`w-full h-full flex items-center justify-center rounded-full font-bold text-lg shadow-lg ${nodeBgColor} ${nodeTextColor} ${ring}`}>{node.value}</div>
                        <div className="absolute -bottom-6 left-0 right-0 text-center text-xs font-semibold text-gray-500">{`[${node.index}]`}</div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
            
            <div className="mt-8">
              <div className="flex items-end justify-center gap-1" style={{ minHeight: '100px' }}>
                  {array.map((value, index) => { const isSwapping=swappedIndices.includes(index),isSorted=sortedIndices.includes(index); let bgColor='bg-sky-500'; if(isSwapping)bgColor='bg-red-500';if(isSorted)bgColor='bg-green-500';if(heapSize!==null&&index>=heapSize)bgColor=isSorted?'bg-green-500':'bg-gray-400'; return (<div key={index} className="relative flex-grow" style={{minWidth:'1rem'}}><motion.div layoutId={`bar-${index}`} transition={{type:'spring',stiffness:300,damping:30}} className={`${bgColor} rounded-t-md`} style={{height:`${value}px`}}/></div>); })}
              </div>
              <div className="flex items-start justify-center gap-1 mt-1">
                {array.map((value, index) => {
                  const isSwapping = swappedIndices.includes(index), isSorted = sortedIndices.includes(index);
                  let boxBg = 'bg-sky-200 text-sky-800';
                  if (isSwapping) boxBg = 'bg-red-400 text-white'; if (isSorted) boxBg = 'bg-green-500 text-white'; if (heapSize !== null && index >= heapSize) boxBg = isSorted ? 'bg-green-500 text-white' : 'bg-gray-400 text-white';
                  return (<div key={index} className={`flex-grow h-8 flex items-center justify-center rounded-md text-xs font-bold shadow-sm transition-colors duration-300 ${boxBg}`} style={{ minWidth: '1rem' }}>{value}</div>);
                })}
              </div>
              <div className="relative flex items-start justify-center gap-1 mt-1">
                  {array.map((_, index) => <div key={index} className="flex-grow text-center text-xs text-gray-600" style={{minWidth: '1rem'}}>{index}</div>)}
                   {heapSize > 0 && <div className="absolute -bottom-5 h-5 border-b-2 border-x-2 border-blue-500 rounded-b-lg" style={{left: 0, width: `calc(${(100 / array.length) * heapSize}% - 2px)`, transition: 'width 0.3s ease' }}><div className="text-center text-xs text-blue-600 font-semibold">HEAP</div></div>}
              </div>
            </div>

            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-12 border-t pt-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full ring-2 ring-blue-500"></div><span>Sift Parent</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full ring-2 ring-purple-500"></div><span>Largest Node</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500"></div><span>Swapping</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span>Sorted</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-sky-200"></div><span>In Heap</span></div>
            </div>
        </div>

        <div className="my-8">
            <details className="bg-gray-800 rounded-lg overflow-hidden group">
                <summary className="p-4 text-white font-medium cursor-pointer flex items-center gap-2 group-hover:bg-gray-700 transition-colors"><Code size={18}/> View Algorithm Code</summary>
                <div className="relative"><SyntaxHighlighter language="javascript" style={oneDark} showLineNumbers wrapLines={true}>{codeString}</SyntaxHighlighter></div>
            </details>
        </div>
      </div>
    </div>
  );
};

export default HeapSortVisualizer;