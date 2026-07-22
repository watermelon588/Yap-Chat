import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import LandingPage from './pages/LandingPage'
import CustomCursor from './components/CustomCursor'
import assets from './assets/assets'
import {Toaster} from 'react-hot-toast'
import { Authcontext } from '../context/AuthContext'
import { useContext } from 'react'
import Terms from './pages/Terms'

const App = () => {
  const {authUser} = useContext(Authcontext);

  // a QR / invite link looks like /chat?join=CODE - keep the code around so it
  // survives the trip through the login page
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("join");
    if (code) sessionStorage.setItem("pendingJoinCode", code);
  }, []);

  return (
    <div>
      <Toaster position='top-right' reverseOrder={false}/>
      <CustomCursor />
      <video
        src={assets.vid1}
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover bg-black z-[-1]"
      />
      
      <Routes>
        <Route path='/' element={<LandingPage />}/>
        <Route path='/chat' element={authUser ? <HomePage/> : <Navigate to="/login" />}/>
        <Route path='/terms' element={<Terms/>}/>
        <Route path='/login' element={!authUser ? <LoginPage/> : <Navigate to="/chat" />}/>
        <Route path='/profile' element={authUser ? <ProfilePage/> : <Navigate to="/login" />}/>
      </Routes>
    </div>
  )
}

export default App

