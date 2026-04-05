<p align="center">
  <img src="./assets/Frame 498.jpg" alt="Yap Chat" width="800"/>
</p>

A modern real-time chat application built with the MERN stack and Socket.io.

Yap Chat focuses on **clean UI, real-time communication, and smooth user experience**, making it a solid foundation for scalable chat systems.

---

## 🚀 Live Features

- 🔐 User Authentication (JWT-based)
- 💬 Real-time messaging (Socket.io)
- 🟢 Online / Offline status
- 📨 Unseen message notifications
- 🖼️ Image sharing (Cloudinary)
- 🔍 User search functionality
- 📱 Fully responsive UI
- 📄 Terms & Privacy page

## 🧠 Tech Stack

### Frontend
- React
- Context API
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.io

### Services
- Cloudinary (Image uploads)
- JWT (Authentication)

## 📁 Project Structure

```bash

Yap-Chat/
│
├── client/                         # Frontend (React)
│   ├── src/
│   │   ├── assets/                # Images, icons
│   │   ├── components/            # Reusable UI components
│   │   ├── context/               # Global state (Auth, Chat)
│   │   ├── pages/                 # Main pages (Home, Login, Profile, Terms)
│   │   ├── App.jsx                # Routing setup
│   │   └── main.jsx              # Entry point
│
├── server/                         # Backend (Node + Express)
│   ├── controllers/              # Route handlers
│   ├── models/                   # Mongoose schemas
│   ├── routes/                   # API routes
│   ├── services/                 # Business logic (optional/expandable)
│   ├── middleware/               # Auth middleware
│   ├── socket/                   # Socket.io logic
│   ├── config/                   # DB & cloud config
│   └── server.js                 # Entry point
│
└── README.md
```

## ⚙️ Installation

### 1. Clone the repo

```bash
git clone https://github.com/watermelon588/Yap-Chat.git
cd Yap-Chat
```
### 2. Backend Setup
```bash
cd server
npm install
```
### 3. Create a .env file:
```bash
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```
### 4. Run server:
```bash
npm run dev
```
### 5. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

# 🧩 5. HOW IT WORKS (IMPORTANT FOR INTERVIEW)


## 🔄 How It Works

- User logs in → JWT authentication
- Socket connection is established
- Users can send messages in real-time
- Messages are stored in MongoDB
- Receiver gets message instantly via Socket.io
- UI updates dynamically without refresh

## 🚀 Future Improvements

- 💬 Chat Rooms (conversation-based system)
- ✔ Seen / Delivered message status
- ⌨ Typing indicators
- 👥 Group chats
- 🔔 Push notifications
- 🔍 Message search

## 📸 Preview

<p align="center">
  <img src="./assets/Preview.jpg" alt="Yap Chat UI" width="800"/>
</p>

## ✨ Author

**Rohit**  
Building real-world projects with clean UI and scalable systems 🚀
