import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import './index.css'
import DSAVisualizerLanding from './pages/start.jsx'

import BinarySearchVisualizer from './function/binarySearch.jsx'
import { Route,Routes,Navigate} from 'react-router'
import {Provider} from "react-redux"
import Signup from './pages/signUp.jsx'
import Login from './pages/login.jsx'
import { useDispatch , useSelector } from 'react-redux'
import { checkAuth } from './authSlice.js'
import Home from './pages/Home.jsx'
import SubCard from './component/subCard.jsx'

import { createContext } from 'react'
import globaldata from './globalVar.jsx'

export const GlobalContext = createContext();

function App(){
    const dispatch = useDispatch();
    const {isAuthenticated,loading,user}=useSelector((state)=> state.auth);
    
    
    useEffect(()=>{
      dispatch(checkAuth());
    }, [dispatch])
    
    if(loading){
        return<></>
    }

    

    return (
        
            
        
       
        <GlobalContext.Provider value={globaldata}>
        <Routes>
            {/* <Route path='/home' element={isAuthenticated?<Home userdata={user}></Home>:<Navigate to={"/"}></Navigate>}></Route>
            <Route path="/" element={isAuthenticated?<Navigate to={'/home'}></Navigate>:<DSAVisualizerLanding></DSAVisualizerLanding>} ></Route>
            <Route path='/signup' element={isAuthenticated?<Navigate to={'/home'}></Navigate>: <Signup></Signup>}></Route>
            <Route path='/login' element={isAuthenticated?<Navigate to={'/home'}></Navigate>:<Login></Login>}></Route>
            <Route path='/home/:technique' element={<SubCard ></SubCard>} ></Route> */}

            <Route path='/home' element={<Home userdata={user} ></Home>}></Route>
            <Route path="/" element={<DSAVisualizerLanding></DSAVisualizerLanding>} ></Route>
            <Route path='/home/:technique' element={<SubCard ></SubCard>} ></Route>

        </Routes>
        </GlobalContext.Provider>
      
        
    )
}

export default App;