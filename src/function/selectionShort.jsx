import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, ListPlus, Shuffle, Code, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MAX_ARRAY_SIZE = 20;
const MAX_VALUE = 100;

// --- Helper to generate a random array ---
const generateRandomArray = () => {
  const newArray = [];
  const size = Math.floor(Math.random() * 11) + 10; // Random size between 10 and 20
  for (let i = 0; i < size; i++) {
    newArray.push(Math.floor(Math.random() * (MAX_VALUE - 5)) + 5); // Numbers between 5 and 100
  }
  return newArray;
};

// --- The Main Visualizer Component ---
const SelectionSortVisualizer = () => {
  // --- State Management ---
  const [array, setArray] = useState(generateRandomArray());
  const [arrayInput, setArrayInput] = useState(array.join(', '));
  const [arrayMessage, setArrayMessage] = useState('');

  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(150);

  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [pointers, setPointers] = useState({ i: null, j: null, minIndex: null });
  const [sortedIndices, setSortedIndices] = useState([]);
  const [swappedIndices, setSwappedIndices] = useState([]);
  const [message, setMessage] = useState('Ready to sort!');
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0 });
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [scanRange, setScanRange] = useState(null); // NEW: {start, end}

  const timeoutRef = useRef(null);

  // --- Core Algorithm: Step Generation ---
  const generateSteps = useCallback((arr) => {
    const animationSteps = [];
    const workingArr = [...arr];
    const n = workingArr.length;
    let comparisons = 0, swaps = 0;

    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;
      const currentScanRange = { start: i + 1, end: n - 1 };

      animationSteps.push({
        type: 'start-pass',
        i, minIndex, j: i + 1,
        arrayState: [...workingArr],
        message: `Pass ${i + 1}: Find minimum in indices ${i+1} to ${n-1}.`,
        stats: { comparisons, swaps }, line: 4, scanRange: currentScanRange
      });

      for (let j = i + 1; j < n; j++) {
        comparisons++;
        animationSteps.push({
          type: 'compare',
          i, j, minIndex,
          arrayState: [...workingArr],
          message: `Comparing scanner value ${workingArr[j]} with current minimum ${workingArr[minIndex]}.`,
          stats: { comparisons, swaps }, line: 6, scanRange: currentScanRange
        });

        if (workingArr[j] < workingArr[minIndex]) {
          minIndex = j;
          animationSteps.push({
            type: 'update-min',
            i, j, minIndex,
            arrayState: [...workingArr],
            message: `Found new minimum: ${workingArr[j]}.`,
            stats: { comparisons, swaps }, line: 8, scanRange: currentScanRange
          });
        }
      }
      
      if (minIndex !== i) {
        swaps++;
        animationSteps.push({
          type: 'swap',
          indices: [i, minIndex],
          arrayState: [...workingArr],
          message: `Swapping pass start ${workingArr[i]} with found minimum ${workingArr[minIndex]}.`,
          stats: { comparisons, swaps }, line: 11, scanRange: currentScanRange
        });
        [workingArr[i], workingArr[minIndex]] = [workingArr[minIndex], workingArr[i]];
      }

      animationSteps.push({
        type: 'lock',
        index: i,
        arrayState: [...workingArr],
        message: `${workingArr[i]} is now sorted.`,
        stats: { comparisons, swaps }, line: 13, scanRange: currentScanRange
      });
    }

    animationSteps.push({ type: 'lock', index: n - 1, arrayState: [...workingArr], message: 'Array is fully sorted!', stats: { comparisons, swaps }, line: null, scanRange: null });
    
    setSteps(animationSteps);
  }, []);

  // --- Animation Control ---
  const processStep = useCallback((step) => {
    if (!step) return;

    setArray(step.arrayState);
    setMessage(step.message);
    setStats(step.stats);
    setHighlightedLine(step.line);
    setSwappedIndices([]);
    setScanRange(step.scanRange || null);

    switch (step.type) {
      case 'start-pass':
      case 'compare':
      case 'update-min':
        setPointers({ i: step.i, j: step.j, minIndex: step.minIndex });
        break;
      case 'swap':
        setPointers({ i: step.indices[0], j: null, minIndex: step.indices[1] });
        setSwappedIndices(step.indices);
        const nextStep = steps[currentStep];
        if(nextStep) setArray(nextStep.arrayState);
        break;
      case 'lock':
        if(step.index === array.length - 1) { // Final step
            setIsSorting(false);
            setIsPaused(false);
            setPointers({ i: null, j: null, minIndex: null });
        } else {
            setPointers({ i: step.index, j: null, minIndex: null });
        }
        setSortedIndices(prev => [...prev, step.index]);
        break;
      default:
        break;
    }
  }, [array.length, steps, currentStep]);
  
  const runAnimation = useCallback(() => {
    if (currentStep >= steps.length || isPaused) {
      if (currentStep >= steps.length) setIsSorting(false);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      processStep(steps[currentStep]);
      setCurrentStep(prev => prev + 1);
    }, animationSpeed);
  }, [currentStep, steps, isPaused, animationSpeed, processStep]);

  useEffect(() => {
    if (isSorting && !isPaused) runAnimation();
    return () => clearTimeout(timeoutRef.current);
  }, [isSorting, isPaused, runAnimation]);

  // --- UI Handlers ---
  const resetVisuals = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsSorting(false);
    setIsPaused(false);
    setCurrentStep(0);
    setSteps([]);
    setPointers({ i: null, j: null, minIndex: null });
    setSortedIndices([]);
    setSwappedIndices([]);
    setStats({ comparisons: 0, swaps: 0 });
    setMessage('Ready to sort!');
    setHighlightedLine(null);
    setScanRange(null);
  }, []);

  const handleStart = () => {
    resetVisuals();
    generateSteps(array);
    setIsSorting(true);
    setIsPaused(false);
    setCurrentStep(0);
    setTimeout(() => {
      processStep(steps[0]);
      setCurrentStep(1);
    }, 50);
  };

  const handlePauseResume = () => setIsPaused(!isPaused);
  const handleReset = () => { resetVisuals(); setArray(arrayInput.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)) || generateRandomArray()); };
  const handleSetArray = () => { resetVisuals(); let newArr = arrayInput.split(',').map(s=>Number(s.trim())).filter(n=>!isNaN(n)); if(newArr.length===0){setArrayMessage('❌ Invalid input.');return;} if(newArr.length>MAX_ARRAY_SIZE){setArrayMessage(`❌ Max size is ${MAX_ARRAY_SIZE}.`);return;} setArray(newArr); setArrayMessage('✅ Array set!'); };
  const handleRandomize = () => { resetVisuals(); const newArr = generateRandomArray(); setArray(newArr); setArrayInput(newArr.join(', ')); };
  
  const codeString = `function selectionSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    // Assume the minimum is the first element
    let minIndex = i;
    // Iterate through the rest of the array
    for (let j = i + 1; j < n; j++) {
      // If we find a new minimum
      if (arr[j] < arr[minIndex]) {
        // Update the index of the new minimum
        minIndex = j;
      }
    }
    // Swap if the minimum isn't the starting one
    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
  }
  return arr;
}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 tracking-tight">Selection Sort Visualizer</h1>
          <p className="text-gray-500">See how Selection Sort works by repeatedly finding the minimum element and moving it to the sorted part.</p>
        </header>

        {/* --- Configuration & Controls --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-md border">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><ListPlus size={16}/> Your Array (max {MAX_ARRAY_SIZE})</label>
            <div className="flex gap-2"><input value={arrayInput} onChange={(e) => setArrayInput(e.target.value)} disabled={isSorting} className="input input-bordered w-full disabled:bg-gray-200"/><button onClick={handleSetArray} disabled={isSorting} className="btn btn-primary">Set</button></div>
            <button onClick={handleRandomize} disabled={isSorting} className="btn btn-ghost btn-sm text-primary mt-2 flex items-center gap-2"><Shuffle size={16}/> Randomize</button>
            {arrayMessage && <p className="text-sm text-blue-600 mt-2">{arrayMessage}</p>}
          </div>
          <div>
            <div className="mb-1 flex justify-between items-center"><label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Zap size={16}/> Speed</label><span className="text-sm font-mono text-gray-500">{animationSpeed}ms</span></div>
            <input type="range" min="20" max="500" step="10" value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))} disabled={isSorting} className="range range-primary range-sm" />
          </div>
        </div>
        
        <div className="flex justify-center items-center gap-4 mb-4">
            <button className="btn btn-primary btn-lg shadow-md" onClick={handleStart} disabled={isSorting}><Play className="mr-2"/> Start</button>
            <button className="btn btn-secondary btn-lg shadow-md" onClick={handlePauseResume} disabled={!isSorting}>{isPaused ? <Play className="mr-2"/> : <Pause className="mr-2"/>} {isPaused ? 'Resume' : 'Pause'}</button>
            <button className="btn btn-ghost btn-lg text-red-600" onClick={handleReset}><RotateCcw className="mr-2"/> Reset</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center h-auto md:h-14 items-center p-3 mb-6 bg-gray-100 rounded-md">
           <p className="font-medium text-gray-700 md:col-span-2 md:text-left">{message}</p>
           <div className="flex justify-center md:justify-end gap-6 font-mono text-sm"><span>Comparisons: <strong className="text-blue-600">{stats.comparisons}</strong></span><span>Swaps: <strong className="text-red-600">{stats.swaps}</strong></span></div>
        </div>

        {/* --- Visualization Area --- */}
        <div className="w-full bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-end justify-center gap-1" style={{ minHeight: `${MAX_VALUE * 2 + 20}px` }}>
                {array.map((value, index) => {
                    const isSorted = sortedIndices.includes(index), isSwapping = swappedIndices.includes(index), isMin = pointers.minIndex === index, isComparing = pointers.j === index, isBoundary = pointers.i === index;
                    let bgColor = 'bg-sky-500'; if (isSwapping) bgColor = 'bg-red-500'; else if (isMin) bgColor = 'bg-purple-500'; else if (isComparing) bgColor = 'bg-yellow-500'; else if (isBoundary) bgColor = 'bg-blue-500'; if (isSorted) bgColor = 'bg-green-500';
                    return (<motion.div key={index} layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} className={`relative flex-grow ${bgColor} rounded-t-md shadow-md`} style={{ height: `${value * 2}px`, minWidth: '1rem' }} />);
                })}
            </div>
            <div className="flex items-start justify-center gap-1 mt-2">
                {array.map((value, index) => {
                    const isSorted = sortedIndices.includes(index), isSwapping = swappedIndices.includes(index), isMin = pointers.minIndex === index, isComparing = pointers.j === index, isBoundary = pointers.i === index;
                    let bgColor = 'bg-gray-200', textColor = 'text-gray-700'; if (isSwapping) { bgColor = 'bg-red-500'; textColor = 'text-white'; } else if (isMin) { bgColor = 'bg-purple-500'; textColor = 'text-white'; } else if (isComparing) { bgColor = 'bg-yellow-500'; textColor = 'text-black'; } else if (isBoundary) { bgColor = 'bg-blue-500'; textColor = 'text-white'; } if (isSorted) { bgColor = 'bg-green-500'; textColor = 'text-white'; }
                    return (<div key={index} className={`flex-grow ${bgColor} ${textColor} text-xs font-bold rounded-md shadow-sm flex items-center justify-center transition-colors duration-300`} style={{ height: '2rem', minWidth: '1rem' }}>{value}</div>);
                })}
            </div>

            <div className="relative h-12 mt-2">
                <AnimatePresence>
                {scanRange && scanRange.start <= scanRange.end && (
                    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute top-0 h-full"
                        style={{
                            left: `calc(${(100 / array.length) * scanRange.start}% + ${scanRange.start * 4}px)`,
                            width: `calc(${(100 / array.length) * (scanRange.end - scanRange.start + 1)}% - 4px)`
                        }}>
                        <div className="w-full h-full border-t-2 border-x-2 border-purple-500 rounded-t-lg flex items-center justify-center p-1">
                           <div className="text-purple-600 text-xs sm:text-sm font-semibold text-center whitespace-nowrap flex items-center gap-1"><Target size={16}/><span>Scan for minimum</span></div>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
            
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-4 border-t pt-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500"></div><span>Pass Boundary (i)</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-500"></div><span>Scanner (j)</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-500"></div><span>Current Minimum</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-purple-500"></div><span>Scan Range</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500"></div><span>Swapping</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span>Sorted</span></div>
            </div>
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

export default SelectionSortVisualizer;