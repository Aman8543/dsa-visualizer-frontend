import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Zap, Search, ListPlus, ChevronDown } from 'lucide-react';

// Constants for styling to make calculations easier
const BOX_WIDTH = 48; // Corresponds to w-12
const GAP = 8;        // Corresponds to gap-2

const BinarySearchVisualizer = () => {
  // --- State for Data ---
  const [array, setArray] = useState([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29]);
  const [arrayInput, setArrayInput] = useState(array.join(', '));
  const [target, setTarget] = useState('17');
  
  // --- State for Visualization ---
  const [pointers, setPointers] = useState({ left: null, right: null, mid: null });
  const [foundIndex, setFoundIndex] = useState(null);
  const [message, setMessage] = useState('Enter a sorted array and a target, then click Search!');
  const [arrayMessage, setArrayMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [elementsToFade, setElementsToFade] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(1500);

  // --- Refs ---
  const timeoutIds = useRef([]);

  // --- Effects and Handlers ---
  useEffect(() => {
    // Clear any running animations when the component unmounts
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
    setPointers({ left: null, right: null, mid: null });
    setElementsToFade([]);
    setMessage('Ready to search!');
  };
  
  const handleSetArray = () => {
    resetVisuals();
    setArrayMessage('');

    const newArr = arrayInput.split(',').map(s => s.trim()).filter(s => s !== '').map(Number).filter(n => !isNaN(n));
    const originalLength = newArr.length;
    const uniqueSortedArr = [...new Set(newArr)].sort((a, b) => a - b);
    
    if (uniqueSortedArr.length === 0) {
      setArrayMessage('❌ Invalid input. Please provide a comma-separated list of numbers.');
      return;
    }
    
    let infoMessage = '';
    if (JSON.stringify(newArr) !== JSON.stringify(uniqueSortedArr)) {
        infoMessage = 'ℹ️ Your array has been sorted and duplicates removed for Binary Search.';
    } else {
        infoMessage = '✅ New array has been set!';
    }
    setArrayMessage(infoMessage);

    setArray(uniqueSortedArr);
    setArrayInput(uniqueSortedArr.join(', '));
  };

  const handleSearch = () => {
    resetVisuals(); 
    const targetNum = parseInt(target, 10);

    if (isNaN(targetNum)) {
      setMessage("❌ Please enter a valid number to search for.");
      return;
    }

    setIsSearching(true);
    let left = 0;
    let right = array.length - 1;
    let steps = [];

    // Generate all animation steps beforehand
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const currentStep = { left, right, mid, message: '' };
      
      if (array[mid] === targetNum) {
        currentStep.message = `✅ Target ${targetNum} found at index ${mid}!`;
        steps.push(currentStep);
        break;
      } else if (array[mid] < targetNum) {
        currentStep.message = `Checking mid (${array[mid]}). It's less than target (${targetNum}). Discarding left half.`;
        steps.push(currentStep);
        left = mid + 1;
      } else {
        currentStep.message = `Checking mid (${array[mid]}). It's greater than target (${targetNum}). Discarding right half.`;
        steps.push(currentStep);
        right = mid - 1;
      }
    }

    if (left > right) {
      steps.push({ left, right, mid: null, message: `❌ Target ${targetNum} was not found in the array.` });
    }

    animateSteps(steps);
  };
  
  const animateSteps = (steps) => {
    setMessage('Starting search...');
    setPointers({ left: 0, right: array.length - 1, mid: null });

    steps.forEach((step, stepIndex) => {
      const timeoutId = setTimeout(() => {
        setPointers({ left: step.left, right: step.right, mid: step.mid });
        setMessage(step.message);
        
        const faded = Array.from({ length: array.length }, (_, i) => i).filter(i => i < step.left || i > step.right);
        setElementsToFade(faded);

        if (step.mid !== null && array[step.mid] === parseInt(target, 10)) {
          setFoundIndex(step.mid);
        }

        if (stepIndex === steps.length - 1) {
          setIsSearching(false);
          // Keep final pointers visible unless not found
          if (foundIndex === null && array[step.mid] !== parseInt(target, 10)) {
             setPointers({ left: step.left, right: step.right, mid: null });
          }
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
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">Binary Search Visualizer</h1>

        {/* --- Configuration Section --- */}

        
            
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-md border">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
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
             <label className="text-sm font-medium text-gray-700 mt-4 mb-1 flex items-center gap-2">
                <Zap size={16}/> Animation Speed
             </label>
             <input
                type="range" min="200" max="3000" step="100"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
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
            <button className="btn btn-ghost text-green-600 ml-4" onClick={resetVisuals} disabled={isSearching}>
                <RotateCcw className="mr-2"/> Reset
            </button>
        </div>

        {/* --- Visualization Wrapper --- */}
        <div>
            
            
            <div className="relative pt-16 pb-8 min-h-[150px]">
              {/* --- Pointers --- */}
              <div className="absolute top-0 left-0 right-0 h-12 flex justify-center">
                <div className="relative w-full max-w-full">
                    <div className="absolute top-0" style={{ left: `calc(50% - ${(array.length * (BOX_WIDTH + GAP) - GAP) / 2}px)` }}>
                        {/* Left Pointer */}
                        <div className="absolute top-0 transition-all duration-500 ease-in-out" style={getPointerPosition(pointers.left)}>
                            <div className="flex flex-col items-center w-12"><span className="text-xs font-bold text-blue-600">LEFT</span><ChevronDown className="text-blue-600 w-8 h-8" /></div>
                        </div>
                        {/* Mid Pointer */}
                        <div className="absolute top-0 transition-all duration-500 ease-in-out" style={getPointerPosition(pointers.mid)}>
                            <div className="flex flex-col items-center w-12"><span className="text-xs font-bold text-yellow-600">MID</span><ChevronDown className="text-yellow-600 w-8 h-8" /></div>
                        </div>
                        {/* Right Pointer */}
                        <div className="absolute top-0 transition-all duration-500 ease-in-out" style={getPointerPosition(pointers.right)}>
                            <div className="flex flex-col items-center w-12"><span className="text-xs font-bold text-red-600">RIGHT</span><ChevronDown className="text-red-600 w-8 h-8" /></div>
                        </div>
                    </div>
                </div>
              </div>
              

              {/* --- Array Boxes --- */}
              <div className="flex justify-center flex-wrap gap-2 mb-4">
                {array.map((num, index) => {
                  const isMid = pointers.mid === index;
                  const isFound = foundIndex === index;
                  const isFaded = elementsToFade.includes(index);
                  
                  let bgColor = 'bg-gray-300 text-black';
                  if (isFound) bgColor = 'bg-green-500 text-white animate-pulse';
                  else if (isMid) bgColor = 'bg-yellow-500 text-black scale-110 ring-4 ring-yellow-300';
                  else if (!isFaded && isSearching) bgColor = 'bg-sky-200 text-black';
                  
                  return (
                    <div key={index} className={`transition-opacity duration-500 ${isFaded ? 'opacity-20' : ''}`}>
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
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-500"></div><span>Checking (Mid)</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span>Found</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-sky-200"></div><span>Active Range</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gray-300 opacity-20 border"></div><span>Discarded</span></div>
            </div>


            <div  className="border-t-2 border-gray-200 my-8" ></div>
        </div>

      </div>
    </div>
  );
};



 export default BinarySearchVisualizer;
