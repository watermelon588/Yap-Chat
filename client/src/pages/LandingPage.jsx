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

  // Chat Mockup Messages State
  const [mockMessages, setMockMessages] = useState([
    { sender: 'other', text: 'Made us a room — the code is YAP-42. Nobody else can see it.', time: '10:24 AM', visible: false },
    { sender: 'me', text: 'Joined. That QR on the invite screen is a nice touch.', time: '10:24 AM', visible: false },
    { sender: 'other', type: 'voice', text: '0:07', time: '10:25 AM', visible: false },
    { sender: 'me', text: 'Voice notes too? Alright, I am moving the group over.', time: '10:25 AM', visible: false }
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

    // 3. "How it works" steps slide in when the section enters view
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const steps = entry.target.querySelectorAll('.step-card');
            gsap.fromTo(
              steps,
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' }
            );
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
          <i className="fa-solid fa-key text-[10px]"></i>
          Private rooms &amp; voice notes are live
        </div>

        <h1
          ref={heroTitleRef}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-white"
        >
          Your room.<br />
          <span className="text-violet-400">
            Your code. Your people.
          </span>
        </h1>

        <p
          ref={heroSubtitleRef}
          className="text-base md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-light"
        >
          YapChat is no longer one big room for everyone. Create a room, pick your own code or let us
          generate one, then share it as text or a QR. Only the people holding that code show up in
          your sidebar — where you can trade messages, photos and voice notes in real time.
        </p>

        <div ref={heroButtonsRef} className="flex flex-col sm:flex-row gap-4 mb-16 z-20">
          {authUser ? (
            <>
              <Link
                to="/chat"
                className="py-3 px-6 bg-violet-500/70 hover:bg-violet-600 border border-white/10 text-white text-sm font-medium rounded-lg cursor-pointer backdrop-blur-xl transition-all duration-300 flex items-center gap-2"
              >
                <i className="fa-solid fa-comments"></i>
                Go to my rooms
                <i className="fa-solid fa-angles-right text-xs"></i>
              </Link>
              <button
                onClick={handleLogout}
                className="py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-lg cursor-pointer backdrop-blur-xl transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <i className="fa-solid fa-right-from-bracket text-xs"></i>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login?mode=signup"
                className="py-3 px-6 bg-violet-500/70 hover:bg-violet-600 border border-white/10 text-white text-sm font-medium rounded-lg cursor-pointer backdrop-blur-xl transition-all duration-300 flex items-center gap-2"
              >
                <i className="fa-solid fa-user-plus text-xs"></i>
                Create a room
                <i className="fa-solid fa-angle-right text-xs"></i>
              </Link>
              <Link
                to="/login?mode=login"
                className="py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium rounded-lg cursor-pointer backdrop-blur-xl transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <i className="fa-solid fa-right-to-bracket text-xs"></i>
                I have a code
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
              {/* active room chip */}
              <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 mb-3">
                <p className="text-[9px] uppercase tracking-wider text-slate-500">Room</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-200 truncate">Weekend Crew</p>
                  <i className="fa-solid fa-qrcode text-[11px] text-slate-400"></i>
                </div>
                <span className="inline-block mt-1 text-[9px] tracking-[0.2em] text-violet-300 bg-violet-500/20 border border-white/10 rounded-full px-2 py-0.5">
                  YAP-42
                </span>
              </div>
              <div className="h-8 rounded bg-white/5 mb-4 flex items-center px-3 text-xs text-slate-500">
                Search user...
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
                      {msg.type === 'voice' ? (
                        <span className="flex items-center gap-2.5 min-w-[140px]">
                          <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-play text-[8px]"></i>
                          </span>
                          <span className="flex-1 h-1 rounded-full bg-white/25 relative">
                            <span className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-white/70" />
                          </span>
                          <span className="text-[10px] text-slate-300">{msg.text}</span>
                        </span>
                      ) : (
                        msg.text
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Input Area Mockup */}
              <div className="p-3 border-t border-white/5 bg-white/2 flex items-center gap-2">
                <div className="flex-1 h-8 rounded-full bg-white/5 border border-white/10 px-4 text-xs flex items-center justify-between text-slate-400">
                  Write your message...
                  <img src={assets.gallery_icon} className="w-3.5 h-3.5 opacity-60" alt="" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center cursor-pointer">
                  <i className="fa-solid fa-microphone text-[11px] text-slate-300"></i>
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
            Everything in the app, right now.
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm md:text-base font-light">
            No roadmap promises — this is what YapChat actually does today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Rooms, Not One Feed',
              desc: 'Each room is its own world. You only see the members of the room you are currently in.',
              icon: <i className="fa-solid fa-door-closed text-violet-400"></i>
            },
            {
              title: 'Pick Your Own Code',
              desc: 'Choose a memorable code like WEEKEND-CREW, or let YapChat generate a clean one for you.',
              icon: <i className="fa-solid fa-key text-violet-400"></i>
            },
            {
              title: 'Invite by QR',
              desc: 'Every room has a scannable QR. Point a camera at it and you land straight in the room.',
              icon: <i className="fa-solid fa-qrcode text-violet-400"></i>
            },
            {
              title: 'Voice Notes',
              desc: 'Hold a thought, record it. Pause mid-take, play it back, then send it — or bin it.',
              icon: <i className="fa-solid fa-microphone-lines text-violet-400"></i>
            },
            {
              title: 'Photo Sharing',
              desc: 'Drop images into any chat. Everything you have shared collects in the media panel.',
              icon: <i className="fa-solid fa-image text-violet-400"></i>
            },
            {
              title: 'Real-time Delivery',
              desc: 'Socket-backed messaging, so replies land the moment they are sent. No refreshing.',
              icon: <i className="fa-solid fa-bolt text-violet-400"></i>
            },
            {
              title: 'Presence & Unread',
              desc: 'See who is online right now, and catch unread counts on everyone you have missed.',
              icon: <i className="fa-solid fa-signal text-violet-400"></i>
            },
            {
              title: 'Built for Your Phone',
              desc: 'The full app scales down to a phone screen — same rooms, same voice notes, same QR.',
              icon: <i className="fa-solid fa-mobile-screen-button text-violet-400"></i>
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

      {/* How It Works Section */}
      <section ref={statsSectionRef} className="relative z-10 py-16 md:py-20 bg-white/2 border-y border-white/5 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-3">
              Four steps to a private room
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-light">
              From signing up to your first message in under a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Create your account',
                desc: 'Name, email, a short bio and a profile picture. That is the whole signup.',
                icon: 'fa-user-plus'
              },
              {
                step: '02',
                title: 'Spin up a room',
                desc: 'Name it, then type your own code or leave it blank for a generated one.',
                icon: 'fa-key'
              },
              {
                step: '03',
                title: 'Share code or QR',
                desc: 'Copy the code, copy the invite link, or let people scan the room QR.',
                icon: 'fa-qrcode'
              },
              {
                step: '04',
                title: 'Start yapping',
                desc: 'Everyone who joined shows up in your sidebar. Text, photos, voice notes.',
                icon: 'fa-comments'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="step-card opacity-0 relative p-6 rounded-2xl border border-white/5 bg-white/2 hover:border-violet-500/30 transition-all duration-300 text-left"
              >
                <span className="absolute top-4 right-5 text-3xl font-black text-white/5 select-none">
                  {item.step}
                </span>
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <i className={`fa-solid ${item.icon} text-violet-400`}></i>
                </div>
                <h3 className="text-base font-bold text-slate-200 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-24 px-6 max-w-4xl mx-auto text-center">
        <div className="p-8 md:p-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />
          <h2 className="text-2xl md:text-4xl font-bold mb-6 text-slate-100">About YapChat</h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6 font-light">
            YapChat started as one shared room for everybody. It is now built around private,
            code-based rooms: you decide who gets the code, and nobody outside it can see your
            sidebar or your messages. Under the hood it is React and Tailwind on the front,
            Express, MongoDB and Socket.IO on the back, with Cloudinary handling photos and voice notes.
          </p>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-8 font-light">
            <i className="fa-solid fa-circle-info mr-2 text-violet-400"></i>
            Worth knowing: messages are not end-to-end encrypted, and anyone holding a room code can
            join that room. Treat your code like a door key — the{' '}
            <Link to="/terms" className="text-violet-400 hover:underline">terms &amp; privacy page</Link>{' '}
            spells out exactly what is stored.
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
          <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
            <a href="#features" className="hover:text-slate-300 transition-colors">
              <i className="fa-solid fa-layer-group mr-1.5"></i>Features
            </a>
            <a href="#about" className="hover:text-slate-300 transition-colors">
              <i className="fa-solid fa-circle-info mr-1.5"></i>About
            </a>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">
              <i className="fa-solid fa-shield-halved mr-1.5"></i>Terms &amp; Privacy
            </Link>
          </div>
        </div>
        <p>&copy; {new Date().getFullYear()} YapChat. Designed with <i className="fa-solid fa-heart text-rose-500 mx-0.5"></i> by Rohit Maity.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
