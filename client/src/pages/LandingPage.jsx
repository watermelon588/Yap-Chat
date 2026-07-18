import React, { useContext, useEffect, useRef, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Authcontext } from '../../context/AuthContext';
import PillNav from '../components/PillNav';
import assets from '../assets/assets';

const LandingPage = () => {
  const { authUser, logout } = useContext(Authcontext);
  const navigate = useNavigate();

  // Animation Refs
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const heroButtonsRef = useRef(null);
  const chatMockupRef = useRef(null);
  const featuresRef = useRef(null);
  const statsSectionRef = useRef(null);

  // Stats State for Count-Up
  const [activeYappers, setActiveYappers] = useState(0);
  const [messagesSent, setMessagesSent] = useState(0);
  const [latency, setLatency] = useState(100);

  // Chat Mockup Messages State
  const [mockMessages, setMockMessages] = useState([
    { sender: 'other', text: 'Hey there! Have you tried YapChat yet?', time: '10:24 AM', visible: false },
    { sender: 'me', text: "Not yet, what's so special about it?", time: '10:24 AM', visible: false },
    { sender: 'other', text: 'It has lightning-fast real-time messaging and a gorgeous glass interface!', time: '10:25 AM', visible: false },
    { sender: 'me', text: 'Whoa, this layout looks incredibly premium. Signing up right now!', time: '10:25 AM', visible: false }
  ]);

  useEffect(() => {
    // 1. Hero Text and Buttons Entrance
    const tl = gsap.timeline();
    tl.fromTo(
      heroTitleRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo(
      heroSubtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo(
      heroButtonsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo(
      chatMockupRef.current,
      { opacity: 0, scale: 0.95, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.2'
    );

    // 2. Animate Chat Mockup Message Bubbles Sequentially
    let delay = 1.5;
    mockMessages.forEach((_, index) => {
      gsap.delayedCall(delay, () => {
        setMockMessages(prev => {
          const updated = [...prev];
          updated[index].visible = true;
          return updated;
        });

        // Bubble pop animation
        const bubble = document.querySelector(`#mock-bubble-${index}`);
        if (bubble) {
          gsap.fromTo(bubble, 
            { scale: 0.8, opacity: 0, y: 20 },
            { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' }
          );
        }
      });
      delay += 1.8;
    });

    // 3. Stats Count-Up Animation when stats section enters view
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const statsObj = { yappers: 0, messages: 0, ms: 100 };
            gsap.to(statsObj, {
              yappers: 12450,
              messages: 894520,
              ms: 38,
              duration: 2.5,
              ease: 'power2.out',
              onUpdate: () => {
                setActiveYappers(Math.floor(statsObj.yappers));
                setMessagesSent(Math.floor(statsObj.messages));
                setLatency(Math.floor(statsObj.ms));
              }
            });
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (statsSectionRef.current) {
      statsObserver.observe(statsSectionRef.current);
    }

    // 4. Features Grid Entrance Scroll Animation
    const featuresObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.feature-card');
            gsap.fromTo(
              cards,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' }
            );
            featuresObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) {
      featuresObserver.observe(featuresRef.current);
    }

    return () => {
      statsObserver.disconnect();
      featuresObserver.disconnect();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Setup Navbar Items depending on Auth Status
  const navItems = useMemo(() => {
    return authUser
      ? [
          { label: 'Home', href: '/' },
          { label: 'Chat Rooms', href: '/chat' },
          { label: 'My Profile', href: '/profile' }
        ]
      : [
          { label: 'Home', href: '/' },
          { label: 'Features', href: '#features' },
          { label: 'About', href: '#about' }
        ];
  }, [authUser]);

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden bg-[#07050f]/80 select-none pb-16">
      
      {/* Top Navbar */}
      <PillNav
        logo={assets.logo1}
        logoAlt="YapChat Logo"
        items={navItems}
        activeHref="/"
        className="mx-auto"
        baseColor="rgba(255, 255, 255, 0.08)"
        pillColor="rgba(124, 58, 237, 0.2)"
        hoveredPillTextColor="#ffffff"
        pillTextColor="rgba(255, 255, 255, 0.9)"
      />

      {/* Background Decorative HSL Glow Orbs */}
      <div className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-pink-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative z-10 pt-36 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        <div 
          ref={heroTitleRef}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6 text-sm text-purple-300 font-medium tracking-wide animate-pulse"
        >
          <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#8b5cf6]" />
          Introducing YapChat 2.0
        </div>

        <h1 
          ref={heroTitleRef}
          className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-white"
        >
          Connect. Converse.<br />
          <span className="text-violet-400">
            Yapping Reimagined.
          </span>
        </h1>

        <p 
          ref={heroSubtitleRef}
          className="text-base md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-light"
        >
          Step into a crystal-clear, real-time messaging universe. YapChat brings gorgeous glassmorphic interfaces, instantaneous sync, and vibrant profiles to your daily interactions.
        </p>

        <div ref={heroButtonsRef} className="flex flex-col sm:flex-row gap-4 mb-16 z-20">
          {authUser ? (
            <>
              <Link
                to="/chat"
                className="py-3 px-6 bg-violet-500/70 hover:bg-violet-600 border border-white/10 text-white text-sm font-medium rounded-lg cursor-pointer backdrop-blur-xl transition-all duration-300 flex items-center gap-2"
              >
                Go to Dashboard
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </Link>
              <button
                onClick={handleLogout}
                className="py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-lg cursor-pointer backdrop-blur-xl transition-all duration-300"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login?mode=signup"
                className="py-3 px-6 bg-violet-500/70 hover:bg-violet-600 border border-white/10 text-white text-sm font-medium rounded-lg cursor-pointer backdrop-blur-xl transition-all duration-300 flex items-center gap-2"
              >
                Get Started
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/login?mode=login"
                className="py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-lg cursor-pointer backdrop-blur-xl transition-all duration-300 text-center"
              >
                Login Now
              </Link>
            </>
          )}
        </div>

        {/* Live Interface Preview / Interactive Mockup */}
        <div 
          ref={chatMockupRef}
          className="w-full max-w-4xl mx-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_24px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Mock Window Header */}
          <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="text-xs text-slate-500 font-mono tracking-wider uppercase">YapChat Live Demo</div>
            <div className="w-12" />
          </div>

          {/* Mock Chat Screen Layout */}
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] h-[450px]">
            {/* Sidebar Mockup */}
            <div className="hidden md:flex flex-col bg-white/2 border-r border-white/5 p-4 text-left">
              <div className="h-8 rounded bg-white/5 mb-4 flex items-center px-3 text-xs text-slate-500">
                Search conversations...
              </div>
              <div className="flex flex-col gap-2">
                <div className="p-2 rounded bg-violet-500/10 border border-violet-500/20 flex items-center gap-3">
                  <div className="relative">
                    <img src={assets.profile_alison} className="w-9 h-9 rounded-full object-cover" alt="" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold truncate text-violet-300">Alison Martin</h4>
                    <p className="text-[10px] text-slate-500 truncate">Typing a message...</p>
                  </div>
                </div>
                {[
                  { name: 'Richard Smith', img: assets.profile_richard, status: 'online' },
                  { name: 'Enrique Martinez', img: assets.profile_enrique, status: 'offline' },
                  { name: 'Marco Jones', img: assets.profile_marco, status: 'online' }
                ].map((item, idx) => (
                  <div key={idx} className="p-2 rounded hover:bg-white/5 flex items-center gap-3 transition-all duration-200">
                    <div className="relative">
                      <img src={item.img} className="w-9 h-9 rounded-full object-cover opacity-80" alt="" />
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-slate-900 rounded-full ${item.status === 'online' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium truncate text-slate-300">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate">Click to open chat</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Body Mockup */}
            <div className="flex flex-col h-full bg-white/1 text-left relative">
              {/* Header */}
              <div className="px-4 py-3 bg-white/2 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={assets.profile_alison} className="w-8 h-8 rounded-full object-cover" alt="" />
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">Alison Martin</h3>
                    <p className="text-[10px] text-emerald-400">Active now</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
              </div>

              {/* Chat Scroll Area */}
              <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
                {mockMessages.map((msg, i) => (
                  <div
                    key={i}
                    id={`mock-bubble-${i}`}
                    className={`flex flex-col max-w-[75%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start'}`}
                    style={{ display: msg.visible ? 'flex' : 'none' }}
                  >
                    <div 
                      className={`px-3 py-2.5 rounded-lg text-xs leading-relaxed ${
                        msg.sender === 'me' 
                          ? 'bg-violet-500/30 text-white rounded-tr-none' 
                          : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Input Area Mockup */}
              <div className="p-3 border-t border-white/5 bg-white/2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center cursor-pointer">
                  <img src={assets.gallery_icon} className="w-3.5 h-3.5 opacity-60" alt="" />
                </div>
                <div className="flex-1 h-8 rounded-full bg-white/5 border border-white/10 px-4 text-xs flex items-center text-slate-400">
                  Write your message...
                </div>
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer">
                  <img src={assets.send_button} className="w-3.5 h-3.5" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" ref={featuresRef} className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Vibrant Features, Redefined.
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base font-light">
            Every pixel is tuned to provide an unparalleled social chat platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Real-time Sync',
              desc: 'Sub-millisecond messaging built on custom web sockets. Keep typing seamlessly.',
              icon: <i className="fa-solid fa-bolt text-violet-400"></i>
            },
            {
              title: 'Rich Media Sharing',
              desc: 'Instantly send photos, videos, and custom attachments with compression filters.',
              icon: <i className="fa-solid fa-photo-film text-violet-400"></i>
            },
            {
              title: 'Dynamic Profiles',
              desc: 'Customize your bio, upload avatars, and manage your online status dynamically.',
              icon: <i className="fa-solid fa-user-pen text-violet-400"></i>
            },
            {
              title: 'Security Guaranteed',
              desc: 'Strict session token validation keeps your chats secure and protected.',
              icon: <i className="fa-solid fa-shield-halved text-violet-400"></i>
            }
          ].map((card, i) => (
            <div
              key={i}
              className="feature-card opacity-0 p-6 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-300 flex flex-col gap-4 text-left group hover:scale-[1.03]"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-200 group-hover:text-purple-300 transition-colors duration-200">
                {card.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Counter Section */}
      <section ref={statsSectionRef} className="relative z-10 py-16 bg-white/2 border-y border-white/5 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-black text-violet-400 mb-2">
              {activeYappers >= 1000 ? `${(activeYappers / 1000).toFixed(1)}k+` : activeYappers}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Active Yappers</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-fuchsia-400 mb-2">
              {messagesSent >= 1000000 ? `${(messagesSent / 1000000).toFixed(1)}M+` : messagesSent.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Messages Exchanged</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-pink-400 mb-2">
              &lt; {latency}ms
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Instant Latency</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-24 px-6 max-w-4xl mx-auto text-center">
        <div className="p-8 md:p-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />
          <h2 className="text-2xl md:text-4xl font-bold mb-6 text-slate-100">About YapChat</h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 font-light">
            YapChat was built for yappers who love premium interfaces and instant gratification. Created with state-of-the-art React state architecture, socket routing, and high-performance GSAP physics animations. Experience social chatting the way it was always meant to be.
          </p>
          <Link
            to={authUser ? "/chat" : "/login?mode=signup"}
            className="inline-flex items-center gap-2 py-3 px-6 bg-violet-500/70 hover:bg-violet-600 border border-white/10 text-white text-sm font-medium rounded-lg cursor-pointer backdrop-blur-xl transition-all duration-300"
          >
            {authUser ? "Return to Chat" : "Create Free Account"}
            <i className="fa-solid fa-arrow-right text-xs"></i>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 pt-16 border-t border-white/5 max-w-6xl mx-auto px-6 text-center text-slate-500 text-xs">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <img src={assets.logo1} className="w-5 h-5 object-contain" alt="" />
            <span className="font-bold text-slate-300">YapChat</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
            <a href="#about" className="hover:text-slate-300 transition-colors">About</a>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Use</Link>
          </div>
        </div>
        <p>&copy; {new Date().getFullYear()} YapChat. Designed with <i className="fa-solid fa-heart text-rose-500 mx-0.5"></i> by Rohit Maity.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
