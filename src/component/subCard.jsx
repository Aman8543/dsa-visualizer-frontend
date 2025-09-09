
import { useContext, useState,useRef } from "react";
import { GlobalContext } from "../app";
import { useParams,  NavLink } from 'react-router';


import { BsCodeSlash } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';
import { MdOutlineVisibility, MdOutlineInfo, MdCode, MdNotes } from 'react-icons/md';

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

import { FaYoutube } from "react-icons/fa";

import { FaTachometerAlt, FaBalanceScale, FaSkullCrossbones } from "react-icons/fa";

//data about
import { tagsDetail,algorithmDetails } from "../Data/about";

import vidLinks from "../Data/videoLink";

import { algorithmsCodes } from "../Data/codes";

const submenuItems = [
  { label: "Visualization", icon: <MdOutlineVisibility /> ,id:"visu" },
  { label: "About", icon: <MdOutlineInfo />,id:"about" },
  { label: "Code", icon: <MdCode />,id:"code" },
  { label: "Tutorial", icon: <MdNotes />,id:"tut" },
];


 

export default function SubCard() {
  const globaldata = useContext(GlobalContext);
  const { technique } = useParams();
  const category = globaldata.find(element => element.title === technique);

  const [openIndex, setOpenIndex] = useState(0); // Currently opened algorithm index
  const [activeSubTab, setActiveSubTab] = useState("Visualization");



  //to select algorithm function
    const [algoIndex, setalgoIndex] = useState(0);
    const SelectedAlgorithm = category.func[algoIndex];
   

  //to select about data 

  let [aboutData,setaboutData] = useState( algorithmDetails[category.items[0]]);
  const [algorithmName,setalgorithmName] = useState("");
  const{definition,working,timeComplexity} = aboutData;
  
  const handleAlgorithmClick = (index,algoName) => {
    setOpenIndex(prev => (prev === index ? null : index));
    setActiveSubTab("Visualization"); // Default to Visualization
    setalgoIndex(index);

    setaboutData(algorithmDetails[algoName]);    
    setalgorithmName(algoName);
  };

  
 
  const handleSubmenuClick = (tab,id) => {
    setActiveSubTab(tab);
    // console.log(`Subtab clicked: ${tab}`);
    // Add logic here based on tab selection
     document.getElementById(id)?.scrollIntoView({ behavior: "smooth",block:"start" });
  };

  if (!category){
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Category not found!</h1>
          <Link to="/" className="mt-4 btn btn-primary">Go Back Home</Link>
        </div>
      </div>
    );
  }

    

  // for code block

  let currentalgoName ; //for first video
  let codetechnique={};
  algorithmsCodes.forEach((obj)=>{
    if(obj.title == technique){
      codetechnique = obj.items[0].codes;
      currentalgoName = obj.items[0].name;
      return;
    }
  })


 let algoCodes = codetechnique;
  algorithmsCodes.forEach((obj)=>{
      obj.items.forEach((itm)=>{
        if(algorithmName!= "" && itm.name == algorithmName){
          algoCodes = itm.codes;
          return;
        }
      })
  })

 

   const [selectedLang, setSelectedLang] = useState("cpp");

  const codeSnippets = {
    cpp: `${algoCodes.cpp}`,
    python: `${algoCodes.python}`,
    java: `${algoCodes.java}`,
  };

 

  //video section

  let str=algorithmName;

 
   let noSpacesalgo; 
   let youtubeUrl;

  if(algorithmName ==""){
   let nocharalgo = currentalgoName.replace(/[^a-zA-Z0-9]/g,"");
    youtubeUrl=`${vidLinks[nocharalgo]}`;
    
  }
  else{
    noSpacesalgo = str.replace(/[^a-zA-Z0-9]/g,"");
    youtubeUrl = `${vidLinks?.[noSpacesalgo]}`;
  }

 
  

  let title =algorithmName;


 
   
  
   



  const getVideoId = (url) => {
    const regex = /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(youtubeUrl);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const [size, setSize] = useState({ width: 640, height: 360 });
  const resizerRef = useRef(null);
  const isResizing = useRef(false);

  const startResize = (e) => {
    isResizing.current = true;
    resizerRef.current = { startX: e.clientX, startY: e.clientY, ...size };
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  };

  const resize = (e) => {
    if (!isResizing.current) return;
    const deltaX = e.clientX - resizerRef.current.startX;
    const deltaY = e.clientY - resizerRef.current.startY;
    setSize({
      width: Math.max(320, resizerRef.current.width + deltaX),
      height: Math.max(180, resizerRef.current.height + deltaY),
    });
  };

  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  };


  
   

  return (
    <div className="p-4 md:p-8 bg-base-200 min-h-screen min-w-screen">
      <div className="max-w-screen-2xl mx-auto">
        {/* Page Header */}
        <header className="text-center mb-8 relative">
          
          <NavLink to="/home" className="btn btn-ghost absolute left-0 top-1/2 ">
            <FaArrowLeft className="mr-2" />
            All Categories
          </NavLink>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{category.title}</h1>
          <p className="text-lg text-base-content/70">
            Select an algorithm from the list to explore its details.
          </p>
          <div className="divider mt-4"></div>
        </header>

        {/* Layout */}
        <main className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <div className="card bg-base-100 shadow-xl rounded-xl">
              <div className="card-body p-4">
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Algorithms
                </h2>

                <ul className="space-y-2">
                  {category.items.map((algoName, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleAlgorithmClick(index , algoName)}
                        className={`flex items-center justify-between w-full px-4 py-2 rounded-lg text-base font-medium transition-all duration-200
                          ${openIndex === index ? "bg-primary text-white shadow-md" : "hover:bg-primary/10 hover:text-primary"}`}
                      >
                        <span className="flex items-center gap-3">
                          <BsCodeSlash className="text-lg" />
                          {algoName}
                        </span>
                        <span>{openIndex === index ? "▲" : "▼"}</span>
                      </button>

                      {/* Submenu */}
                      {openIndex === index && (
                        <ul className="mt-2 ml-4 border-l pl-4 border-primary">
                          {submenuItems.map((subItem) => (
                            <li key={subItem.label} className="mb-2">
                              <button 
                                onClick={() => handleSubmenuClick(subItem.label , subItem.id)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-md w-full text-left text-sm font-medium
                                  ${activeSubTab === subItem.label
                                    ? "bg-primary text-white"
                                    : "hover:bg-primary/10 hover:text-primary"}`}
                              >
                                {subItem.icon}
                                {subItem.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Display Area */}
          <section className="w-full md:w-3/4 lg:w-4/5">
            <div className="card bg-base-100 shadow-xl rounded-xl p-6">
              {/* <h2 className="text-2xl font-bold mb-4">
                {openIndex !== null ? category.items[openIndex] : "Select an algorithm"}
              </h2> */}
              <div className="text-base-content/80">
                {openIndex === null ? (
                  <p className="text-lg">Choose an algorithm to view its details.</p>
                ) : (
                  <div>
                    {/* <p className="mb-2 font-semibold">Current Tab: {activeSubTab}</p> */}
                    {/* Replace below with real content rendering logic */}
                    <div className="bg-base-200 p-4 rounded-lg">
                      

                      <div className="h-screen overflow-y-auto bg-base-200">
      <div className="max-w-4xl mx-auto p-6 space-y-12">
        
        {/* visualization section */}
          <div id="visu"
            
            className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-primary hover:shadow-xl transition duration-300"
          >
            <h2 className="text-2xl font-semibold text-primary mb-3 border-b pb-2">
              Visualization
            </h2>
            <div className="text-gray-700 leading-relaxed">{<SelectedAlgorithm></SelectedAlgorithm>}</div>
          </div>



{/* about */}
          {/* <div
            
            className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-primary hover:shadow-xl transition duration-300"
          >
            <h2 className="text-2xl font-semibold text-primary mb-3 border-b pb-2">
              About
            </h2>
            <p className="text-gray-700 leading-relaxed">Binary search is an efficient algorithm for finding an element's position in a sorted array. It works by repeatedly dividing the search interval in half. If the value of the search key is less than the item in the middle of the interval, the algorithm narrows the interval to the lower half. Otherwise, it narrows it to the upper half. This process continues until the value is found or the interval is empty.</p>
          </div> */}


          <div id="about" className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-primary hover:shadow-2xl transition duration-300">
      <h2 className="text-2xl font-semibold text-primary mb-4 border-b pb-2">About</h2>

      

      {/* Subsection: Definition */}
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Definition</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        <strong>{algorithmName}</strong> {definition}
      </p>

      {/* Subsection: How It Works */}
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Working</h3>
      <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
        {/* <li>Start with the entire sorted array.</li>
        <li>Compare the target with the middle element.</li>
        <li>If equal, return the index.</li>
        <li>If smaller, repeat on the left subarray.</li>
        <li>If larger, repeat on the right subarray.</li> */}

        {
          working.map((element,index)=>{
            return <li key={index} >{element}</li>
          })
        }
      </ul>

      {/* Time Complexity Section */}
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Time Complexity</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-green-800 font-medium">
            <FaTachometerAlt className="text-lg" />
            <span>Best Case</span>
          </div>
          <p className="text-gray-700">
            <code className="bg-gray-100 px-2 py-0.5 rounded">{timeComplexity.best}</code> — Target found at the middle on first try.
          </p>
        </div>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-yellow-800 font-medium">
            <FaBalanceScale className="text-lg" />
            <span>Average Case</span>
          </div>
          <p className="text-gray-700">
            <code className="bg-gray-100 px-2 py-0.5 rounded">{timeComplexity.average}</code> — Repeated halving of the array.
          </p>
        </div>
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-1 text-red-800 font-medium">
            <FaSkullCrossbones className="text-lg" />
            <span>Worst Case</span>
          </div>
          <p className="text-gray-700">
            <code className="bg-gray-100 px-2 py-0.5 rounded">{timeComplexity.worst}</code> — Target is at one of the ends.
          </p>
        </div>
      </div>
    </div>





        {/* code section */}
              <div id="code" className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-primary hover:shadow-xl transition duration-300">
      <div className="text-2xl font-semibold text-primary mb-4 border-b pb-3 flex gap-4">
        {["cpp", "python", "java"].map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLang(lang)}
            className={`px-4 py-1 rounded-full border font-medium text-sm transition 
              ${
                selectedLang === lang
                  ? "bg-primary text-white"
                  : "text-primary hover:bg-primary/10"
              }`}
          >
            {lang === "cpp" ? "C++" : lang.charAt(0).toUpperCase() + lang.slice(1)}
          </button>
        ))}
      </div>

      <SyntaxHighlighter
        language={selectedLang}
        style={vscDarkPlus}
        customStyle={{
          borderRadius: "0.5rem",
          padding: "1rem",
          fontSize: "0.9rem",
          backgroundColor: "#1e1e1e",
        }}
      >
        {codeSnippets[selectedLang]}
      </SyntaxHighlighter>
    </div>

{/* video part */}
          {/* <div
            
            className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-primary hover:shadow-xl transition duration-300"
          >
            <h2 className="text-2xl font-semibold text-primary mb-3 border-b pb-2">
              Tutorial
            </h2>
            <video src="https://www.youtube.com/watch?v=0Hwpzd-bSck&list=PLQEaRBV9gAFu4ovJ41PywklqI7IyXwr01&index=22" ></video>
          </div> */}

            <div id="tut" className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-primary hover:shadow-2xl transition duration-300">
      <h2 className="text-2xl font-semibold text-primary mb-4 border-b pb-2">
        {title}
      </h2>

      <div
        className="relative border rounded-md overflow-hidden bg-black mb-4"
        style={{ width: size.width, height: size.height }}
      >
        <iframe
          className="w-full h-full"
          src={embedUrl}
          title="YouTube Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>

        {/* Resizer Handle */}
        <div
          onMouseDown={startResize}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-primary"
          title="Resize"
        ></div>
      </div>

      <a
        href={youtubeWatchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition duration-200"
      >
        <FaYoutube className="text-xl" />
        Watch on YouTube
      </a>
    </div>






          {/* <div
            
            className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-primary hover:shadow-xl transition duration-300"
          >
            <h2 className="text-2xl font-semibold text-primary mb-3 border-b pb-2">
              hello
            </h2>
            <p className="text-gray-700 leading-relaxed">heoo</p>
          </div> */}
      
      </div>
    </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}