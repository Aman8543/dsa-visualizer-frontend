import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, ListPlus, Shuffle, Code, ChevronsRight } from 'lucide-react';
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
const BubbleSortVisualizer = () => {
  // --- State Management ---
  const [array, setArray] = useState(generateRandomArray());
  const [arrayInput, setArrayInput] = useState(array.join(', '));
  const [arrayMessage, setArrayMessage] = useState('');

  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(250);

  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  // State for visual elements
  const [pointers, setPointers] = useState({ i: null, j: null });
  const [sortedIndices, setSortedIndices] = useState([]);
  const [swappedIndices, setSwappedIndices] = useState([]);
  const [message, setMessage] = useState('Ready to sort!');
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0 });
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [traversalRange, setTraversalRange] = useState(null); // { pass: number, end: number }

  // --- Refs ---
  const timeoutRef = useRef(null);

  // --- Core Algorithm: Step Generation ---
  const generateSteps = useCallback((arr) => {
    const animationSteps = [];
    const workingArr = [...arr];
    let n = workingArr.length;
    let comparisons = 0;
    let swaps = 0;

    for (let i = 0; i < n - 1; i++) {
      let swappedInPass = false;
      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        animationSteps.push({
          type: 'compare',
          indices: [j, j + 1],
          arrayState: [...workingArr],
          message: `Pass ${i + 1}: Comparing ${workingArr[j]} and ${workingArr[j+1]}.`,
          stats: { comparisons, swaps },
          line: 5,
          passIndex: i,
        });

        if (workingArr[j] > workingArr[j + 1]) {
          swaps++;
          swappedInPass = true;
          animationSteps.push({
            type: 'swap',
            indices: [j, j + 1],
            arrayState: [...workingArr], // State *before* the swap for visualization
            message: `${workingArr[j]} > ${workingArr[j+1]}. Swapping.`,
            stats: { comparisons, swaps },
            line: 7,
            passIndex: i,
          });
          [workingArr[j], workingArr[j + 1]] = [workingArr[j + 1], workingArr[j]];
        }
      }
      animationSteps.push({
        type: 'lock',
        index: n - 1 - i,
        arrayState: [...workingArr],
        message: `${workingArr[n - 1 - i]} is now in its final sorted position.`,
        stats: { comparisons, swaps },
        line: 9,
        passIndex: i,
      });

      if (!swappedInPass) {
          animationSteps.push({
              type: 'optimized-exit',
              arrayState: [...workingArr],
              message: 'Optimization: No swaps in this pass. Array is sorted!',
              stats: { comparisons, swaps },
              line: 11
          });
          break;
      }
    }
    
    animationSteps.push({
        type: 'done',
        arrayState: [...workingArr],
        message: 'Array is fully sorted!',
        stats: { comparisons, swaps },
        line: null
    });

    setSteps(animationSteps);
    return animationSteps.length;
  }, []);

  // --- Animation Control ---
  const processStep = useCallback((step) => {
    if (!step) return;

    setArray(step.arrayState);
    setMessage(step.message);
    setStats(step.stats);
    setHighlightedLine(step.line);
    setSwappedIndices([]);

    if (step.passIndex !== undefined && array.length > 0) {
        setTraversalRange({ pass: step.passIndex, end: array.length - step.passIndex - 1 });
    }

    switch (step.type) {
      case 'compare':
        setPointers({ j: step.indices[0], i: step.indices[1] });
        break;
      case 'swap':
        setPointers({ j: step.indices[0], i: step.indices[1] });
        setSwappedIndices(step.indices);
        // We apply the swapped array state in the next step to show the animation
        const nextStepIndex = currentStep; // currentStep is already advanced by runAnimation
        if (steps[nextStepIndex]) {
           setArray(steps[nextStepIndex].arrayState)
        }
        break;
      case 'lock':
        setPointers({ j: null, i: null });
        setSortedIndices(prev => [...prev, step.index]);
        break;
      case 'optimized-exit':
      case 'done':
        setPointers({ j: null, i: null });
        setSortedIndices(Array.from({length: array.length}, (_, k) => k));
        setIsSorting(false);
        setIsPaused(false);
        setTraversalRange(null);
        break;
      default:
        break;
    }
  }, [array.length, currentStep, steps]);
  
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
    if (isSorting && !isPaused) {
      runAnimation();
    }
    return () => clearTimeout(timeoutRef.current);
  }, [isSorting, isPaused, runAnimation]);

  // --- UI Handlers ---
  const resetVisuals = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsSorting(false);
    setIsPaused(false);
    setCurrentStep(0);
    setSteps([]);
    setPointers({ i: null, j: null });
    setSortedIndices([]);
    setSwappedIndices([]);
    setStats({ comparisons: 0, swaps: 0 });
    setMessage('Ready to sort!');
    setHighlightedLine(null);
    setTraversalRange(null);
  }, []);

  const handleStart = () => {
    resetVisuals();
    setSortedIndices([]); // Clear sorted on new start
    const len = generateSteps(array);
    if (len > 0) {
      setIsSorting(true);
      setIsPaused(false);
      setCurrentStep(0);
      setTimeout(() => {
        processStep(steps[0]);
        setCurrentStep(1);
      }, 50);
    }
  };

  const handlePauseResume = () => setIsPaused(!isPaused);
  
  const handleReset = () => {
    resetVisuals();
    const newArr = arrayInput.split(',').map(s => s.trim()).filter(s => !isNaN(s) && s !== '').map(Number);
    setArray(newArr.length > 0 ? newArr : generateRandomArray());
  };
  
  const handleSetArray = () => {
    resetVisuals();
    setArrayMessage('');
    let newArr = arrayInput.split(',').map(s => s.trim()).filter(s => s !== '').map(Number).filter(n => !isNaN(n));
    if (newArr.length === 0) { setArrayMessage('❌ Invalid input.'); return; }
    if (newArr.length > MAX_ARRAY_SIZE) { setArrayMessage(`❌ Max array size is ${MAX_ARRAY_SIZE}.`); return; }
    setArray(newArr);
    setArrayMessage('✅ New array set!');
  };
  
  const handleRandomize = () => {
    resetVisuals();
    const newArr = generateRandomArray();
    setArray(newArr);
    setArrayInput(newArr.join(', '));
    setArrayMessage('');
  };

  const codeString = `function bubbleSort(arr) {
  let n = arr.length;
  // Outer loop for each pass
  for (let i = 0; i < n - 1; i++) {
    // Inner loop for comparisons
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
      }
    }
    // Optimization: if no swaps, array is sorted
    if (!swappedInPass) break; 
  }
  return arr;
}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 tracking-tight">Bubble Sort Visualizer</h1>
          <p className="text-gray-500">Watch how Bubble Sort works by "bubbling" the largest elements to the end of the array.</p>
        </header>

        {/* --- Configuration --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-md border">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <ListPlus size={16}/> Your Array (max {MAX_ARRAY_SIZE})
            </label>
            <div className="flex gap-2">
              <input value={arrayInput} onChange={(e) => setArrayInput(e.target.value)} disabled={isSorting} className="input input-bordered w-full disabled:bg-gray-200 disabled:text-gray-500"/>
              <button onClick={handleSetArray} disabled={isSorting} className="btn btn-primary">Set</button>
            </div>
             <button onClick={handleRandomize} disabled={isSorting} className="btn btn-ghost btn-sm text-primary mt-2 flex items-center gap-2">
                <Shuffle size={16}/> Randomize
            </button>
            {arrayMessage && <p className="text-sm text-blue-600 mt-2">{arrayMessage}</p>}
          </div>

          <div>
             <div className="mb-1 flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2"><Zap size={16}/> Animation Speed</label>
                <span className="text-sm font-mono text-gray-500">{animationSpeed}ms</span>
             </div>
             <input type="range" min="50" max="1000" step="50" value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))} disabled={isSorting} className="range range-primary range-sm" />
          </div>
        </div>
        
        {/* --- Action Buttons --- */}
        <div className="flex justify-center items-center gap-4 mb-4">
            <button className="btn btn-primary btn-lg shadow-md" onClick={handleStart} disabled={isSorting}>
              <Play className="mr-2" /> Start
            </button>
            <button className="btn btn-secondary btn-lg shadow-md" onClick={handlePauseResume} disabled={!isSorting}>
              {isPaused ? <Play className="mr-2"/> : <Pause className="mr-2" />} {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button className="btn btn-ghost btn-lg text-red-600" onClick={handleReset}>
                <RotateCcw className="mr-2"/> Reset
            </button>
        </div>
        
        {/* --- Status & Stats Bar --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center h-auto md:h-14 items-center p-3 mb-6 bg-gray-100 rounded-md">
           <p className="font-medium text-gray-700 md:col-span-2 md:text-left">{message}</p>
           <div className="flex justify-center md:justify-end gap-6 font-mono text-sm">
             <span>Comparisons: <strong className="text-blue-600">{stats.comparisons}</strong></span>
             <span>Swaps: <strong className="text-red-600">{stats.swaps}</strong></span>
           </div>
        </div>

        {/* --- Visualization Area --- */}
        <div className="w-full bg-white p-4 rounded-lg border border-gray-200">
            {/* --- BARS --- */}
            <div className="flex items-end justify-center gap-1" style={{ minHeight: `${MAX_VALUE * 2 + 20}px` }}>
                {array.map((value, index) => {
                    const isComparing = pointers.i === index || pointers.j === index;
                    const isSwapping = swappedIndices.includes(index);
                    const isSorted = sortedIndices.includes(index);
                    let bgColor = 'bg-sky-500';
                    if (isSwapping) bgColor = 'bg-red-500'; else if (isComparing) bgColor = 'bg-yellow-500'; if (isSorted) bgColor = 'bg-green-500';
                    return ( <motion.div key={index} layout transition={{ type: 'spring', stiffness: 300, damping: 30 }} className={`relative flex-grow ${bgColor} rounded-t-md shadow-md`} style={{ height: `${value * 2}px`, minWidth: '1rem' }} /> );
                })}
            </div>
            {/* --- NUMBERS --- */}
            <div className="flex items-start justify-center gap-1 mt-2">
                {array.map((value, index) => {
                    const isComparing = pointers.i === index || pointers.j === index;
                    const isSwapping = swappedIndices.includes(index);
                    const isSorted = sortedIndices.includes(index);
                    let bgColor = 'bg-gray-200'; let textColor = 'text-gray-700';
                    if (isSwapping) { bgColor = 'bg-red-500'; textColor = 'text-white'; } 
                    else if (isComparing) { bgColor = 'bg-yellow-500'; textColor = 'text-black'; } 
                    if (isSorted) { bgColor = 'bg-green-500'; textColor = 'text-white'; }
                    return (<div key={index} className={`flex-grow ${bgColor} ${textColor} text-xs font-bold rounded-md shadow-sm flex items-center justify-center transition-colors duration-300`} style={{ height: '2rem', minWidth: '1rem' }}>{value}</div>);
                })}
            </div>

             {/* --- TRAVERSAL INDICATOR --- */}
            <div className="relative h-12 mt-2">
                <AnimatePresence>
                {traversalRange && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-0 h-full"
                        style={{
                            left: `calc(${(100 / array.length) * 0}% + ${0 * 4}px)`,
                            width: `calc(${(100 / array.length) * (traversalRange.end + 1)}% - 4px)`
                        }}
                    >
                        <div className="w-full h-full border-t-2 border-x-2 border-blue-500 rounded-t-lg flex items-center justify-center p-1">
                           <div className="text-blue-600 text-xs sm:text-sm font-semibold text-center whitespace-nowrap flex items-center gap-1">
                                <ChevronsRight size={16}/>
                                Pass {traversalRange.pass + 1}: Checking indices 0 to {traversalRange.end -1}
                           </div>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
            
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-4 border-t pt-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-500"></div><span>Comparing</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500"></div><span>Swapping</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span>Sorted</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-sky-500"></div><span>Unsorted</span></div>
            </div>
        </div>

        {/* --- Code Block --- */}
        <div className="my-8">
            <details className="bg-gray-800 rounded-lg overflow-hidden group">
                <summary className="p-4 text-white font-medium cursor-pointer flex items-center gap-2 group-hover:bg-gray-700 transition-colors"> <Code size={18}/> View Algorithm Code </summary>
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

export default BubbleSortVisualizer;