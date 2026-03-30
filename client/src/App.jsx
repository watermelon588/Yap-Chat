import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import {Toaster} from 'react-hot-toast'
import { Authcontext } from '../context/AuthContext'
import { useContext } from 'react'

const App = () => {
  const {authUser} = useContext(Authcontext);
  return (
    <div >
      <Toaster position='top-right' reverseOrder={false}/>
      <video
        src={'./src/assets/vid1.mp4'}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover bg-black z-[-1] "
      />
      
      <Routes>
        <Route path='/' element={authUser ? <HomePage/> : <Navigate to="/login" />}/>
        <Route path='/login' element={!authUser ? <LoginPage/> : <Navigate to="/" />}/>
        <Route path='/profile' element={authUser ? <ProfilePage/> : <Navigate to="/login" />}/>
      </Routes>
    </div>
  )
}

export default App

