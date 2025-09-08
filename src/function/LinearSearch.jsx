import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Zap, Search, ListPlus, ChevronDown } from 'lucide-react';

// Constants for styling to make calculations easier
const BOX_WIDTH = 48; // Corresponds to w-12
const GAP = 8;        // Corresponds to gap-2

const LinearSearchVisualizer = () => {
  // --- State for Data ---
  const [array, setArray] = useState([12, 45, 78, 23, 56, 89, 10, 34]);
  const [arrayInput, setArrayInput] = useState(array.join(', '));
  const [target, setTarget] = useState('56');
  
  // --- State for Visualization ---
  const [pointerIndex, setPointerIndex] = useState(null);
  const [foundIndex, setFoundIndex] = useState(null);
  const [message, setMessage] = useState('Enter an array and a target, then click Search!');
  const [arrayMessage, setArrayMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [checkedIndices, setCheckedIndices] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(500);

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
    setPointerIndex(null);
    setCheckedIndices([]);
    setMessage('Ready to search!');
  };
  
  const handleSetArray = () => {
    resetVisuals();
    setArrayMessage('');
    const newArr = arrayInput.split(',').map(s => s.trim()).filter(s => s !== '').map(Number).filter(n => !isNaN(n));
    if (newArr.length === 0) {
      setArrayMessage('❌ Invalid input. Please provide a comma-separated list of numbers.');
      return;
    }
    setArray(newArr);
    setArrayInput(newArr.join(', '));
    setArrayMessage('✅ New array has been set!');
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
    let found = false;
    for (let i = 0; i < currentArray.length; i++) {
      const isMatch = currentArray[i] === targetNum;
      steps.push({ currentIndex: i, message: `Checking index ${i} (value: ${currentArray[i]})...` });
      if (isMatch) {
        steps.push({ currentIndex: i, message: `✅ Target ${targetNum} found at index ${i}!`, isMatch: true });
        found = true;
        break;
      }
    }
    if (!found) {
      steps.push({ currentIndex: null, message: `❌ Target ${targetNum} was not found in the array.` });
    }
    animateSteps(steps);
  };
  
  const animateSteps = (steps) => {
    setMessage('Starting search...');
    steps.forEach((step, stepIndex) => {
      const timeoutId = setTimeout(() => {
        setPointerIndex(step.currentIndex);
        setMessage(step.message);
        if (step.currentIndex !== null) {
           setCheckedIndices(prev => [...new Set([...prev, step.currentIndex])]);
        }
        if (step.isMatch) {
          setFoundIndex(step.currentIndex);
        }
        if (stepIndex === steps.length - 1) {
          setIsSearching(false);
          setPointerIndex(null);
        }
      }, stepIndex * animationSpeed);
      timeoutIds.current.push(timeoutId);
    });
  };

  const getPointerPosition = (index) => {
    if (index === null) return { transform: 'translateX(-2000px)', opacity: 0 };
    const offset = index * (BOX_WIDTH + GAP);
    return { transform: `translateX(${offset}px)`, opacity: 1 };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-sans">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">Linear Search Visualizer</h1>

        {/* --- Configuration Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-md border">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <ListPlus size={16}/> Array (comma-separated)
            </label>
            <textarea
              rows="3"
              value={arrayInput}
              onChange={(e) => setArrayInput(e.target.value)}
              disabled={isSearching}
              className="textarea textarea-bordered w-full disabled:bg-gray-200 disabled:text-gray-500"
              placeholder="e.g., 12, 45, 78"
            />
            <button onClick={handleSetArray} disabled={isSearching} className="btn btn-secondary btn-sm mt-2">
              Set New Array
            </button>
            {arrayMessage && <p className="text-sm text-blue-600 mt-2">{arrayMessage}</p>}
          </div>

          <div>
             <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Search size={16}/> Number to Search
             </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={isSearching}
              className="input input-bordered input-primary w-full disabled:bg-gray-200 disabled:text-gray-500"
            />
             <div className="mt-4 mb-1 flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Zap size={16}/> Animation Speed
                </label>
                <span className="text-sm font-mono text-gray-600">{animationSpeed}ms</span>
             </div>
             <input
                type="range"
                min="100" max="1500" step="100"
                value={1600 - animationSpeed}
                onChange={(e) => setAnimationSpeed(1600 - Number(e.target.value))}
                disabled={isSearching}
                className="range range-primary"
            />
          </div>
        </div>

        {/* --- Action Buttons --- */}
        <div className="text-center mb-8">
            <button className="btn btn-primary btn-lg" onClick={handleSearch} disabled={isSearching || !target}>
              {isSearching ? <span className="loading loading-spinner"></span> : <Play className="mr-2" />}
              {isSearching ? 'Searching...' : 'Start Search'}
            </button>
            <button className="btn text-green-600 btn-ghost ml-4" onClick={resetVisuals} disabled={isSearching}>
                <RotateCcw className="mr-2"/> Reset
            </button>
        </div>

        {/* --- Visualization Wrapper --- */}
        <div >
            
            
            {/* --- Visualization Area --- */}
            <div className="relative pt-16 pb-8 min-h-[150px]">
              {/* Animated Pointer */}
              <div className="absolute top-0 left-0 right-0 h-12 flex justify-center">
                <div className="relative w-full max-w-full">
                    <div className="absolute top-0 transition-all duration-300 ease-in-out" 
                         style={{ 
                             ...getPointerPosition(pointerIndex),
                             left: `calc(50% - ${(array.length * (BOX_WIDTH + GAP) - GAP) / 2}px)`
                         }}>
                        <div className="flex flex-col items-center w-12">
                            <span className="text-xs font-bold text-yellow-600">CHECKING</span>
                            <ChevronDown className="text-yellow-600 w-8 h-8" />
                        </div>
                    </div>
                </div>
              </div>

              {/* Array Boxes */}
              <div className="flex justify-center flex-wrap gap-2 mb-4">
                {array.map((num, index) => {
                  let bgColor = 'bg-gray-300 text-black'; // Default
                  if (foundIndex === index) {
                    bgColor = 'bg-green-500 text-white animate-pulse';
                  } else if (pointerIndex === index) {
                    bgColor = 'bg-yellow-500 text-black scale-110 ring-4 ring-yellow-300';
                  } else if (checkedIndices.includes(index)) {
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

            {/* --- Status Message --- */}
            <div className="text-center text-lg h-12 flex items-center justify-center p-2 bg-gray-100 rounded-md text-gray-700 font-medium mb-4">
              <p>{message}</p>
            </div>
            {/* --- Legend --- */}
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mt-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-500"></div><span>Checking</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span>Found</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-sky-200"></div><span>Checked</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gray-300"></div><span>Pending</span></div>
            </div>

            <div className="border-t-2 border-gray-200 mt-6"></div>
        </div>

      </div>
    </div>
  );
};

export default LinearSearchVisualizer;