import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { Authcontext } from "../../context/AuthContext";
import BackButton from "../components/BackButton";

const ProfilePage = () => {

  const {authUser, updateProfile} = useContext(Authcontext)

  const [selectedImg, setselectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser?.fullname || "");
  const [bio, setBio] = useState(authUser?.bio || "");

  const HandleSubmit = async(event) =>{
    event.preventDefault();
    if(!selectedImg){
      await updateProfile({fullname: name,bio});
      navigate('/chat');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async ()=>{
      const base64Image = reader.result;
      await updateProfile({profilePic: base64Image, fullname: name,bio});
      navigate('/chat');
    }
    
  }
  return (
    <div>
      <div className="min-h-[100dvh] bg-cover bg-center flex items-center justify-center px-4 py-8 backdrop-blur-2xl ">
        <div className="bg-white/8 w-full sm:w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-1 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
          <form onSubmit={HandleSubmit} className=' text-white p-5 sm:p-6 flex flex-col gap-5 sm:gap-7 rounded-lg max-w-sm w-full'>
            <div className="flex items-center gap-3">
              <BackButton to="/chat" iconOnly label="Back to chat" />
              <h2 className='font-medium text-2xl'>Profile details</h2>
            </div>
            <label
              htmlFor="avatar"
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                onChange={(e) => setselectedImg(e.target.files[0])}
                type="file"
                id="avatar"
                accept=".png, .jpg, .jpeg"
                hidden
              />
              <img
                src={
                  selectedImg
                    ? URL.createObjectURL(selectedImg)
                    : assets.avatar_icon
                }
                alt=""
                className={`w-12 h-12 object-cover ${selectedImg && "rounded-full"}`}
              ></img>
              upload profile image
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              required
              placeholder="Your name"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              placeholder="Write profile bio"
              required
              className="p-2 border 
              border-gray-500 rounded-md focus:outline-none focus:ring-2 
              focus:ring-violet-500"
              rows={4}
            ></textarea>
            <button className="
              py-3 px-6
              bg-gradient-to-r from-violet-500/70 to-purple-600/70
              text-white text-sm font-medium
              rounded-lg cursor-pointer
              border border-white/10
              backdrop-blur-xl
              hover:from-violet-500 hover:to-purple-600
              transition-all duration-300
            " type="submit">Save</button>
          </form>
          <img className="w-32 h-32 sm:w-52 sm:h-52 object-cover rounded-full mx-6 sm:mx-10 max-sm:mt-10 shrink-0"
src={ authUser?.profilePic ||assets.logo2} alt="" />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
