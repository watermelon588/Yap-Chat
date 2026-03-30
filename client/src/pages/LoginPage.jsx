import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import {Authcontext} from '../../context/AuthContext.jsx'

const LoginPage = () => {


  const [currentState,setcurrentState] = useState("Sign up")
  const [fullName,setFullName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [bio,setBio] = useState("")
  const [isDataSubmitted,setIsDataSubmitted] = useState(false);

 const {login} = useContext(Authcontext)

  const onSubmitHandler = (event) =>{
    event.preventDefault();

    if(currentState === "Sign up" && !isDataSubmitted){
      setIsDataSubmitted(true)
      return ;
    }

    login(currentState === "Sign up" ? 'signup' : 'login', {fullname: fullName,email,password,bio})
  }


  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center md:justify-evenly max-:flex-col backdrop-blur-2xl ">
      {/* ____________left______________ */}
      <img src={assets.logo7} alt="" className='w-[min(30vw,500px)]'/>
      {/* ____________right______________ */}

      <form onSubmit={onSubmitHandler}
      className='border-1 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg max-w-sm w-full'>
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currentState}
          {isDataSubmitted && <img onClick={()=> setIsDataSubmitted(false)} src={assets.arrow_icon} alt="" className='w-5 cursor-pointer'/>}
          
        </h2>
          {currentState === "Sign up" && !isDataSubmitted &&(
            <input onChange={(e)=>setFullName(e.target.value)} value={fullName}
              type="text" className="
              w-full p-3 
              bg-white/10 text-white
              rounded-lg 
              outline-none
              border border-white/20 
              backdrop-blur-lg
              placeholder-white/50 
              focus:border-purple-400
              focus:ring-2 focus:ring-purple-500/70
              transition-all duration-300
              " placeholder='Full Name' required
            />
            )}

          {!isDataSubmitted && (

            <>
            <input onChange={(e)=>setEmail(e.target.value)} value={email}
              type="email" placeholder='Email Address' required className="
              w-full p-3 
              bg-white/10 text-white
              rounded-lg 
              outline-none
              border border-white/20 
              backdrop-blur-lg
              placeholder-white/50 
              focus:border-purple-400
              focus:ring-2 focus:ring-purple-500/70
              transition-all duration-300
            "/>
    
            <input onChange={(e)=>setPassword(e.target.value)} value={password}
              type="password" placeholder='Password' required className="
              w-full p-3 
              bg-white/10 text-white
              rounded-lg 
              outline-none
              border border-white/20 
              backdrop-blur-lg
              placeholder-white/50 
              focus:border-purple-400
              focus:ring-2 focus:ring-purple-500/70
              transition-all duration-300
            "/>

            </>

          )}

          {
            currentState === "Sign up" && isDataSubmitted && (
              <textarea onChange={(e)=>setBio(e.target.value)} value={bio}
              rows={4} className='w-full p-3 
              bg-white/10 text-white
              rounded-lg 
              outline-none
              border border-white/20 
              backdrop-blur-lg
              placeholder-white/50 
              focus:border-purple-400
              focus:ring-2 focus:ring-purple-500/70
              transition-all duration-300' placeholder='Provide a short Bio ... ' required></textarea>
            )
          }

          <button type="submit"
            className="
              py-3 px-6
              bg-gradient-to-r from-violet-500/70 to-purple-600/70
              text-white text-sm font-medium
              rounded-lg cursor-pointer
              border border-white/10
              backdrop-blur-xl
              hover:from-violet-500 hover:to-purple-600
              transition-all duration-300
            ">
            {currentState === "Sign up" ? "Create Account" : "Login Now"}
          </button>

          <div className='flex items-center gap-2 text-sm text-gray-400'>
            <input type="checkbox"  required/>
            <p>Agree to the terms of use & privacy policy.</p>
          </div>

          <div className='flex flex-col gap-2'>
            {currentState === "Sign up" ? (
              <p className='text-sm text-gray-400'>Already have an account? <span onClick={()=>{setcurrentState("Login"); setIsDataSubmitted(false)}}  className='font-medium text-violet-500 cursor-pointer'>Login here</span></p>
            ) : (
              <p className='text-sm text-gray-400'>Create an account <span onClick={()=>{setcurrentState("Sign up")}} className='font-medium text-violet-500 cursor-pointer'>Click here</span></p>
            )}
          </div>

      </form>
    </div>
  )
}

export default LoginPage
