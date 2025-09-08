import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, ListPlus, Shuffle, Code, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MAX_ARRAY_SIZE = 20;
const MAX_VALUE = 100;

// --- Helper to generate a random array ---
const generateRandomArray = () => {
  const newArray = [];
  const size = Math.floor(Math.random() * 11) + 10;
  for (let i = 0; i < size; i++) {
    newArray.push(Math.floor(Math.random() * (MAX_VALUE - 5)) + 5);
  }
  return newArray;
};

// --- The Main Visualizer Component ---
const InsertionSortVisualizer = () => {
  // --- State Management ---
  const [array, setArray] = useState(generateRandomArray());
  const [arrayInput, setArrayInput] = useState(array.join(', '));
  const [arrayMessage, setArrayMessage] = useState('');

  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(250);

  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [pointers, setPointers] = useState({ i: null, j: null });
  const [keyElement, setKeyElement] = useState(null);
  const [holeIndex, setHoleIndex] = useState(null);
  const [message, setMessage] = useState('Ready to sort!');
  const [stats, setStats] = useState({ comparisons: 0, shifts: 0 });
  const [highlightedLine, setHighlightedLine] = useState(null);
  const [sortedRangeEnd, setSortedRangeEnd] = useState(null); // NEW

  const timeoutRef = useRef(null);

  // --- Core Algorithm: Step Generation ---
  const generateSteps = useCallback((arr) => {
    const animationSteps = [];
    const workingArr = [...arr];
    let n = workingArr.length;
    let comparisons = 0, shifts = 0;

    // Start with the first element considered sorted
    animationSteps.push({ type: 'initial', arrayState: [...arr], sortedSubarrayEnd: 0, message: "The first element is considered a sorted subarray of size 1."});

    for (let i = 1; i < n; i++) {
      let key = workingArr[i];
      let j = i - 1;

      animationSteps.push({
        type: 'take-key', i, j, key,
        arrayState: [...workingArr],
        message: `Picking up element ${key} to insert into the sorted part.`,
        stats: { comparisons, shifts }, line: 4, sortedSubarrayEnd: i,
      });

      while (j >= 0 && workingArr[j] > key) {
        comparisons++;
        animationSteps.push({
          type: 'compare', i, j, key,
          arrayState: [...workingArr],
          message: `Comparing key ${key} with ${workingArr[j]}.`,
          stats: { comparisons, shifts }, line: 7, sortedSubarrayEnd: i,
        });
        
        shifts++;
        workingArr[j + 1] = workingArr[j];
        animationSteps.push({
          type: 'shift', i, j, key,
          arrayState: [...workingArr],
          message: `${workingArr[j]} > ${key}. Shifting ${workingArr[j]} to the right.`,
          stats: { comparisons, shifts }, line: 8, sortedSubarrayEnd: i,
        });
        j = j - 1;
      }
      if (j >= 0) comparisons++; // Final failed comparison

      workingArr[j + 1] = key;
      animationSteps.push({
        type: 'insert', i, j: j + 1, key,
        arrayState: [...workingArr],
        message: `Inserting key ${key} into its sorted position.`,
        stats: { comparisons, shifts }, line: 11, sortedSubarrayEnd: i,
      });
    }
    animationSteps.push({ type: 'done', arrayState: [...workingArr], message: 'Array is fully sorted!', stats: { comparisons, shifts }, sortedSubarrayEnd: n-1 });
    setSteps(animationSteps);
  }, []);

  // --- Animation Control ---
  const processStep = useCallback((step) => {
    if (!step) return;
    setMessage(step.message);
    setStats(step.stats);
    setHighlightedLine(step.line);
    setSortedRangeEnd(step.sortedSubarrayEnd);

    switch (step.type) {
      case 'initial':
        setArray(step.arrayState);
        break;
      case 'take-key':
        setArray(step.arrayState);
        setPointers({ i: step.i, j: step.j });
        setKeyElement({ value: step.key, index: step.i });
        setHoleIndex(step.i);
        break;
      case 'compare':
        setArray(step.arrayState);
        setPointers({ i: step.i, j: step.j });
        break;
      case 'shift':
        setArray(step.arrayState);
        setPointers({ i: step.i, j: step.j - 1 });
        setHoleIndex(step.j);
        break;
      case 'insert':
        setArray(step.arrayState);
        setPointers({ i: step.i, j: null });
        setKeyElement(null);
        setHoleIndex(null);
        break;
      case 'done':
        setArray(step.arrayState);
        setIsSorting(false);
        setIsPaused(false);
        setPointers({ i: null, j: null });
        setKeyElement(null);
        setHoleIndex(null);
        break;
      default:
        break;
    }
  }, []);
  
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
    setPointers({ i: null, j: null });
    setKeyElement(null);
    setHoleIndex(null);
    setStats({ comparisons: 0, shifts: 0 });
    setMessage('Ready to sort!');
    setHighlightedLine(null);
    setSortedRangeEnd(null);
  }, []);

  const handleStart = () => { resetVisuals(); generateSteps(array); setIsSorting(true); setIsPaused(false); setCurrentStep(0); setTimeout(() => { processStep(steps[0]); setCurrentStep(1); }, 50); };
  const handlePauseResume = () => setIsPaused(!isPaused);
  const handleReset = () => { resetVisuals(); setArray(arrayInput.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)) || generateRandomArray()); };
  const handleSetArray = () => { resetVisuals(); let newArr = arrayInput.split(',').map(s=>Number(s.trim())).filter(n=>!isNaN(n)); if(newArr.length===0){setArrayMessage('❌ Invalid input.');return;} if(newArr.length>MAX_ARRAY_SIZE){setArrayMessage(`❌ Max size is ${MAX_ARRAY_SIZE}.`);return;} setArray(newArr); setArrayMessage('✅ Array set!'); };
  const handleRandomize = () => { resetVisuals(); const newArr = generateRandomArray(); setArray(newArr); setArrayInput(newArr.join(', ')); };
  
  const codeString = `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    // 1. Pick the key element to insert
    let key = arr[i];
    let j = i - 1;
    
    // 2. Shift sorted elements to the right
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    // 3. Insert key into its correct position
    arr[j + 1] = key;
  }
  return arr;
}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 tracking-tight">Insertion Sort Visualizer</h1>
          <p className="text-gray-500">Watch how Insertion Sort builds the final sorted array one item at a time.</p>
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
            <input type="range" min="50" max="700" step="10" value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))} disabled={isSorting} className="range range-primary range-sm" />
          </div>
        </div>
        
        <div className="flex justify-center items-center gap-4 mb-4">
          <button className="btn btn-primary btn-lg shadow-md" onClick={handleStart} disabled={isSorting}><Play className="mr-2"/> Start</button>
          <button className="btn btn-secondary btn-lg shadow-md" onClick={handlePauseResume} disabled={!isSorting}>{isPaused ? <Play className="mr-2"/> : <Pause className="mr-2"/>} {isPaused ? 'Resume' : 'Pause'}</button>
          <button className="btn btn-ghost btn-lg text-red-600" onClick={handleReset}><RotateCcw className="mr-2"/> Reset</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center h-auto md:h-14 items-center p-3 mb-6 bg-gray-100 rounded-md">
           <p className="font-medium text-gray-700 md:col-span-2 md:text-left">{message}</p>
           <div className="flex justify-center md:justify-end gap-6 font-mono text-sm text-black"><span>Comparisons: <strong className="text-green-600">{stats.comparisons}</strong></span><span>Shifts: <strong className="text-red-600">{stats.shifts}</strong></span></div>
        </div>

        <div className="w-full bg-white p-4 rounded-lg border border-gray-200">
            <div className="h-28 flex items-center justify-center">
              <AnimatePresence>{keyElement && (<motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="flex flex-col items-center"><div className="text-sm font-bold text-orange-600 mb-1">Key Element</div><div className="w-14 h-14 bg-orange-400 text-black font-bold text-lg rounded-lg shadow-lg flex items-center justify-center">{keyElement.value}</div></motion.div>)}</AnimatePresence>
            </div>
            
            <div className="flex items-end justify-center gap-1" style={{ minHeight: `${MAX_VALUE * 1.5 + 20}px` }}>
                {array.map((value, index) => {
                    const isSorted = index < pointers.i; const isComparing = pointers.j === index;
                    return (<div key={index} className="relative flex-grow" style={{ minWidth: '1rem' }}>
                        <motion.div layout transition={{ type: 'spring', stiffness: 300, damping: 25 }} style={{ opacity: keyElement?.index === index ? 0 : 1 }} className="flex flex-col-reverse items-center">
                          <div className={`w-full ${isComparing ? 'bg-yellow-500' : isSorted ? 'bg-green-500' : 'bg-sky-500'} rounded-t-md shadow-md`} style={{ height: `${value * 1.5}px` }} />
                        </motion.div>
                        {holeIndex === index && <motion.div layoutId="hole" className="absolute bottom-0 w-full h-full bg-gray-200 border-2 border-dashed border-gray-400 rounded-md" />}
                      </div>);
                })}
            </div>
            <div className="flex items-start justify-center gap-1 mt-2">
              {array.map((value, index) => {
                  const isSorted = index < pointers.i; const isComparing = pointers.j === index; const isHole = holeIndex === index;
                  let bgColor = isSorted ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-700'; if(isComparing) bgColor = 'bg-yellow-400 text-black';
                  return (<div key={index} className={`flex-grow ${bgColor} text-xs font-bold rounded-md shadow-sm flex items-center justify-center transition-colors duration-300`} style={{ height: '2rem', minWidth: '1rem' }}><span style={{opacity: isHole ? 0 : 1}}>{value}</span></div>);
              })}
            </div>
            
            <div className="relative h-12 mt-2">
                <AnimatePresence>
                {sortedRangeEnd !== null && (
                    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute top-0 h-full"
                        style={{ left: 0, width: `calc(${(100 / array.length) * (sortedRangeEnd + 1)}% - 2px)` }}>
                        <div className="w-full h-full border-t-2 border-x-2 border-green-500 rounded-t-lg flex items-center justify-center p-1">
                           <div className="text-green-600 text-xs sm:text-sm font-semibold text-center whitespace-nowrap flex items-center gap-1"><ShieldCheck size={16}/><span>Sorted Subarray</span></div>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>

            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-4 border-t pt-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-orange-400"></div><span>Key Element</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-400"></div><span>Comparing</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-dashed"></div><span>Insertion Point</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span>Sorted</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-green-500"></div><span>Sorted Subarray</span></div>
            </div>
        </div>

        <div className="my-8">
            <details className="bg-gray-800 rounded-lg overflow-hidden group">
                <summary className="p-4 text-white font-medium cursor-pointer flex items-center gap-2 group-hover:bg-gray-700 transition-colors"><Code size={18}/> View Algorithm Code</summary>
                <div className="relative">
                    <SyntaxHighlighter language="javascript" style={oneDark} showLineNumbers wrapLines={true}
                        lineProps={lineNumber => { const style = { display: 'block', width: '100%', transition: 'background-color 0.3s ease' }; if (lineNumber === highlightedLine) { style.backgroundColor = 'rgba(59, 130, 246, 0.3)'; style.boxShadow = 'inset 3px 0 0 0 #3b82f6'; } return { style }; }}>{codeString}</SyntaxHighlighter>
                </div>
            </details>
        </div>
      </div>
    </div>
  );
};

export default InsertionSortVisualizer;