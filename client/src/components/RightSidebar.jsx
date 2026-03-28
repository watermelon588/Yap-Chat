import React from 'react'
import assets, { imagesDummyData } from '../assets/assets'

const RightSidebar = ({selectedUser}) => {
  return selectedUser && (
    // -------------------header-------------------
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll${selectedUser ? "max-md:hidden" : ""}`}>
      <div className='transform -translate-y-6 pt-14 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
        <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" 
        className='w-20 aspect-[1/1] rounded-full'/>
        <h1 className='px-10 text-xl font-medium mx-auto flex items-center gap-2'>
          <p className='w-2 h-2 rounded-full bg-green-500'></p>
          {selectedUser.fullName}
        </h1>
        <p className='text-center px-10 mx-auto'>{selectedUser.bio}</p>
      </div>

      <hr className='border-white/10 my-4 mx-5'/>
      {/* -----------media------------- */}
      <div className='px-5 text-xs'>
        <p>Media</p>
        <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80'>
          {imagesDummyData.map((url,index)=>(
            <div key={index} onClick={()=>window.open(url)}
            className='cursor-pointer rounded'>
              <img src={url} alt="" className='h-full rounded-md' />
            </div>
          ))}
        </div>
      </div>
          {/* ------------logout button-------------- */}
      <button
      className="
        absolute bottom-5 left-1/2 -translate-x-1/2
        bg-violet-500/60 
        backdrop-blur-xl
        text-white text-sm font-light
        py-2 px-20
        rounded-full cursor-pointer
        border border-white/10
      ">
        Logout
      </button>
    </div>
  )
}

export default RightSidebar
