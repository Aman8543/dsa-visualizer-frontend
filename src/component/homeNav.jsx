import { useEffect, useState } from "react";
import { logoutUser } from "../authSlice"

import { useDispatch ,useSelector } from "react-redux"
import { Navigate } from "react-router";

import Signup from "../pages/signUp";
import Login from "../pages/login";

export default function HomeNav({userdata}){

    const [pageshow,setpageshow] = useState(false); 

    const dispatch = useDispatch();
    const {isAuthenticated} = useSelector(state=>state.auth);
    const [flag,setflag] = useState(false)
   
  

    useEffect(()=>{
        if(!isAuthenticated){
            <Navigate to={"/home"}></Navigate>
        }
        if(flag){
            dispatch(logoutUser());
        }
    },[isAuthenticated,Navigate,flag]);
    return (
        <nav className="bg-gray-800 fixed z-10  min-w-full">
  <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
    <div className="relative flex h-16 items-center justify-between">
      <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
        
        <button type="button" className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset" aria-controls="mobile-menu" aria-expanded="false">
          <span className="absolute -inset-0.5"></span>
          <span className="sr-only">Open main menu</span>
          
          <svg className="block size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        
          <svg className="hidden size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
        <div className="flex shrink-0 items-center overflow-hidden     ">
          <img className="h-18 w-auto  filter"  src="/img/logodsa.png" alt="Your Company" />
        </div>
        {/* <div className="hidden sm:ml-6 sm:block">
          <div className="flex space-x-4">
            
            <a href="#" className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white" aria-current="page">Dashboard</a>
            <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Team</a>
            <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Projects</a>
            <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Calendar</a>
          </div>
        </div> */}
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
        <button type="button" className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
          <span className="absolute -inset-1.5"></span>
          <span className="sr-only">View notifications</span>
          <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        </button>

        
        <div className="relative ml-3 group">
          <div>
            <button type="button" className="relative flex rounded-full bg-gray-800 text-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
              <span className="absolute -inset-1.5"></span>
              <span className="sr-only">Open user menu</span>
              <img className="size-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
            </button>
          </div>

          {/* <!--
            Dropdown menu, show/hide based on menu state.

            Entering: "transition ease-out duration-100"
              From: "transform opacity-0 scale-95"
              To: "transform opacity-100 scale-100"
            Leaving: "transition ease-in duration-75"
              From: "transform opacity-100 scale-100"
              To: "transform opacity-0 scale-95"
          --> */}
          <div className="absolute right-0 mt-2 w-auto origin-top-right rounded-md bg-white py-1 group-hover:visible transition-normal shadow-lg ring-1 ring-black/5 focus:outline-hidden invisible " role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex="-1">
            {/* <!-- Active: "bg-gray-100 outline-hidden", Not Active: "" --> */}

            {/* <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="user-menu-item-0">Your Profile</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="user-menu-item-1">Settings</a> */}
            
            {userdata?<div className="bg-white shadow-lg rounded-xl p-6 max-w-sm mx-auto my-8 border border-gray-200">
  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Profile</h2>
  <div className="space-y-5">
    <div className="flex justify-between items-center border-b pb-3 border-gray-100">
      <p className="font-semibold text-gray-600 text-lg">Name:</p>
      <p className="text-gray-800 text-lg font-medium">{userdata.firstName}</p>
    </div>
    <div className="flex justify-between items-center border-b pb-3 border-gray-100">
      <p className="font-semibold text-gray-600 text-lg">Email:</p>
      <p className="text-gray-800 text-lg font-medium truncate ml-3">{userdata.emailId}</p>
    </div>
  </div>

  <button
    className="mt-8 w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-md font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-800 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
    onClick={() => setflag(true)}
  >
    Sign Out
  </button>
</div>:
   
   <div>
    {!pageshow?<div>

  <Signup></Signup>
  <div className="text-center mt-4">
          <p className="text-sm text-gray-800">
            Already have an account?{" "}
            <button className="link link-primary link-hover" onClick={()=>{setpageshow(true)}}  >
              Sign In
            </button>
          </p>
        </div>
        
  </div>:<Login></Login>}
   </div>
  
  }
            

          </div>
        </div>
      </div>
    </div>
  </div>

  {/* <!-- Mobile menu, show/hide based on menu state. --> */}
  <div className="sm:hidden" id="mobile-menu">
    <div className="space-y-1 px-2 pt-2 pb-3">
      {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" --> */}
      {/* <a href="#" className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white" aria-current="page">Dashboard</a>
      <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Team</a>
      <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Projects</a>
      <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Calendar</a> */}
    </div>
  </div>
</nav>
    )
}