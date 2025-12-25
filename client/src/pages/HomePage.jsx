import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'

const HomePage = () => {

    const [selectedUser,setSelectedUser] = useState(false)

  return (
    <div className='w-full h-screen flex items-center justify-center'>
      <div  className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden w-[70%] max-w-[1200px] h-[80vh] px-6 py-8 grid grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}>
        <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser}/>
        <ChatContainer selectedUser={selectedUser} setSelectedUser={setSelectedUser}/>
        <RightSidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser}/>
      </div>
    </div>
  )
}

export default HomePage
