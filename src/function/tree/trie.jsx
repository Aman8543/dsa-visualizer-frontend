import React, { useState, useRef, useEffect, useMemo } from "react";
import { Zap, RotateCcw, ListPlus, Search, PlusCircle, FileCheck, FileSearch } from "lucide-react";

// --- Constants ---
const NODE_SIZE = 50;
const LEVEL_HEIGHT = 90;
const MAX_WORDS = 50; // Strict limit on the number of words

// --- Trie Node Class ---
class TrieNode {
  constructor(char) {
    this.char = char;
    this.children = {};
    this.isEndOfWord = false;
  }
}

const TrieVisualizer = () => {
  // --- State Management ---
  const [trie, setTrie] = useState(() => ({ char: 'root', children: {}, isEndOfWord: false }));
  const [words, setWords] = useState(new Set());
  
  const [inputWords, setInputWords] = useState("apple, app, apollo, bat, ball");
  const [insertWord, setInsertWord] = useState("");
  const [searchQuery, setSearchQuery] = useState({ word: "", type: "word" }); // type can be 'word' or 'prefix'

  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [message, setMessage] = useState("Enter words to build a Trie.");
  const [highlightedPath, setHighlightedPath] = useState([]); // Stores path of chars

  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => timeoutsRef.current.forEach(clearTimeout);
  }, []);

  // --- Animation System ---
  const runAnimations = (actions) => {
    clearTimeouts();
    setIsAnimating(true);
    let cumulativeDelay = 0;
    actions.forEach(({ func, delay }, index) => {
      const timeoutId = setTimeout(() => {
        func();
        if (index === actions.length - 1) {
           setIsAnimating(false);
           setTimeout(() => setHighlightedPath([]), 1500); // Clear highlight after a delay
        }
      }, cumulativeDelay);
      timeoutsRef.current.push(timeoutId);
      cumulativeDelay += delay;
    });
  };

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setIsAnimating(false);
  };

  const reset = () => {
    clearTimeouts();
    setTrie({ char: 'root', children: {}, isEndOfWord: false });
    setWords(new Set());
    setHighlightedPath([]);
    setInputWords("apple, app, apollo, bat, ball");
    setMessage("Enter words to build a Trie.");
  };

  // --- Trie Operations ---
  const handleInsert = (wordToInsert) => {
    if (!wordToInsert || words.has(wordToInsert)) {
      setMessage(words.has(wordToInsert) ? `"${wordToInsert}" already in Trie.` : "Enter a word to insert.");
      return;
    }
    if (words.size >= MAX_WORDS) {
        setMessage(`❌ Word limit of ${MAX_WORDS} reached.`);
        return;
    }

    const actions = [];
    const newTrie = JSON.parse(JSON.stringify(trie));
    let currentNode = newTrie;
    let currentPath = [];

    for (let i = 0; i < wordToInsert.length; i++) {
      const char = wordToInsert[i];
      currentPath.push(char);
      const pathStr = currentPath.join('');

      actions.push({ func: () => {
        setHighlightedPath([...currentPath]);
        setMessage(`Checking for character: '${char}'`);
      }, delay: animationSpeed });

      if (!currentNode.children[char]) {
         actions.push({ func: () => setMessage(`'${char}' not found. Creating new node.`), delay: animationSpeed });
        currentNode.children[char] = { char, children: {}, isEndOfWord: false };
      }
      currentNode = currentNode.children[char];
    }
    currentNode.isEndOfWord = true;

    actions.push({ func: () => {
        setHighlightedPath(currentPath.map(c => ({ char: c, final: true })));
        setMessage(`Finished inserting "${wordToInsert}". Marked end of word.`);
        setTrie(newTrie);
        setWords(prev => new Set(prev.add(wordToInsert)));
        setInsertWord("");
    }, delay: animationSpeed });
    
    runAnimations(actions);
  };
    
  const handleSearch = () => {
      const { word, type } = searchQuery;
      if (!word) {
          setMessage("Enter a word or prefix to search.");
          return;
      }

      const actions = [];
      let currentNode = trie;
      let currentPath = [];

      for (let i = 0; i < word.length; i++) {
          const char = word[i];
          currentPath.push(char);
          
          actions.push({ func: () => {
              setHighlightedPath([...currentPath]);
              setMessage(`Searching for '${char}'...`);
          }, delay: animationSpeed });

          if (!currentNode.children[char]) {
              actions.push({ func: () => {
                  setHighlightedPath(currentPath.map(c => ({ char: c, final: false, fail: true })));
                  setMessage(`'${char}' not found. "${word}" does not exist.`);
              }, delay: animationSpeed });
              runAnimations(actions);
              return;
          }
          currentNode = currentNode.children[char];
      }

      const isFound = type === 'prefix' || (type === 'word' && currentNode.isEndOfWord);
      actions.push({ func: () => {
          setHighlightedPath(currentPath.map(c => ({ char: c, final: isFound })));
          if (isFound) {
              setMessage(`✅ Found ${type}: "${word}"`);
          } else {
              setMessage(`❗ Found prefix "${word}", but it's not a complete word.`);
          }
      }, delay: animationSpeed });

      runAnimations(actions);
  };

  const buildFromInput = () => {
      reset();
      const wordsToBuild = [...new Set(inputWords.split(",").map(w => w.trim()).filter(Boolean))];
      if(wordsToBuild.length > MAX_WORDS){
          setMessage(`❌ Input exceeds max of ${MAX_WORDS} words.`);
          return;
      }

      let tempTrie = { char: 'root', children: {}, isEndOfWord: false };
      let tempWords = new Set();
      
      for(const word of wordsToBuild) {
          let currentNode = tempTrie;
          for(const char of word) {
              if(!currentNode.children[char]){
                  currentNode.children[char] = { char, children: {}, isEndOfWord: false };
              }
              currentNode = currentNode.children[char];
          }
          currentNode.isEndOfWord = true;
          tempWords.add(word);
      }
      
      setTrie(tempTrie);
      setWords(tempWords);
      setMessage("✅ Trie built successfully!");
  }

  // --- Rendering & Layout Logic ---
  const layout = useMemo(() => {
    const positions = {};
    const dimensions = { minX: 0, maxX: 0, depth: 0 };
    let xOffset = 0;

    function calculatePositions(node, path, depth) {
      dimensions.depth = Math.max(dimensions.depth, depth);
      const children = Object.keys(node.children);

      if (children.length === 0) {
        positions[path] = { x: xOffset, y: depth };
        xOffset += NODE_SIZE * 1.5;
        return positions[path];
      }

      let childPositions = children.map(char => calculatePositions(node.children[char], path + char, depth + 1));
      
      let nodeX = (childPositions[0].x + childPositions[childPositions.length - 1].x) / 2;
      positions[path] = { x: nodeX, y: depth };
      
      dimensions.minX = Math.min(dimensions.minX, nodeX);
      dimensions.maxX = Math.max(dimensions.maxX, nodeX);
      return positions[path];
    }
    
    if (Object.keys(trie.children).length > 0) {
        calculatePositions(trie, 'root', 0);
    } else {
        positions['root'] = { x: 0, y: 0 };
    }

    return { positions, dimensions };
  }, [trie]);

  const renderNode = (node, path) => {
    if (!layout.positions[path]) return null;

    const { x, y } = layout.positions[path];
    const pathChars = highlightedPath.map(p => typeof p === 'string' ? p : p.char);
    const pathStr = path.substring(4);
    const highlightInfo = highlightedPath.find(p => pathStr === (Array.isArray(p) ? p.join('') : p.char));
    const isHighlighted = pathChars.join('').startsWith(pathStr) && pathStr.length > 0;
    const finalHighlight = highlightedPath.find(p => p.final !== undefined && pathChars.join('') === pathStr);

    let color = "#38bdf8"; // Default
    if(node.isEndOfWord) color = "#22c55e"; // End of word
    if(isHighlighted) color = "#facc15"; // On path
    if(finalHighlight){
        color = finalHighlight.fail ? "#ef4444" : "#4ade80"; // Fail or Success
    }

    return (
      <g key={path}>
        {Object.keys(node.children).map(char => {
            const childPath = path + char;
            if(!layout.positions[childPath]) return null;
            const childPos = layout.positions[childPath];
            return <line key={childPath + '-line'} x1={x} y1={y * LEVEL_HEIGHT + NODE_SIZE/2} x2={childPos.x} y2={childPos.y * LEVEL_HEIGHT + NODE_SIZE/2} stroke="#9ca3af" strokeWidth="2" />
        })}
        <circle cx={x} cy={y * LEVEL_HEIGHT + NODE_SIZE/2} r={NODE_SIZE/2} fill={color} stroke="#075985" strokeWidth="3" />
        <text x={x} y={y * LEVEL_HEIGHT + NODE_SIZE/2} textAnchor="middle" dy=".3em" fill="white" fontSize="1.2rem" fontWeight="bold">
            {node.char === 'root' ? ' ' : node.char}
        </text>
        {Object.keys(node.children).map(char => renderNode(node.children[char], path + char))}
      </g>
    );
  };
    
  const svgWidth = layout.dimensions.maxX - layout.dimensions.minX + NODE_SIZE * 2;
  const svgHeight = (layout.dimensions.depth + 1) * LEVEL_HEIGHT + NODE_SIZE;

  return (
    <div className="min-h-screen bg-slate-100 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-2xl">
        <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-center text-slate-800">Trie (Prefix Tree) Visualizer</h1>
         <div className="text-center mb-6">
             <span className={`font-mono px-3 py-1 rounded-full text-sm ${words.size >= MAX_WORDS ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'}`}>
                Words: {words.size} / {MAX_WORDS}
            </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
          {/* Build & Insert */}
          <div className="p-4 bg-slate-50 rounded-lg border flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2 text-slate-600"><ListPlus size={16} /> Bulk Insert</label>
                <textarea rows="2" value={inputWords} onChange={e => setInputWords(e.target.value)} disabled={isAnimating} className="textarea textarea-bordered w-full mt-1" />
                <button onClick={buildFromInput} disabled={isAnimating} className="btn btn-secondary w-full mt-2">Build Trie</button>
              </div>
               <div>
                <label className="text-sm font-medium flex items-center gap-2 text-slate-600"><PlusCircle size={16} /> Insert Word</label>
                <div className="flex gap-2 mt-1">
                    <input type="text" value={insertWord} onChange={e => setInsertWord(e.target.value.toLowerCase().trim())} disabled={isAnimating} className="input input-bordered w-full" placeholder="e.g., beyond" />
                    <button onClick={() => handleInsert(insertWord)} disabled={isAnimating || !insertWord} className="btn btn-success">Insert</button>
                </div>
              </div>
          </div>
          {/* Search */}
           <div className="p-4 bg-slate-50 rounded-lg border">
              <label className="text-sm font-medium flex items-center gap-2 text-slate-600"><Search size={16} /> Search Operations</label>
              <input type="text" value={searchQuery.word} onChange={e => setSearchQuery({...searchQuery, word: e.target.value.toLowerCase().trim()})} disabled={isAnimating} className="input input-bordered w-full mt-1" placeholder="e.g., app" />
              <div className="flex gap-2 mt-2">
                 <button onClick={() => { setSearchQuery(q => ({...q, type: 'word'})); handleSearch(); }} disabled={isAnimating || !searchQuery.word} className="btn btn-primary w-full"><FileCheck size={16} /> Search Word</button>
                 <button onClick={() => { setSearchQuery(q => ({...q, type: 'prefix'})); handleSearch(); }} disabled={isAnimating || !searchQuery.word} className="btn btn-primary btn-outline w-full"><FileSearch size={16} /> Search Prefix</button>
              </div>
          </div>
          {/* Controls */}
          <div className="p-4 bg-slate-50 rounded-lg border">
              <label className="text-sm font-medium flex items-center gap-2 text-slate-600"><Zap size={16} /> Animation Speed</label>
              <input type="range" min="100" max="1000" step="50" value={animationSpeed} onChange={e => setAnimationSpeed(1100 - Number(e.target.value))} disabled={isAnimating} className="range range-primary mt-1" />
              <button onClick={reset} disabled={isAnimating} className="btn btn-outline btn-error w-full mt-8"><RotateCcw className="mr-2" /> Reset Trie</button>
          </div>
        </div>
        
        <div className="w-full bg-slate-50 rounded-lg p-2 overflow-x-auto border border-slate-200 min-h-[400px] flex items-center justify-center">
            {words.size > 0 ? (
                <svg width={svgWidth} height={svgHeight} viewBox={`${layout.dimensions.minX - NODE_SIZE} 0 ${svgWidth} ${svgHeight}`}>
                   {renderNode(trie, 'root')}
                </svg>
            ) : (
                <div className="text-slate-500">Trie is empty. Build or insert words to visualize.</div>
            )}
        </div>
        
        <div className="text-center mt-4 h-10 text-md font-medium text-slate-700 bg-slate-100 rounded-md flex items-center justify-center px-4">
            <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default TrieVisualizer;