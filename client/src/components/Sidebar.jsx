import React from 'react'
import assets, { userDummyData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Sidebar = ({selectedUser , setSelectedUser}) => {
    const navigate = useNavigate();
  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ""}`}>
      <div className='pb-5'>
        <div className='flex justify-between items-center'>
            <img src={assets.logo7} alt="logo" className='max-w-30'/>
            <div className='relative py-2 group'>
                <img src={assets.menu_icon} alt="menu" className='max-h-5 cursor-pointer'/>
                <div className="absolute top-full right-0 z-20 w-40 p-5 rounded-md backdrop-blur-xl bg-white/10 border border-white/20
             shadow-[0_0_20px_rgba(0,0,0,0.3)] text-gray-200 hidden group-hover:block ">
                    <p onClick={()=>navigate('/profile')} className='cursor-pointer text-sm'>Edit Profile</p>
                    <hr className='my-2 border-t border-gray-500'/>
                    <p className='cursor-pointer text-sm'>Logout</p>
                </div>
            </div>
        </div>
        {/* search box */}
        <div>
          <div className='backdrop-blur-xl bg-white/10 border border-white/10
               shadow-[0_0_25px_rgba(0,0,0,0.35)] rounded-full flex items-center gap-3 py-3 px-4 mt-5'>
            <img src={assets.search_icon} alt="search_icon" className='w-3'/>
            <input type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-white/40 flex-1' placeholder='Search User ...'/>
          </div>
        </div> 
        {/* user profiles */}
        <div className='flex flex-col'>
          {userDummyData.map((user,index)=>(
            <div onClick={()=>{setSelectedUser(user)}}
            className={`relative flex items-center gap-3 p-3 pl-4 rounded-xl cursor-pointer 
              transition-all max-sm:text-sm
              hover:bg-white/10 hover:backdrop-blur-lg mt-2 ${selectedUser?._id === user._id && ' backdrop-blur-xl border'}`}>
              <img src={user?.profilePic || assets.avatar_icon} alt="" className='w-[35px] aspect-[1/1] rounded-full'/>
              <div className='flex flex-col leading-5'>
                <p>{user.fullName}</p>
                {
                  index < 3 
                  ? <span className='text-green-400 text-xs'>Online</span>
                  : <span className='text-neutral-400 text-xs'>Offline</span>
                }
              </div>
              {index > 2 && <p className="
                    absolute top-4 right-4
                    text-[10px] font-medium text-white
                    h-5 w-5 flex justify-center items-center
                    rounded-full
                    backdrop-blur-xl
                    bg-violet-500/60 
                    border border-white/20
                  ">{index}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
