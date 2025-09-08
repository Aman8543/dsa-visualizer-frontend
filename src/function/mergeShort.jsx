import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, ListPlus, Shuffle, ChevronDown } from 'lucide-react';

const MAX_ARRAY_SIZE = 12;

// --- Helper to generate a random array ---
const generateRandomArray = () => {
  const newArray = [];
  // Random size between 8 and 12
  const size = Math.floor(Math.random() * 5) + 8;
  for (let i = 0; i < size; i++) {
    // Numbers between 10 and 99
    newArray.push(Math.floor(Math.random() * 90) + 10);
  }
  return newArray;
};

// --- TreeNode Component for Visualization ---
const TreeNode = ({ node, status, isVisible }) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'splitting': return 'bg-yellow-500 text-black border-yellow-600 border-2 shadow-lg scale-105';
      case 'merging-source': return 'bg-sky-200 opacity-70';
      case 'merged': return 'bg-green-400 text-white animate-pulse-once';
      case 'done': return 'bg-green-500 text-white font-bold shadow-xl animate-pulse';
      case 'consumed': return 'opacity-20';
      default: return 'bg-gray-300 text-black';
    }
  };

  if (!isVisible && status !== 'consumed') return null;

  return (
    <div className={`flex gap-1 p-2 bg-white/10 rounded-lg shadow-sm transition-all duration-500 ${status === 'consumed' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
      {node.arr.map((num, i) => (
        <div key={i} className={`w-9 h-9 flex items-center justify-center rounded text-sm font-semibold text-gray-800 transition-all duration-300 ${getStatusClasses()}`}>
          {num}
        </div>
      ))}
    </div>
  );
};


const MergeSortVisualizer = () => {
  // --- State Management ---
  const [array, setArray] = useState(generateRandomArray());
  const [arrayInput, setArrayInput] = useState(array.join(', '));
  const [arrayMessage, setArrayMessage] = useState('');

  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(700);

  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [fullTree, setFullTree] = useState([]);
  const [treeNodeStates, setTreeNodeStates] = useState({});
  const [mergeState, setMergeState] = useState(null);

  // --- Refs ---
  const timeoutRef = useRef(null);

  // --- Core Algorithm: Step Generation ---
  const generateSteps = useCallback((arr) => {
    const divisionSteps = [];
    const mergeSteps = [];
    const tree = [[{ arr: [...arr], start: 0, end: arr.length - 1, id: '0' }]];

    function mergeSortRecursive(currentArr, start, level, parentId) {
      if (currentArr.length <= 1) {
        return currentArr;
      }

      const mid = Math.floor(currentArr.length / 2);
      const leftHalf = currentArr.slice(0, mid);
      const rightHalf = currentArr.slice(mid);
      const leftId = `${parentId}-L`;
      const rightId = `${parentId}-R`;
      
      divisionSteps.push({
        type: 'divide', parentId, leftId, rightId,
        message: `Dividing array of size ${currentArr.length} into two halves.`
      });

      const leftNode = { arr: leftHalf, start: start, id: leftId };
      const rightNode = { arr: rightHalf, start: start + mid, id: rightId };
      if (!tree[level + 1]) tree[level + 1] = [];
      tree[level + 1].push(leftNode, rightNode);
      tree[level + 1].sort((a, b) => a.start - b.start);

      const sortedLeft = mergeSortRecursive(leftHalf, start, level + 1, leftId);
      const sortedRight = mergeSortRecursive(rightHalf, start + mid, level + 1, rightId);

      return merge(sortedLeft, sortedRight, parentId, leftId, rightId);
    }

    function merge(left, right, parentId, leftId, rightId) {
      const mergedArray = [];
      let i = 0, j = 0;

      mergeSteps.push({
        type: 'merge-start', left, right, parentId, leftId, rightId,
        message: `Merging [${left.join(', ')}] and [${right.join(', ')}]`
      });

      while (i < left.length && j < right.length) {
        mergeSteps.push({ type: 'compare', leftIndex: i, rightIndex: j, message: `Comparing ${left[i]} and ${right[j]}...` });
        if (left[i] <= right[j]) {
          mergedArray.push(left[i]);
          mergeSteps.push({ type: 'move-to-temp', value: left[i], from: 'left', message: `${left[i]} is smaller, moving to temporary array.` });
          i++;
        } else {
          mergedArray.push(right[j]);
          mergeSteps.push({ type: 'move-to-temp', value: right[j], from: 'right', message: `${right[j]} is smaller, moving to temporary array.` });
          j++;
        }
      }

      while (i < left.length) {
        mergedArray.push(left[i]);
        mergeSteps.push({ type: 'move-to-temp', value: left[i], from: 'left', leftover: true, message: `Moving leftover ${left[i]} from left half.` });
        i++;
      }
      while (j < right.length) {
        mergedArray.push(right[j]);
        mergeSteps.push({ type: 'move-to-temp', value: right[j], from: 'right', leftover: true, message: `Moving leftover ${right[j]} from right half.` });
        j++;
      }
      
      mergeSteps.push({ type: 'copy-back', sorted: mergedArray, parentId, leftId, rightId, message: 'Updating parent array with sorted result.' });
      return mergedArray;
    }

    mergeSortRecursive([...arr], 0, 0, '0');

    const allSteps = [
      ...divisionSteps,
      { type: 'phase-change', message: 'Division complete. Starting merge phase.' },
      ...mergeSteps,
      { type: 'done', message: 'Array is sorted!' }
    ];

    setSteps(allSteps);
    setFullTree(tree);
    return allSteps.length;
  }, []);

  // --- Animation Control ---
  const processStep = useCallback((step) => {
    switch (step.type) {
      case 'divide': {
        setMergeState(null);
        setTreeNodeStates(prev => ({
          ...prev,
          [step.parentId]: { ...prev[step.parentId], status: 'splitting' },
          [step.leftId]: { ...fullTree.flat().find(n => n.id === step.leftId), status: 'new' },
          [step.rightId]: { ...fullTree.flat().find(n => n.id === step.rightId), status: 'new' },
        }));
        break;
      }
      case 'phase-change': {
        setTreeNodeStates(prev => {
           const newStates = {...prev};
           Object.keys(newStates).forEach(id => {
              if(newStates[id].status === 'splitting') newStates[id].status = 'split-complete';
           });
           return newStates;
        });
        break;
      }
      case 'merge-start': {
        setMergeState({
            left: step.left.map(val => ({ val, state: 'pending' })),
            right: step.right.map(val => ({ val, state: 'pending' })),
            result: [],
            compare: [null, null],
        });
        setTreeNodeStates(prev => ({
            ...prev,
            [step.leftId]: { ...prev[step.leftId], status: 'merging-source' },
            [step.rightId]: { ...prev[step.rightId], status: 'merging-source' },
        }));
        break;
      }
      case 'compare': {
        setMergeState(prev => ({ ...prev, compare: [step.leftIndex, step.rightIndex] }));
        break;
      }
      case 'move-to-temp': {
        setMergeState(prev => {
          if (!prev) return null;
          const newLeft = [...prev.left];
          const newRight = [...prev.right];
          const newResult = [...prev.result, step.value];

          if (step.from === 'left') {
            const idx = newLeft.findIndex(item => item.val === step.value && item.state === 'pending');
            if (idx !== -1) newLeft[idx].state = 'moved';
          } else {
            const idx = newRight.findIndex(item => item.val === step.value && item.state === 'pending');
            if (idx !== -1) newRight[idx].state = 'moved';
          }
          return { ...prev, left: newLeft, right: newRight, result: newResult, compare: [null, null] };
        });
        break;
      }
      case 'copy-back': {
        setMergeState(null);
        setTreeNodeStates(prev => ({
            ...prev,
            [step.parentId]: { ...prev[step.parentId], arr: step.sorted, status: 'merged' },
            [step.leftId]: { ...prev[step.leftId], status: 'consumed' },
            [step.rightId]: { ...prev[step.rightId], status: 'consumed' },
        }));
        if (step.parentId === '0') setArray(step.sorted);
        break;
      }
      case 'done': {
        setIsSorting(false);
        setTreeNodeStates(prev => ({ ...prev, '0': { ...prev['0'], status: 'done' }}));
        break;
      }
      default: break;
    }
  }, [fullTree]);

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
    setFullTree([]);
    setMergeState(null);
  }, []);

  const handleStart = () => {
    resetVisuals();
    const len = generateSteps(array);
    if (len > 0) {
      setTreeNodeStates({ '0': { arr: [...array], id: '0', status: 'initial' }});
      setIsSorting(true);
      setIsPaused(false);
      setCurrentStep(0);
      setTimeout(() => {
          if (steps.length > 0) {
              processStep(steps[0]);
              setCurrentStep(1);
          }
      }, 50);
    }
  };

  const handlePauseResume = () => setIsPaused(!isPaused);
  
  const handleReset = () => {
    resetVisuals();
    const newArr = arrayInput.split(',').map(s => s.trim()).filter(s => s !== '').map(Number).filter(n => !isNaN(n));
    setArray(newArr.length > 0 ? newArr : generateRandomArray());
    setTreeNodeStates({});
  };
  
  const handleSetArray = () => {
    resetVisuals();
    setArrayMessage('');
    let newArr = arrayInput.split(',').map(s => s.trim()).filter(s => s !== '').map(Number).filter(n => !isNaN(n));
    if (newArr.length === 0) { setArrayMessage('❌ Invalid input.'); return; }
    if (newArr.length > MAX_ARRAY_SIZE) { setArrayMessage(`❌ Max array size is ${MAX_ARRAY_SIZE}.`); return; }
    setArray(newArr);
    setTreeNodeStates({});
    setArrayMessage('✅ New array set!');
  };
  
  const handleRandomize = () => {
    resetVisuals();
    const newArr = generateRandomArray();
    setArray(newArr);
    setArrayInput(newArr.join(', '));
    setTreeNodeStates({});
    setArrayMessage('');
  };
  
  const currentMessage = steps[currentStep-1]?.message || "Ready to sort!";

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 tracking-tight">Merge Sort Visualizer</h1>
          <p className="text-gray-500">See how Merge Sort divides an array and merges it back together, sorted.</p>
        </header>

        {/* --- Configuration --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-md border">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <ListPlus size={16}/> Your Array (max {MAX_ARRAY_SIZE} numbers)
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
             <input type="range" min="100" max="1500" step="50" value={animationSpeed} onChange={(e) => setAnimationSpeed(Number(e.target.value))} disabled={isSorting} className="range range-primary range-sm" />
          </div>
        </div>

        {/* --- Action Buttons --- */}
        <div className="flex justify-center items-center gap-4 mb-6">
            <button className="btn btn-primary btn-lg" onClick={handleStart} disabled={isSorting}>
              <Play className="mr-2" /> Start
            </button>
            <button className="btn btn-secondary btn-lg" onClick={handlePauseResume} disabled={!isSorting}>
              {isPaused ? <Play className="mr-2"/> : <Pause className="mr-2" />} {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button className="btn btn-ghost btn-lg text-red-600" onClick={handleReset}>
                <RotateCcw className="mr-2"/> Reset
            </button>
        </div>
        
        {/* --- Status Message --- */}
        <div className="text-center h-14 flex items-center justify-center p-2 mb-6 bg-gray-100 rounded-md text-gray-700 font-medium">
           <p>{currentMessage}</p>
        </div>

        {/* --- Visualization Area --- */}
        <div className="w-full min-h-[450px] bg-white p-4 rounded-lg border border-gray-200 overflow-x-auto">
            {/* Merge Stage */}
            {mergeState && (
                <div className="p-4 mb-6 bg-gray-50 rounded-lg border border-gray-200 shadow-md animate-fade-in">
                    <h3 className="text-center font-bold text-primary mb-4">MERGING SUB-ARRAYS</h3>
                    <div className="flex justify-center items-start gap-8 flex-wrap">
                        {/* Left Half */}
                        <div className="flex flex-col items-center">
                            <p className="text-xs text-gray-500 mb-2">Left Half</p>
                            <div className="flex gap-2">
                                {mergeState.left.map((item, i) => (
                                    <div key={i} className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-lg shadow-md transition-all duration-300 ${mergeState.compare[0] === i ? 'bg-yellow-500 text-black scale-110 ring-2 ring-yellow-300' : 'bg-sky-200 text-black'} ${item.state === 'moved' ? 'opacity-30' : ''}`}>
                                        {item.val}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Right Half */}
                        <div className="flex flex-col items-center">
                            <p className="text-xs text-gray-500 mb-2">Right Half</p>
                            <div className="flex gap-2">
                                {mergeState.right.map((item, i) => (
                                    <div key={i} className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-lg shadow-md transition-all duration-300 ${mergeState.compare[1] === i ? 'bg-yellow-500 text-black scale-110 ring-2 ring-yellow-300' : 'bg-sky-200 text-black'} ${item.state === 'moved' ? 'opacity-30' : ''}`}>
                                        {item.val}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                     {/* Merged Result */}
                    <div className="mt-6 flex flex-col items-center">
                        <ChevronDown className="text-green-600 w-8 h-8 mb-2"/>
                        <p className="text-xs text-gray-500 mb-2">Temporary Merged Array</p>
                        <div className="h-14 flex items-center gap-2 p-1 bg-gray-200/50 rounded-lg">
                            {mergeState.result.map((val, i) => (
                                <div key={i} className="w-10 h-10 flex items-center justify-center rounded-lg font-bold text-lg shadow-md bg-green-300 text-black animate-pop-in">
                                    {val}
                                </div>
                            ))}
                            {mergeState.result.length === 0 && <div className="px-3 text-sm text-gray-500">Empty</div>}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Recursive Tree */}
            <div className="space-y-4 pt-4">
                {fullTree.map((level, levelIndex) => (
                    <div key={levelIndex} className="flex justify-center gap-4 flex-wrap">
                        {level.map((node) => (
                           <TreeNode key={node.id} node={node} status={treeNodeStates[node.id]?.status} isVisible={!!treeNodeStates[node.id]}/>
                        ))}
                    </div>
                ))}
            </div>

            <div className="border-t-2 border-gray-200 my-8"></div>
            {/* --- Legend --- */}
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-500"></div><span>Splitting / Comparing</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span>Final Sorted</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-sky-200"></div><span>Merging Source</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gray-300 opacity-20 border"></div><span>Consumed / Discarded</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gray-300"></div><span>Default</span></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MergeSortVisualizer;
