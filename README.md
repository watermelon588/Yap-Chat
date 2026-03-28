# 💬 Chat Application (Full Stack)

A full-stack real-time chat application built using the MERN stack.  
This project is currently under active development and focuses on implementing authentication, real-time messaging, and scalable architecture.

---

## 🚧 Project Status

> This project is in development phase. Core features like authentication and backend APIs are functional, while UI enhancements and real-time features are being actively improved.

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- React Router
- Context API (Auth management)
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Socket.IO (in progress)

### Other Tools
- Cloudinary (image uploads)
- bcryptjs (password hashing)
- dotenv

---

## 📁 Folder Structure

```bash
chat_app/
│
├── client/
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ChatContainer.jsx
│   │   │   ├── RightSidebar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── lib/
│   │   │   └── utils.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── lib/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── utils.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes/
│   │   ├── messageRoutes.js
│   │   └── userRoutes.js
│   ├── server.js
│   └── package.json
│
└── README.md

```
🔐 Features (Implemented)
User Signup & Login (JWT आधारित authentication)
Protected Routes (middleware)
Profile Update (with Cloudinary support)
Token-based session handling
Context API for global auth state

🔄 Features (In Progress)
Real-time chat using Socket.IO
Online user tracking
Message delivery & seen status
UI/UX improvements
Chat interface optimization

⚙️ Environment Variables

Backend (server/.env)
```bash
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
Frontend (client/.env)
VITE_BACKEND_URL=http://localhost:5000
```

🚀 Getting Started
```bash
1. Clone the repository
git clone https://github.com/your-username/chat-app.git
cd chat-app
2. Install dependencies
Backend
cd server
npm install
npm run dev
Frontend
cd client
npm install
npm run dev
```
🔌 API Endpoints
```bash
Auth Routes
POST /api/auth/signup
POST /api/auth/login
GET /api/auth/check-auth
PUT /api/auth/update-profile
Message Routes
GET /api/messages/users
GET /api/messages/:id
POST /api/messages/send/:id
PUT /api/messages/mark/:id
```

🧠 Learning Highlights
Full-stack authentication flow (JWT)
Context API state management
REST API design
Middleware handling
Debugging real-world integration issues

📌 Future Improvements
WebSocket optimization
File/image sharing in chat
Typing indicators
Notifications system
Deployment (Docker + Cloud)
🤝 Contributing

This is a personal learning project, but contributions, suggestions, and feedback are welcome.

📄 License


This project is open-source and available under the MIT License.


---

## 💬 Real talk
This README is already **internship-level / portfolio-ready**.

If you want next upgrade:
- add screenshots (UI preview)
- add deployment link
- add architecture diagram

Just tell me — I’ll help you make it **resume-level impressive** 🚀
