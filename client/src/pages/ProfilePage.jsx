import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { Authcontext } from "../../context/AuthContext";

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
      navigate('/');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async ()=>{
      const base64Image = reader.result;
      await updateProfile({profilePic: base64Image, fullname: name,bio});
      navigate('/');
    }
    
  }
  return (
    <div>
      <div className="min-h-screen bg-cover bg-center flex items-center justify-center md:justify-evenly max-:flex-col backdrop-blur-2xl ">
        <div className="bg-white/8 w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-1 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
          <form onSubmit={HandleSubmit} className=' text-white p-6 flex flex-col gap-7 rounded-lg max-w-sm w-full'>
            <h2 className='font-medium text-2xl flex justify-between items-center'>Profile details</h2>
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
                className={`w-12 h-12 ${selectedImg && "rounded-full"}`}
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
          <img className={`max-w-60 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImg && "rounded-full"}`} 
src={ authUser.profilePic ||assets.logo2} alt="" />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
