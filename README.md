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
