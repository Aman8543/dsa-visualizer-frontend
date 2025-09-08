import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, ListPlus, Shuffle, Code, GitCommit, GitPullRequest, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MAX_ARRAY_SIZE = 25;
const MAX_VALUE = 100;

const generateRandomArray = () => Array.from({ length: Math.floor(Math.random() * 11) + 15 }, () => Math.floor(Math.random() * 90) + 10);

const QuickSortVisualizer = () => {
  const [array, setArray] = useState(generateRandomArray());
  const [arrayInput, setArrayInput] = useState(array.join(', '));
  const [arrayMessage, setArrayMessage] = useState('');
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(250);

  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [pivotIndex, setPivotIndex] = useState(null);
  const [pointers, setPointers] = useState({ i: null, j: null });
  const [partitionRange, setPartitionRange] = useState(null);
  const [swappedIndices, setSwappedIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [recursionStack, setRecursionStack] = useState([]);
  const [message, setMessage] = useState('Ready to sort!');
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0 });
  const [highlightedLine, setHighlightedLine] = useState(null);

  const timeoutRef = useRef(null);

  const generateSteps = useCallback((arr) => {
    const animationSteps = [];
    const workingArr = [...arr];
    let comparisons = 0, swaps = 0;

    const partition = (low, high) => {
      animationSteps.push({ type: 'start-partition', range: [low, high], arrayState: [...workingArr], stack: [...stack], stats: { comparisons, swaps } });
      const pivot = workingArr[high];
      let i = low - 1;
      animationSteps.push({ type: 'select-pivot', pivotIndex: high, pointers: { i, j: low }, arrayState: [...workingArr], stack: [...stack], stats: { comparisons, swaps }, message: `Partitioning [${low}, ${high}]. Pivot is ${pivot}.`, line: 4 });

      for (let j = low; j < high; j++) {
        comparisons++;
        animationSteps.push({ type: 'compare', pointers: { i, j }, pivotIndex: high, arrayState: [...workingArr], stack: [...stack], stats: { comparisons, swaps }, message: `Comparing ${workingArr[j]} with pivot ${pivot}.`, line: 6 });
        if (workingArr[j] < pivot) {
          i++;
          swaps++;
          animationSteps.push({ type: 'swap', indices: [i, j], pointers: { i, j }, pivotIndex: high, arrayState: [...workingArr], stack: [...stack], stats: { comparisons, swaps }, message: `${workingArr[j]} < pivot. Swapping ${workingArr[i]} and ${workingArr[j]}.`, line: 7 });
          [workingArr[i], workingArr[j]] = [workingArr[j], workingArr[i]];
        }
      }
      
      swaps++;
      animationSteps.push({ type: 'place-pivot', indices: [i + 1, high], arrayState: [...workingArr], stack: [...stack], stats: { comparisons, swaps }, message: `Placing pivot ${pivot} in its final sorted position.`, line: 9 });
      [workingArr[i + 1], workingArr[high]] = [workingArr[high], workingArr[i + 1]];
      
      const pivotFinalIndex = i + 1;
      animationSteps.push({ type: 'lock-pivot', index: pivotFinalIndex, arrayState: [...workingArr], stack: [...stack], stats: { comparisons, swaps }, message: `Pivot ${workingArr[pivotFinalIndex]} is locked.` });
      return pivotFinalIndex;
    };

    const stack = [[0, arr.length - 1]];
    animationSteps.push({ type: 'stack-update', stack: [...stack], arrayState: [...workingArr], message: 'Starting with the full array range.' });

    while (stack.length > 0) {
      const [low, high] = stack.pop();
      animationSteps.push({ type: 'stack-pop', range: [low, high], stack: [...stack], arrayState: [...workingArr], message: `Popped [${low}, ${high}] from stack to partition.` });

      if (low < high) {
        const pi = partition(low, high);
        
        // Push left and right sub-arrays to stack
        const left = [low, pi - 1];
        const right = [pi + 1, high];
        
        // Push smaller partition first for better performance on average
        if (left[1] - left[0] < right[1] - right[0]) {
            if(right[0] <= right[1]) stack.push(right);
            if(left[0] <= left[1]) stack.push(left);
        } else {
            if(left[0] <= left[1]) stack.push(left);
            if(right[0] <= right[1]) stack.push(right);
        }

        animationSteps.push({ type: 'stack-push', stack: [...stack], arrayState: [...workingArr], message: `Pushing new sub-arrays to stack for future partitioning.` });
      }
    }
    
    animationSteps.push({ type: 'done', arrayState: [...workingArr], message: 'Array is fully sorted!', stack: [] });
    setSteps(animationSteps);
  }, []);

  const processStep = useCallback((step) => {
    if (!step) return;
    setMessage(step.message);
    setStats(step.stats);
    setHighlightedLine(step.line || null);
    setArray(step.arrayState);
    setRecursionStack(step.stack || []);
    setSwappedIndices([]);

    switch (step.type) {
      case 'start-partition': setPartitionRange({ start: step.range[0], end: step.range[1] }); break;
      case 'select-pivot': setPivotIndex(step.pivotIndex); setPointers(step.pointers); break;
      case 'compare': setPointers(step.pointers); setPivotIndex(step.pivotIndex); break;
      case 'swap': case 'place-pivot':
        setSwappedIndices(step.indices);
        setPointers(step.pointers || { i: step.indices[0], j: step.indices[1] });
        break;
      case 'lock-pivot':
        setSortedIndices(prev => [...prev, step.index]);
        setPivotIndex(null);
        setPointers({ i: null, j: null });
        setPartitionRange(null);
        break;
      case 'done':
        setSortedIndices(Array.from({length: array.length}, (_, i) => i));
        setIsSorting(false); setIsPaused(false); setPartitionRange(null); setPivotIndex(null);
        break;
      default: break;
    }
  }, [array.length]);
  
  const runAnimation = useCallback(() => {
    if (currentStep >= steps.length || isPaused) { if (currentStep >= steps.length) setIsSorting(false); return; }
    timeoutRef.current = setTimeout(() => { processStep(steps[currentStep]); setCurrentStep(prev => prev + 1); }, animationSpeed);
  }, [currentStep, steps, isPaused, animationSpeed, processStep]);

  useEffect(() => { if (isSorting && !isPaused) runAnimation(); return () => clearTimeout(timeoutRef.current); }, [isSorting, isPaused, runAnimation]);

  const resetVisuals = useCallback(() => { clearTimeout(timeoutRef.current); setIsSorting(false); setIsPaused(false); setCurrentStep(0); setSteps([]); setPointers({}); setSortedIndices([]); setSwappedIndices([]); setStats({ comparisons: 0, swaps: 0 }); setMessage('Ready to sort!'); setHighlightedLine(null); setPivotIndex(null); setPartitionRange(null); setRecursionStack([]); }, []);
  const handleStart = () => { resetVisuals(); generateSteps(array); setIsSorting(true); setIsPaused(false); setTimeout(() => { processStep(steps[0]); setCurrentStep(1); }, 50); };
  const handlePauseResume = () => setIsPaused(!isPaused);
  const handleReset = () => { resetVisuals(); setArray(arrayInput.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)) || generateRandomArray()); };
  const handleSetArray = () => { resetVisuals(); let newArr = arrayInput.split(',').map(s=>Number(s.trim())).filter(n=>!isNaN(n)); if(newArr.length===0){setArrayMessage('❌ Invalid input.');return;} if(newArr.length>MAX_ARRAY_SIZE){setArrayMessage(`❌ Max size is ${MAX_ARRAY_SIZE}.`);return;} setArray(newArr); setArrayMessage('✅ Array set!'); };
  const handleRandomize = () => { resetVisuals(); const newArr = generateRandomArray(); setArray(newArr); setArrayInput(newArr.join(', ')); };
  
  const codeString = `function quickSort(arr, low, high) {
  if (low < high) {
    // pi is partitioning index
    let pi = partition(arr, low, high);
    // Recursively sort elements before and after
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <header className="text-center mb-6"><h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 tracking-tight">Quick Sort Visualizer</h1><p className="text-gray-500">Understand the 'divide and conquer' strategy with a live view of the recursion stack.</p></header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-md border">
          <div><label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><ListPlus size={16}/> Your Array (max {MAX_ARRAY_SIZE})</label><div className="flex gap-2"><input value={arrayInput} onChange={(e) => setArrayInput(e.target.value)} disabled={isSorting} className="input input-bordered w-full disabled:bg-gray-200"/><button onClick={handleSetArray} disabled={isSorting} className="btn btn-primary">Set</button></div><button onClick={handleRandomize} disabled={isSorting} className="btn btn-ghost btn-sm text-primary mt-2 flex items-center gap-2"><Shuffle size={16}/> Randomize</button>{arrayMessage && <p className="text-sm text-blue-600 mt-2">{arrayMessage}</p>}</div>
          <div><div className="mb-1 flex justify-between items-center"><label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Zap size={16}/> Speed</label><span className="text-sm font-mono text-gray-500">{animationSpeed}ms</span></div><input type="range" min="50" max="1000" step="25" value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))} disabled={isSorting} className="range range-primary range-sm" /></div>
        </div>
        
        <div className="flex justify-center items-center gap-4 mb-4">
          <button className="btn btn-primary btn-lg shadow-md" onClick={handleStart} disabled={isSorting}><Play className="mr-2"/> Start</button>
          <button className="btn btn-secondary btn-lg shadow-md" onClick={handlePauseResume} disabled={!isSorting}>{isPaused ? <Play className="mr-2"/> : <Pause className="mr-2"/>} {isPaused ? 'Resume' : 'Pause'}</button>
          <button className="btn btn-ghost btn-lg text-red-600" onClick={handleReset}><RotateCcw className="mr-2"/> Reset</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center h-auto md:h-14 items-center p-3 mb-6 bg-gray-100 rounded-md">
           <p className="font-medium text-gray-700 md:col-span-2 md:text-left">{message}</p>
           <div className="flex justify-center md:justify-end gap-6 font-mono text-sm"><span>Comparisons: <strong className="text-blue-600">{stats?.comparisons}</strong></span><span>Swaps: <strong className="text-red-600">{stats?.swaps}</strong></span></div>
        </div>

        <div className="w-full bg-white p-4 rounded-lg border border-gray-200">
            <div className="mb-4 p-3 bg-gray-800 text-white rounded-lg shadow"><h3 className="text-lg font-bold mb-2 flex items-center gap-2"><Layers size={18}/> Recursion Stack</h3><div className="flex flex-wrap gap-2 min-h-[2.5rem] items-center">{recursionStack.map((r, i) => <AnimatePresence key={i}><motion.div initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.5}} className="bg-gray-600 px-3 py-1 rounded-md text-sm font-mono">[{r[0]}, {r[1]}]</motion.div></AnimatePresence>)}{recursionStack.length === 0 && <span className="text-gray-400 text-sm">Empty</span>}</div></div>
            <div className="flex items-end justify-center gap-1" style={{ minHeight: `${MAX_VALUE + 20}px` }}>{array.map((value, index) => { const isSwapping=swappedIndices.includes(index),isSorted=sortedIndices.includes(index),isPivot=pivotIndex===index; let bgColor='bg-gray-400'; if(partitionRange && index >= partitionRange.start && index <= partitionRange.end) bgColor = 'bg-sky-500'; if(isPivot) bgColor = 'bg-purple-500'; if(isSwapping)bgColor='bg-red-500'; if(isSorted)bgColor='bg-green-500'; return (<div key={index} className="relative flex-grow flex flex-col-reverse items-center" style={{minWidth:'0.5rem'}}><motion.div layout transition={{type:'spring',stiffness:300,damping:30}} className={`${bgColor} w-full rounded-t-md`} style={{height:`${value}px`}} /><div className="absolute -top-6 w-full text-center text-xs font-bold">{pointers.i===index&&<span className="text-blue-600">i</span>}{pointers.j===index&&<span className="text-orange-600 ml-1">j</span>}</div></div>); })}</div>
            <div className="flex items-start justify-center gap-1 mt-1"> {array.map((value, index) => { const isSwapping=swappedIndices.includes(index),isSorted=sortedIndices.includes(index),isPivot=pivotIndex===index; let bgColor = 'bg-gray-200 text-gray-800'; if(partitionRange && index >= partitionRange.start && index <= partitionRange.end)bgColor = 'bg-sky-200 text-sky-800'; if(isPivot)bgColor = 'bg-purple-500 text-white'; if(isSwapping)bgColor = 'bg-red-400 text-white'; if(isSorted)bgColor = 'bg-green-500 text-white'; return (<div key={index} className={`h-8 flex-grow flex items-center justify-center rounded-md text-xs font-bold shadow-sm transition-colors duration-300 ${bgColor}`} style={{ minWidth: '0.5rem' }}>{value}</div>); })}</div>
            <div className="relative h-8 mt-2">{partitionRange && <motion.div layout initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}} className="absolute top-0 h-full border-t-2 border-x-2 border-sky-500 rounded-t-lg" style={{left:`calc(${(100 / array.length) * partitionRange.start}% + 2px)`,width:`calc(${(100 / array.length) * (partitionRange.end - partitionRange.start + 1)}% - 4px)`}}><div className="text-center text-xs text-sky-600 font-semibold pt-1">Partitioning</div></motion.div>}</div>

            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-4 border-t pt-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-500"></div><span>Pivot</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500"></div><span>Pointer 'i'</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-orange-500"></div><span>Pointer 'j'</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-sky-500"></div><span>Active Partition</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500"></div><span>Swapping</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span>Sorted</span></div>
            </div>
        </div>

        <div className="my-8"><details className="bg-gray-800 rounded-lg overflow-hidden group"><summary className="p-4 text-white font-medium cursor-pointer flex items-center gap-2 group-hover:bg-gray-700 transition-colors"><Code size={18}/> View Algorithm Code</summary><div className="relative"><SyntaxHighlighter language="javascript" style={oneDark} showLineNumbers wrapLines={true}>{codeString}</SyntaxHighlighter></div></details></div>
      </div>
    </div>
  );
};

export default QuickSortVisualizer;