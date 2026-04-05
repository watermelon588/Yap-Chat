import { createContext, useState, useContext } from "react";
import toast from "react-hot-toast";
import { Authcontext } from "./AuthContext";
import { useEffect } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(Authcontext);

  // function to get all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.Message);
    }
  };

  // function to get messages of selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.Message);
    }
  };

  // function to send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData,
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      } else {
        toast.error(data.Message);
      }
    } catch (error) {
      toast.error(error.Message);
    }
  };

  // function to subscribe to messages for selected user
  const subscribeToMessages = async () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId?.toString() === selectedUser._id?.toString()) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // function to unsubscrive from messages for selected user
  const unsubscribeFromMessages = () => {
    if (!socket) return;
    socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => {
      unsubscribeFromMessages();
    }
  },[socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    setMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages  
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
