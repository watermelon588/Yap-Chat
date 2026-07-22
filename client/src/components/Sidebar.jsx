import React, { useEffect, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { Authcontext } from "../../context/AuthContext";
import { useContext } from "react";
import { ChatContext } from "../../context/Chatcontext";
import RoomPanel from "./RoomPanel";
import BackButton from "./BackButton";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    activeRoom,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(Authcontext);

  const [input, setInput] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const filteredUsers = input
    ? users.filter((user) =>
        user.fullname.toLowerCase().includes(input.toLowerCase()),
      )
    : users;

  useEffect(() => {
    getUsers();
  }, [onlineUsers, activeRoom]);

  const navigate = useNavigate();
  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-3 sm:p-5 sm:rounded-r-xl overflow-y-auto text-white ${selectedUser ? "max-md:hidden" : ""}`}
    >
      <div className="pb-5">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <BackButton to="/" iconOnly label="Back to home" />
            <img src={assets.logo7} alt="logo" className="w-20 sm:w-24" />
          </div>
          {/* tap to open so it works on touch devices too */}
          <div className="relative py-2">
            <img
              onClick={() => setMenuOpen((prev) => !prev)}
              src={assets.menu_icon}
              alt="menu"
              className="max-h-5 cursor-pointer p-1 box-content"
            />
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className="absolute top-full right-0 z-20 w-40 p-5 rounded-md backdrop-blur-xl bg-black/60 border border-white/20
             shadow-[0_0_20px_rgba(0,0,0,0.3)] text-gray-200"
                >
                  <p
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="cursor-pointer text-sm"
                  >
                    Edit Profile
                  </p>
                  <hr className="my-2 border-t border-gray-500" />
                  <p
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="cursor-pointer text-sm"
                  >
                    Logout
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        {/* room panel */}
        <RoomPanel />
        {/* search box */}
        <div>
          <div
            className="backdrop-blur-xl bg-white/10 border border-white/10
               shadow-[0_0_25px_rgba(0,0,0,0.35)] rounded-full flex items-center gap-3 py-3 px-4 mt-5"
          >
            <img src={assets.search_icon} alt="search_icon" className="w-3" />
            <input
              onChange={(e) => setInput(e.target.value)}
              type="text"
              className="bg-transparent border-none outline-none text-white text-xs placeholder-white/40 flex-1"
              placeholder="Search User ..."
            />
          </div>
        </div>
        {/* user profiles */}
        <div className="flex flex-col">
          {!activeRoom && (
            <p className="text-xs text-white/40 text-center mt-6 px-4 leading-5">
              Create a room or join one with a code to start chatting.
            </p>
          )}
          {activeRoom && filteredUsers.length === 0 && (
            <p className="text-xs text-white/40 text-center mt-6 px-4 leading-5">
              You are the only one here yet. Share the code
              <span className="text-violet-200 tracking-widest">
                {" "}
                {activeRoom.code}{" "}
              </span>
              or the QR to invite people.
            </p>
          )}
          {filteredUsers.map((user, index) => (
            <div
              onClick={() => {
                setSelectedUser(user);
                setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
              }}
              key={index}
              className={`relative flex items-center gap-3 p-3 pl-4 rounded-xl cursor-pointer 
              transition-all max-sm:text-sm
              hover:bg-white/10 hover:backdrop-blur-lg mt-2 ${selectedUser?._id === user._id && " backdrop-blur-xl border"}`}
            >
              <img
                src={user?.profilePic || assets.avatar_icon}
                alt=""
                className="w-[35px] h-[35px] shrink-0 rounded-full object-cover"
              />
              <div className="flex flex-col leading-5 min-w-0">
                <p className="truncate">{user.fullname}</p>
                {onlineUsers.includes(user._id) ? (
                  <span className="text-green-400 text-xs">Online</span>
                ) : (
                  <span className="text-neutral-400 text-xs">Offline</span>
                )}
              </div>
              {unseenMessages[user._id] > 0 && (
                <p
                  className="
                    absolute top-4 right-4
                    text-[10px] font-medium text-white
                    h-5 w-5 flex justify-center items-center
                    rounded-full
                    backdrop-blur-xl
                    bg-violet-500/60 
                    border border-white/20
                  "
                >
                  {unseenMessages[user._id]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
