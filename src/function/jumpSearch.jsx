import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Zap, Search, ListPlus, ChevronDown } from 'lucide-react';

// Constants for styling to make calculations easier
const BOX_WIDTH = 48; // Corresponds to w-12
const GAP = 8;        // Corresponds to gap-2

const JumpSearchVisualizer = () => {
  // --- State for Data ---
  const [array, setArray] = useState([0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225]);
  const [arrayInput, setArrayInput] = useState(array.join(', '));
  const [target, setTarget] = useState('100');
  
  // --- State for Visualization ---
  const [pointers, setPointers] = useState({ jump: null, linear: null });
  const [block, setBlock] = useState({ start: null, end: null });
  const [foundIndex, setFoundIndex] = useState(null);
  const [message, setMessage] = useState('Enter a sorted array and a target, then click Search!');
  const [arrayMessage, setArrayMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [checkedIndices, setCheckedIndices] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  // --- Refs ---
  const timeoutIds = useRef([]);

  // --- Effects and Handlers ---
  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const clearTimeouts = () => {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
  };

  const resetVisuals = () => {
    clearTimeouts();
    setIsSearching(false);
    setFoundIndex(null);
    setPointers({ jump: null, linear: null });
    setBlock({ start: null, end: null });
    setCheckedIndices([]);
    setMessage('Ready to search!');
  };
  
  const handleSetArray = () => {
    resetVisuals();
    setArrayMessage('');
    const newArr = arrayInput.split(',').map(s => s.trim()).filter(s => s !== '').map(Number).filter(n => !isNaN(n));
    const uniqueSortedArr = [...new Set(newArr)].sort((a, b) => a - b);
    
    if (uniqueSortedArr.length === 0) {
      setArrayMessage('❌ Invalid input. Please provide a comma-separated list of numbers.');
      return;
    }
    
    setArrayMessage('ℹ️ Your array has been sorted and duplicates removed for Jump Search.');
    setArray(uniqueSortedArr);
    setArrayInput(uniqueSortedArr.join(', '));
  };

  const handleSearch = () => {
    resetVisuals();
    const currentArray = [...array];
    const targetNum = parseInt(target, 10);

    if (isNaN(targetNum)) {
      setMessage("❌ Please enter a valid number to search for.");
      return;
    }

    setIsSearching(true);
    let steps = [];
    const n = currentArray.length;
    if (n === 0) {
      setMessage("❌ Cannot search in an empty array.");
      setIsSearching(false);
      return;
    }
    const jumpStep = Math.floor(Math.sqrt(n));
    let prev = 0;
    let current = 0;
    let found = false;

    // --- Phase 1: Jumping ---
    steps.push({ message: `Calculated jump step size: √${n} ≈ ${jumpStep}` });
    
    while (current < n && currentArray[current] < targetNum) {
      steps.push({ jump: current, message: `Jumping to index ${current}. Value (${currentArray[current]}) is less than target (${targetNum}).` });
      prev = current;
      current = Math.min(current + jumpStep, n -1);
    }
    
    if(current > prev) {
       steps.push({ jump: current, message: `Value at index ${current} (${currentArray[current]}) is >= target. Target must be in block [${prev}, ${current}].`});
    }

    // --- Phase 2: Linear Search in the block ---
    steps.push({ blockStart: prev, blockEnd: current, message: `Starting linear search from index ${prev}...` });

    for (let i = prev; i <= current; i++) {
        if (i >= n) break; // Boundary check

        steps.push({ linear: i, blockStart: prev, blockEnd: current, message: `Checking index ${i} (value: ${currentArray[i]})...` });
        if (currentArray[i] === targetNum) {
            steps.push({ linear: i, blockStart: prev, blockEnd: current, message: `✅ Target ${targetNum} found at index ${i}!`, isMatch: true });
            found = true;
            break;
        }
    }

    if (!found) {
        steps.push({ blockStart: prev, blockEnd: current, message: `❌ Target ${targetNum} was not found in the array.` });
    }
    
    animateSteps(steps);
  };
  
  const animateSteps = (steps) => {
    steps.forEach((step, stepIndex) => {
      const timeoutId = setTimeout(() => {
        setMessage(step.message);
        setPointers({ jump: step.jump, linear: step.linear });
        
        if (step.blockStart !== undefined) {
          setBlock({ start: step.blockStart, end: step.blockEnd });
        }
        if (step.linear !== undefined && step.linear !== null) {
           setCheckedIndices(prev => [...new Set([...prev, step.linear])]);
        }

        if (step.isMatch) {
          setFoundIndex(step.linear);
        }
        
        if (stepIndex === steps.length - 1) {
          setIsSearching(false);
          setPointers({ jump: null, linear: null }); // Hide pointers at the end
        }
      }, stepIndex * animationSpeed);
      timeoutIds.current.push(timeoutId);
    });
  };

  const getPointerPosition = (index) => {
    if (index === null || index === undefined) return { transform: 'translateX(-2000px)', opacity: 0 };
    const offset = index * (BOX_WIDTH + GAP);
    return { transform: `translateX(${offset}px)`, opacity: 1 };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">Jump Search Visualizer</h1>

        {/* --- Visualization Wrapper --- */}
        <div className="mb-8">
            <div className="text-center text-lg h-12 flex items-center justify-center p-2 bg-gray-100 rounded-md text-gray-700 font-medium mb-4">
              <p>{message}</p>
            </div>
            
            <div className="relative pt-16 pb-8 min-h-[150px]">
              {/* Pointers */}
              <div className="absolute top-0 left-0 right-0 h-12 flex justify-center">
                <div className="relative w-full max-w-full">
                    <div className="absolute top-0" style={{ left: `calc(50% - ${(array.length * (BOX_WIDTH + GAP) - GAP) / 2}px)` }}>
                        {/* Jump Pointer */}
                        <div className="absolute top-0 transition-all duration-300 ease-in-out" style={getPointerPosition(pointers.jump)}>
                            <div className="flex flex-col items-center w-12"><span className="text-xs font-bold text-blue-600">JUMP</span><ChevronDown className="text-blue-600 w-8 h-8" /></div>
                        </div>
                        {/* Linear Search Pointer */}
                        <div className="absolute top-0 transition-all duration-300 ease-in-out" style={getPointerPosition(pointers.linear)}>
                            <div className="flex flex-col items-center w-12"><span className="text-xs font-bold text-yellow-600">CHECK</span><ChevronDown className="text-yellow-600 w-8 h-8" /></div>
                        </div>
                    </div>
                </div>
              </div>

              {/* Array Boxes */}
              <div className="flex justify-center flex-wrap gap-2 mb-4">
                {array.map((num, index) => {
                  let bgColor = 'bg-gray-300 text-black';
                  const isInBlock = block.start !== null && index >= block.start && index <= block.end;

                  if (foundIndex === index) {
                    bgColor = 'bg-green-500 text-white animate-pulse';
                  } else if (pointers.linear === index) {
                    bgColor = 'bg-yellow-500 text-black scale-110 ring-4 ring-yellow-300';
                  } else if (pointers.jump === index) {
                     bgColor = 'bg-blue-400 text-white scale-110 ring-4 ring-blue-300';
                  } else if (checkedIndices.includes(index)) {
                     bgColor = 'bg-orange-200 text-black';
                  } else if (isInBlock) {
                    bgColor = 'bg-sky-200 text-black';
                  }
                  
                  return (
                    <div key={index}>
                      <div className={`w-12 h-12 flex items-center justify-center rounded-md font-bold text-lg shadow transition-all duration-300 transform ${bgColor}`}>
                        {num}
                      </div>
                      <div className="text-center text-xs mt-1 text-gray-500">{index}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-400"></div><span>Jump Position</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-500"></div><span>Checking</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span>Found</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-sky-200"></div><span>Search Block</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-orange-200"></div><span>Checked in Block</span></div>
            </div>
        </div>
        
        {/* --- Controls Wrapper --- */}
        <div className="border-t-2 border-gray-200 pt-6">
            {/* Action Buttons */}
            <div className="text-center mb-8">
                <button className="btn btn-primary btn-lg" onClick={handleSearch} disabled={isSearching || !target}>
                  {isSearching ? <span className="loading loading-spinner"></span> : <Play className="mr-2" />}
                  {isSearching ? 'Searching...' : 'Start Search'}
                </button>
                <button className="btn btn-ghost text-green-600 ml-4" onClick={resetVisuals} disabled={isSearching}>
                    <RotateCcw className="mr-2"/> Reset
                </button>
            </div>

            {/* Configuration Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-md border">
              <div>
                <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <ListPlus size={16}/> Your Array (comma-separated)
                </label>
                <textarea
                  rows="3"
                  value={arrayInput}
                  onChange={(e) => setArrayInput(e.target.value)}
                  disabled={isSearching}
                  className="textarea textarea-bordered w-full disabled:bg-gray-200 disabled:text-gray-500"
                  placeholder="e.g., 1, 3, 5, 7, 9"
                />
                <button onClick={handleSetArray} disabled={isSearching} className="btn btn-secondary btn-sm mt-2">
                  Set & Sort Array
                </button>
                {arrayMessage && <p className="text-sm text-blue-600 mt-2">{arrayMessage}</p>}
              </div>

              <div>
                 <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Search size={16}/> Number to Search
                 </label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  disabled={isSearching}
                  className="input input-bordered input-primary w-full disabled:bg-gray-200 disabled:text-gray-500"
                />
                 <label className="text-sm font-medium text-gray-700 mt-4 mb-1 flex items-center gap-2">
                                 <Zap size={16}/> Animation Speed
                              </label>
                 <input
                    type="range" min="200" max="2000" step="100"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(2200 - Number(e.target.value))}
                    disabled={isSearching}
                    className="range range-primary"
                />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default JumpSearchVisualizer;