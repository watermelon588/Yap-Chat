import React, { useState, useContext, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { ChatContext } from '../../context/Chatcontext'
import { Authcontext } from '../../context/AuthContext'
import { CallContext } from '../../context/CallContext'

const HomePage = () => {

    const {selectedUser, joinRoom} = useContext(ChatContext);
    const {authUser, socket} = useContext(Authcontext);
    const {joinCall} = useContext(CallContext);
    const joinAttempted = useRef(false);
    const callAttempted = useRef(false);

    // if the user arrived from a QR / invite link, join that room once
    useEffect(() => {
      const code = sessionStorage.getItem("pendingJoinCode");
      if (!authUser || !code || joinAttempted.current) return;
      joinAttempted.current = true;
      sessionStorage.removeItem("pendingJoinCode");
      joinRoom(code);
    }, [authUser]);

    // same for a video call link - wait for the socket, that is what carries
    // the signalling
    useEffect(() => {
      const code = sessionStorage.getItem("pendingCallCode");
      if (!authUser || !socket || !code || callAttempted.current) return;
      callAttempted.current = true;
      sessionStorage.removeItem("pendingCallCode");
      joinCall(code);
    }, [authUser, socket]);

  return (
    <div className='w-full h-[100dvh] flex items-center justify-center sm:p-4'>
      <div  className={`backdrop-blur-xl border-gray-600 overflow-hidden w-full h-full sm:border-2 sm:rounded-2xl sm:w-[92%] lg:w-[80%] xl:w-[70%] max-w-[1200px] sm:h-[88vh] px-3 py-4 sm:px-6 sm:py-8 grid grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}>
        <Sidebar/>
        <ChatContainer/>
        <RightSidebar/>
      </div>
    </div>
  )
}

export default HomePage
