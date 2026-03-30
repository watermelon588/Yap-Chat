import { createContext, useEffect, useState  } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const Authcontext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Check if user is authenticated and if so, set the user data and connect the socket
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  // Login function to handle user authentication and socket connection
  const login = async (state, Credential) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, Credential);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
// Logout function to handle user logout and socket disconnection
const logout = async ()=>{
    localStorage.removeItem("token");
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("Logged out successfully");
    socket.disconnect();
}

// update profile function to handle user profile updates

const updateProfile = async (updatedData)=>{
    try {
        const {data} = await axios.put("/api/auth/update-profile", updatedData);
        if(data.success){
            setAuthUser(data.userData);
            toast.success("profile updated successfully");
        } else{
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
}


  // Connect socket function to handle socket connection and online users updates
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newsocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });
    newsocket.connect();
    setSocket(newsocket);

    newsocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      checkAuth();
    }
    
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile
  };
  return <Authcontext.Provider value={value}>{children}</Authcontext.Provider>;
};
