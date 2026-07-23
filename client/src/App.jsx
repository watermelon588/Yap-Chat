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
import VideoCall from './components/VideoCall'
import IncomingCall from './components/IncomingCall'

const App = () => {
  const {authUser} = useContext(Authcontext);

  // a QR / invite link looks like /chat?join=CODE (room) or /chat?call=CODE
  // (video call) - keep the code around so it survives the trip through login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get("join");
    const callCode = params.get("call");
    if (joinCode) sessionStorage.setItem("pendingJoinCode", joinCode);
    if (callCode) sessionStorage.setItem("pendingCallCode", callCode);
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

      {/* video calling sits above every route so a ring reaches you anywhere */}
      <IncomingCall />
      <VideoCall />
    </div>
  )
}

export default App

