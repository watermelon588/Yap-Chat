import React from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0f0f1a] to-[#1a0f1f] text-white px-4 py-10">

      <div className="relative max-w-3xl w-full backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 shadow-xl">
        {/* 🔙 BACK BUTTON */}
        <img
          onClick={() => navigate("/")}
          src={assets.arrow_icon}
          alt="arrow"
          className=" max-w-5 max-h-6 m-1 cursor-pointer"
        />

        <h1 className=" text-center text-3xl font-semibold mb-6 bg-gradient-to-r from-orange-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Yap Chat — Terms & Privacy
        </h1>

        <p className="text-xs text-gray-500 text-center mb-10">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-[15px] leading-relaxed text-gray-300">

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">1. General Usage</h2>
            <p className="text-gray-400 leading-7">
              Yap Chat is a real-time messaging platform designed for casual conversations.
              By using this app, you agree to behave responsibly and not misuse the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">2. Public Chat Nature</h2>
            <p className="text-gray-400 leading-7">
              This application may include shared or general chat environments where multiple users can interact.
              Messages sent in such environments should be considered visible to others.
              Avoid sharing sensitive personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">3. Privacy & Security</h2>
            <p className="text-gray-400 leading-7">
              Yap Chat does not currently provide end-to-end encryption.
              While we take reasonable steps to protect your data, we cannot guarantee absolute security.
              Use the platform at your own discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">4. User Data</h2>
            <p className="text-gray-400 leading-7">
              We may store basic user data such as your name, profile image, and messages to provide core functionality.
              This data is not sold to third parties, but may be processed to improve the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">5. Media & Content</h2>
            <p className="text-gray-400 leading-7">
              Images and media uploaded are stored using third-party services (e.g., Cloudinary).
              Avoid uploading sensitive or personal content.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">6. User Responsibility</h2>
            <p className="text-gray-400 leading-7">
              You are responsible for the content you send. Any abusive, harmful, or illegal activity
              may result in restriction or removal from the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">7. Limitations</h2>
            <p className="text-gray-400 leading-7">
              Yap Chat is an evolving project. Features may change, break, or be removed at any time.
              We are not liable for data loss, message delays, or service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white/90 mb-2">8. Acceptance</h2>
            <p className="text-gray-400 leading-7">
              By continuing to use Yap Chat, you agree to these terms.
              If you do not agree, please discontinue use of the application.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default Terms;