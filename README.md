<p align="center">
  <img src="./assets/logo7.png" alt="Yap Chat" width="600"/>
</p>

<p align="center">
  Private, code-based chat rooms with voice notes, photo sharing and
  peer-to-peer group video calling.<br/>
  Built on the MERN stack with Socket.IO and WebRTC.
</p>

---

## Contents

- [What it is](#what-it-is)
- [Preview](#preview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [How it works](#how-it-works)
- [Security](#security)
- [Testing](#testing)
- [Deployment checklist](#deployment-checklist)
- [Known limitations](#known-limitations)

---

## What it is

Yap Chat is not one big room for everybody. You create a **room**, pick your own
code (or let the app generate one), and share it as text, a link or a QR. Only
people holding that code appear in your sidebar.

Inside a room you get one-to-one conversations with text, photos and voice
notes — and you can jump onto a **group video call** with up to eight people,
either straight from a chat or from a call code you hand out.

---

## Preview

<p align="center">
  <img src="./assets/Preview1.jpg" alt="Yap Chat interface: signup, chat with media panel, profile details, and the terms page" width="900"/>
</p>

<p align="center">
  <em>Signup &middot; chat with the media panel &middot; profile details &middot; terms &amp; privacy</em><br/>
  <sub><a href="./assets/Preview.jpg">View the same screens as a full-height walkthrough &rarr;</a></sub>
</p>

### Video calling

<p align="center">
  <img src="./client/src/assets/videocall.png" alt="A Yap Chat video call: a four person grid with a side panel for chat and emoji reactions" width="900"/>
</p>

<p align="center">
  <em>Four participants, screen sharing, live emoji reactions and the in-call side panel</em>
</p>

---

## Features

### Rooms and identity
- Email + password signup with JWT sessions (7 day expiry)
- Create rooms with a custom code (`WEEKEND-CREW`) or an auto-generated one
- Join by code, invite link (`/chat?join=CODE`) or scannable QR
- Leave rooms; the last room you used is remembered across reloads
- Profile with display name, bio and avatar (Cloudinary)

### Messaging
- Real-time one-to-one messaging inside a room, over Socket.IO
- Photo sharing, collected in the media panel
- **Voice notes** — record, pause mid-take, play back, then send or discard
- Delete for everyone; the message becomes a "this message was deleted" tombstone
  and the media is removed from Cloudinary
- Online/offline presence and unseen-message counts
- User search within the room

### Video calling
- Group calls for **up to 8 people**, peer-to-peer over WebRTC (mesh)
- Start a call from any chat — the other person gets a full-screen ring
- Or generate a standalone **call code** with its own QR and invite link
  (`/chat?call=CODE`)
- Mic and camera toggles, screen sharing
- In-call side panel: live chat, participant list, invite/QR
- Emoji reactions that float across every participant's grid
- Graceful degradation: no camera falls back to audio-only, no mic still joins
- Host handover if the person who started the call leaves

### Interface
- Animated landing page (GSAP) with a ScrollStack preview of the app
- Responsive from 320px up; the chat collapses to a single column on phones
- Custom cursor, glassmorphic UI, Tailwind CSS v4

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, React Router 7 |
| Animation | GSAP, Lenis (smooth scroll) |
| State | React Context (`AuthContext`, `ChatContext`, `CallContext`) |
| Realtime | Socket.IO (messaging + call signalling) |
| Media | WebRTC mesh (video/audio travel peer-to-peer) |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose |
| Uploads | Cloudinary (images, voice notes) |
| Auth | JWT + bcrypt |
| Hardening | helmet, express-rate-limit, CORS allowlist |

---

## Project structure

```
chat_app/
├── client/
│   ├── context/
│   │   ├── AuthContext.jsx      # session, socket connection, profile
│   │   ├── Chatcontext.jsx      # rooms, users, messages
│   │   └── CallContext.jsx      # WebRTC peers, call state, signalling
│   └── src/
│       ├── assets/              # images, icons, video
│       ├── components/
│       │   ├── Sidebar.jsx          RoomPanel.jsx     CallPanel.jsx
│       │   ├── ChatContainer.jsx    RightSidebar.jsx  AudioMessage.jsx
│       │   ├── VideoCall.jsx        VideoTile.jsx     IncomingCall.jsx
│       │   ├── ScrollStack.jsx      PillNav.jsx       CustomCursor.jsx
│       │   └── BackButton.jsx
│       ├── pages/               # LandingPage, HomePage, LoginPage,
│       │                        # ProfilePage, Terms
│       ├── App.jsx              # routes + global call overlays
│       └── main.jsx             # provider tree
│
├── server/
│   ├── controllers/             # userControler, messageController, roomController
│   ├── models/                  # User, Message, Room
│   ├── routes/                  # userRoutes, messageRoutes, roomRoutes
│   ├── middleware/auth.js       # JWT route guard
│   ├── lib/
│   │   ├── db.js                # Mongo connection
│   │   ├── utils.js             # token signing
│   │   ├── cloudinary.js        # upload config
│   │   └── videoCall.js         # call signalling (in-memory)
│   └── server.js                # express + socket.io bootstrap, hardening
│
└── _local-archive/              # retired assets, gitignored
```

---

## Getting started

### 1. Clone

```bash
git clone https://github.com/watermelon588/Yap-Chat.git
```

### 2. Backend

```bash
cd server && npm install && npm run dev
```

### 3. Frontend

```bash
cd client && npm install && npm run dev
```

The client runs on `http://localhost:5173`, the API on `http://localhost:5000`.

---

## Environment variables

### `server/.env`

```bash
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
JWT_SECRET=a_long_random_string_at_least_16_chars
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# production only - comma separated list of allowed origins.
# Leave unset in development and every origin is accepted.
CLIENT_URL=https://your-frontend.example.com
NODE_ENV=production
```

> The app connects to `${MONGODB_URI}/chat_app`, so leave the database name off
> the URI. The server refuses to boot if `JWT_SECRET` is missing or shorter than
> 16 characters.

### `client/.env`

```bash
VITE_BACKEND_URL=http://localhost:5000

# optional - only needed if peers sit behind symmetric NATs that STUN
# cannot traverse. Without TURN most, but not all, networks will connect.
VITE_TURN_URL=turn:your.turn.server:3478
VITE_TURN_USERNAME=xxx
VITE_TURN_CREDENTIAL=xxx
```

---

## How it works

### Messaging
1. Login returns a JWT, stored in `localStorage`.
2. The client opens a Socket.IO connection, passing the JWT in the handshake.
3. The server verifies the token and maps `userId -> socket.id`.
4. `POST /api/messages/send/:id` persists the message, then pushes it to the
   recipient's socket if they are online.

### Video calling
Media never touches the server — it only relays the handshake.

1. Caller emits `call:create`; the server mints a call code and rings invitees.
2. Invitees get `call:incoming` and answer with `call:join`.
3. The **joiner** offers to everyone already in the call. Negotiation is
   one-directional, so there is no glare to resolve.
4. Offers, answers and ICE candidates are relayed via `call:signal`.
5. Every peer connection always carries both an audio and a video m-line, even
   when the device has neither, so a participant without a camera cannot blank
   out video for everybody else.
6. Calls live in memory and disappear when the last person hangs up.

---

## Security

Hardening applied to this codebase:

| Area | Measure |
|---|---|
| Socket identity | The handshake requires a signed JWT. Identity comes from the token, never from a client-supplied `userId`. |
| Passwords | bcrypt (cost 10). Never returned by any endpoint. Minimum 8 characters, enforced server-side. |
| Login | Uniform "Invalid credentials" response and a dummy bcrypt compare on unknown emails, so accounts cannot be enumerated. |
| NoSQL injection | Every queried value is coerced to a string, so `{"$ne": null}` cannot turn a lookup into a wildcard. |
| Brute force | 20 attempts / 15 min on signup and login; 300 requests / min across the rest of the API. |
| Authorization | Messages can only be deleted by their sender and marked seen by their recipient. Room membership is checked on every message read and write. |
| Uploads | Images and audio must be browser `data:` URIs; remote URLs are refused so the upload endpoint cannot be used as a request proxy. |
| Mass assignment | Profile updates are built from an explicit field list. |
| Headers | `helmet` (nosniff, clickjacking protection, and friends). |
| CORS | Locked to `CLIENT_URL` in production. |
| Errors | Internal exception messages are logged, never returned to the client. |
| Secrets | `.env` is gitignored; the server refuses to start on a weak `JWT_SECRET`. |

---

## Testing

Verified against a live server, not just by inspection.

### Video call signalling — 20/20
Call creation and codes, ring delivery, join ordering, offer/answer relay
targeting, rejection of non-participant signalling, mute broadcast, side-panel
chat delivery and exactly-once echo, reactions, a third participant joining,
chat history for late joiners, leave broadcast, ghost removal on disconnect,
host handover, and unknown-code rejection.

### API security — 15/15
No password hash in signup or login responses, NoSQL operator rejection, weak
password rejection, security headers present, remote-URL upload rejection,
missing/forged token rejection, IDOR on mark-as-seen blocked, and login rate
limiting confirmed.

### WebRTC negotiation
Exercised through the real signalling path with canvas-generated media,
including the asymmetric case where one peer has no camera. Both directions
connect and decode.

### Responsive
No horizontal overflow at 320 / 375 / 414 / 768 / 1024 / 1280 / 1440 on the
landing, login, terms, profile and chat pages, including the three-column chat
layout.

---

## Deployment checklist

- [ ] Set `NODE_ENV=production` and `CLIENT_URL` on the API
- [ ] Use a long random `JWT_SECRET` (32+ chars); never reuse the dev one
- [ ] Serve both the frontend and API over **HTTPS** — `getUserMedia` is blocked
      on plain HTTP, so video calls silently fail without it
- [ ] Add a TURN server if you need reliable calls across restrictive networks
- [ ] Restrict the MongoDB Atlas IP allowlist to your host
- [ ] Rotate any credential that has been committed or shared

---

## Known limitations

- **Messages are not end-to-end encrypted.** They are stored in plain text and
  anyone holding a room code can join that room.
- **Video calls use a mesh**, so each participant uploads to every other. It is
  comfortable to about 8 people, which is why that is the cap. Beyond that you
  would want an SFU.
- **Calls are in-memory only.** A server restart ends every call in progress,
  and the app cannot be horizontally scaled without a shared adapter
  (e.g. `@socket.io/redis-adapter`).
- **`videocall.png` is ~1.3 MB.** Converting it to WebP/AVIF would cut the
  landing page payload noticeably.
- Rate limiting is per-process; behind multiple instances it needs a shared store.

---

## Author

**Rohit Maity** — building real-world projects with clean UI and scalable systems.
