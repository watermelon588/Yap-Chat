import React from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4 py-10">

      <div className="relative max-w-3xl w-full backdrop-blur-3xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 shadow-xl ">
        {/* 🔙 BACK BUTTON */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <BackButton />
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 py-2 px-4 text-xs rounded-full border border-white/15 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-house text-xs"></i>
            Home
          </button>
        </div>

        <h1 className=" text-center text-3xl font-semibold mb-6 bg-gradient-to-r from-orange-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Yap Chat — Terms & Privacy
        </h1>

        <p className="text-xs text-gray-500 text-center mb-10">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-2 text-[15px] leading-relaxed text-gray-300">
          <div className="relative max-w-3xl w-full md:p-10 shadow-xl max-h-[55vh] overflow-y-auto">
          

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">
              <i className="fa-solid fa-circle-info mr-2 text-violet-400"></i>1. General Usage
            </h2>
            <p className="text-gray-400 leading-7">
              Yap Chat is a real-time messaging platform built around private rooms. By using the app
              you agree to behave responsibly and not to misuse the platform or the people in it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">
              <i className="fa-solid fa-key mr-2 text-violet-400"></i>2. Rooms &amp; Room Codes
            </h2>
            <p className="text-gray-400 leading-7">
              Conversations live inside rooms. Each room has a code — either one you chose or one we
              generated — and <span className="text-white/80">anyone holding that code can join the room</span>,
              including through a QR code or invite link. There is no approval step and no per-member
              ban. Treat a room code like a door key: share it only with people you want in the room,
              and start a new room if a code gets out.
            </p>
            <p className="text-gray-400 leading-7 mt-2">
              Once someone joins, they can see the other members of that room and message them
              directly. Leaving a room removes you from its member list, but messages you already
              sent remain with the people you sent them to.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">
              <i className="fa-solid fa-lock-open mr-2 text-violet-400"></i>3. No End-to-End Encryption
            </h2>
            <p className="text-gray-400 leading-7">
              Yap Chat does <span className="text-white/80">not</span> provide end-to-end encryption.
              Messages, images and voice notes are stored in plain form on our database and media
              provider, which means whoever operates the service is technically able to read them.
              Please do not use Yap Chat for passwords, financial details, medical information or
              anything else you would not want stored unencrypted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">
              <i className="fa-solid fa-database mr-2 text-violet-400"></i>4. What We Store
            </h2>
            <p className="text-gray-400 leading-7">
              To make the app work we keep: your email address, display name, bio and profile picture;
              your rooms and their membership; and the messages you send — text, images and voice
              notes — along with their timestamps and read status. Passwords are stored only as a
              bcrypt hash and are never readable, by us or anyone else.
            </p>
            <p className="text-gray-400 leading-7 mt-2">
              Your login session is a signed token held in your browser's local storage. Logging out
              clears it from that device. We do not sell your data, and we do not run advertising or
              third-party analytics on it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">
              <i className="fa-solid fa-cloud-arrow-up mr-2 text-violet-400"></i>5. Media &amp; Voice Notes
            </h2>
            <p className="text-gray-400 leading-7">
              Images and voice recordings are uploaded to Cloudinary, a third-party media host, and
              are served from public URLs. That means{' '}
              <span className="text-white/80">anyone who has the direct link to a file can open it,
              even without a Yap Chat account</span>. Voice notes are only recorded while you are
              holding the recorder open, you can play a recording back and discard it before sending,
              and nothing is uploaded until you press send.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">
              <i className="fa-solid fa-microphone mr-2 text-violet-400"></i>6. Microphone &amp; Camera Access
            </h2>
            <p className="text-gray-400 leading-7">
              Recording a voice note asks your browser for microphone permission. The microphone is
              opened only for the duration of a recording and released as soon as you send, pause or
              cancel. Yap Chat never records in the background and does not use your camera.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">
              <i className="fa-solid fa-user-shield mr-2 text-violet-400"></i>7. Your Responsibility
            </h2>
            <p className="text-gray-400 leading-7">
              You are responsible for the content you send and for who you hand your room codes to.
              Abusive, harmful or illegal activity may result in restriction or removal from the
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">
              <i className="fa-solid fa-trash-can mr-2 text-violet-400"></i>8. Deleting Your Data
            </h2>
            <p className="text-gray-400 leading-7">
              The app does not yet include a self-serve delete-account button. If you want your
              account, messages and uploaded media removed, contact the maintainer and it will be
              deleted from the database and the media host.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">
              <i className="fa-solid fa-triangle-exclamation mr-2 text-violet-400"></i>9. Limitations
            </h2>
            <p className="text-gray-400 leading-7">
              Yap Chat is an evolving personal project, not a hardened commercial service. Features
              may change, break or be removed at any time, and we are not liable for data loss,
              message delays or service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">
              <i className="fa-solid fa-circle-check mr-2 text-violet-400"></i>10. Acceptance
            </h2>
            <p className="text-gray-400 leading-7">
              By continuing to use Yap Chat, you agree to these terms. If you do not agree, please
              discontinue use of the application.
            </p>
          </section>
        </div>
        </div>

      </div>
    </div>
  );
};

export default Terms;