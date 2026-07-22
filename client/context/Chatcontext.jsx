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

  // rooms
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);

  const { socket, axios, authUser } = useContext(Authcontext);

  // remember the last room the user was in
  const rememberRoom = (room) => {
    if (room?._id) localStorage.setItem("activeRoomId", room._id);
  };

  const selectRoom = (room) => {
    setActiveRoom(room);
    rememberRoom(room);
    setSelectedUser(null);
    setMessages([]);
  };

  // function to get every room the user belongs to
  const getRooms = async () => {
    try {
      const { data } = await axios.get("/api/rooms/my");
      if (data.success) {
        setRooms(data.rooms);

        // keep the current room in sync, else fall back to the remembered one
        const savedId = localStorage.getItem("activeRoomId");
        const current = data.rooms.find(
          (room) => room._id === (activeRoom?._id || savedId),
        );
        if (current) {
          setActiveRoom(current);
          rememberRoom(current);
        } else if (data.rooms.length > 0 && !activeRoom) {
          selectRoom(data.rooms[0]);
        } else if (data.rooms.length === 0) {
          setActiveRoom(null);
        }
      }
      return data.rooms || [];
    } catch (error) {
      toast.error(error.message);
      return [];
    }
  };

  // function to create a room, code is optional (user can choose one)
  const createRoom = async ({ name, code }) => {
    try {
      const { data } = await axios.post("/api/rooms/create", { name, code });
      if (data.success) {
        setRooms((prev) => [data.room, ...prev]);
        selectRoom(data.room);
        toast.success(`Room ${data.room.code} created`);
        return data.room;
      }
      toast.error(data.message);
      return null;
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  };

  // function to join a room using its code
  const joinRoom = async (code) => {
    try {
      const { data } = await axios.post("/api/rooms/join", { code });
      if (data.success) {
        setRooms((prev) => {
          const rest = prev.filter((room) => room._id !== data.room._id);
          return [data.room, ...rest];
        });
        selectRoom(data.room);
        toast.success(data.message);
        return data.room;
      }
      toast.error(data.message);
      return null;
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  };

  // function to leave a room
  const leaveRoom = async (roomId) => {
    try {
      const { data } = await axios.delete(`/api/rooms/leave/${roomId}`);
      if (data.success) {
        const rest = rooms.filter((room) => room._id !== roomId);
        setRooms(rest);
        if (activeRoom?._id === roomId) {
          localStorage.removeItem("activeRoomId");
          setSelectedUser(null);
          setMessages([]);
          setUsers([]);
          if (rest.length > 0) selectRoom(rest[0]);
          else setActiveRoom(null);
        }
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to get all users of the active room for the sidebar
  const getUsers = async () => {
    if (!activeRoom) {
      setUsers([]);
      setUnseenMessages({});
      return;
    }
    try {
      const { data } = await axios.get("/api/messages/users", {
        params: { roomId: activeRoom._id },
      });
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
    if (!activeRoom) return;
    try {
      const { data } = await axios.get(`/api/messages/${userId}`, {
        params: { roomId: activeRoom._id },
      });
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.Message);
    }
  };

  // function to send message to selected user
  const sendMessage = async (messageData) => {
    if (!activeRoom) return toast.error("Pick a room first");
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        { ...messageData, roomId: activeRoom._id },
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.Message);
    }
  };

  // swap a message for its "deleted" tombstone wherever we are holding it
  const markMessageDeleted = (messageId) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message._id?.toString() === messageId?.toString()
          ? {
              ...message,
              deleted: true,
              text: undefined,
              image: undefined,
              audio: undefined,
              audioDuration: 0,
            }
          : message,
      ),
    );
  };

  // function to delete one of your own messages for everyone in the chat
  const deleteMessage = async (messageId) => {
    try {
      const { data } = await axios.delete(`/api/messages/${messageId}`);
      if (data.success) {
        markMessageDeleted(messageId);
        toast.success("Message deleted");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to subscribe to messages for selected user
  const subscribeToMessages = async () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      // ignore anything that does not belong to the room we are looking at
      if (
        activeRoom &&
        newMessage.roomId?.toString() !== activeRoom._id?.toString()
      ) {
        return;
      }
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

    // the sender removed a message for everyone
    socket.on("messageDeleted", ({ messageId }) => {
      markMessageDeleted(messageId);
    });

    // someone joined one of our rooms, refresh the member list
    socket.on("roomUpdated", () => {
      getRooms();
    });
  };

  // function to unsubscrive from messages for selected user
  const unsubscribeFromMessages = () => {
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("roomUpdated");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => {
      unsubscribeFromMessages();
    }
  },[socket, selectedUser, activeRoom]);

  // load the rooms as soon as we know who the user is
  useEffect(() => {
    if (authUser) {
      getRooms();
    } else {
      setRooms([]);
      setActiveRoom(null);
      setUsers([]);
      setMessages([]);
      setSelectedUser(null);
    }
  }, [authUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    setMessages,
    sendMessage,
    deleteMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    rooms,
    activeRoom,
    getRooms,
    createRoom,
    joinRoom,
    leaveRoom,
    selectRoom
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
