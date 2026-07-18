import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './CustomCursor.css';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if device supports touch (custom cursor is not suitable for touch devices)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    setIsVisible(true);

    const onMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;

      // Instantly position the dot
      gsap.to(dotRef.current, {
        x: x,
        y: y,
        duration: 0,
        overwrite: 'auto'
      });

      // Smoothly animate the lagging ring
      gsap.to(ringRef.current, {
        x: x,
        y: y,
        duration: 0.15,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    const onMouseEnterWindow = () => {
      gsap.to([dotRef.current, ringRef.current], { opacity: 1, duration: 0.2 });
    };

    const onMouseLeaveWindow = () => {
      gsap.to([dotRef.current, ringRef.current], { opacity: 0, duration: 0.2 });
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseenter', onMouseEnterWindow);
    document.addEventListener('mouseleave', onMouseLeaveWindow);

    // Dynamic hover effects on all clickable elements
    const handleMouseEnterClickable = () => {
      gsap.to(ringRef.current, {
        scale: 1.6,
        backgroundColor: 'rgba(139, 92, 246, 0.12)',
        borderColor: 'rgba(139, 92, 246, 0.8)',
        borderWidth: '1.5px',
        duration: 0.2,
        ease: 'power1.out'
      });
      gsap.to(dotRef.current, {
        scale: 1.2,
        backgroundColor: '#7c3aed',
        duration: 0.2
      });
    };

    const handleMouseLeaveClickable = () => {
      gsap.to(ringRef.current, {
        scale: 1,
        backgroundColor: 'transparent',
        borderColor: 'rgba(139, 92, 246, 0.5)',
        borderWidth: '1.5px',
        duration: 0.2,
        ease: 'power1.out'
      });
      gsap.to(dotRef.current, {
        scale: 1,
        backgroundColor: '#8b5cf6',
        duration: 0.2
      });
    };

    const addHoverListeners = () => {
      const clickables = document.querySelectorAll(
        'a, button, input, textarea, select, [role="button"], .pill, .interactive-card, .pill-logo'
      );
      clickables.forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnterClickable);
        el.addEventListener('mouseleave', handleMouseLeaveClickable);
      });
    };

    // Add listeners on mount and also set up a MutationObserver to watch for dynamically added elements
    addHoverListeners();

    const observer = new MutationObserver(() => {
      addHoverListeners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnterWindow);
      document.removeEventListener('mouseleave', onMouseLeaveWindow);
      observer.disconnect();
      
      const clickables = document.querySelectorAll(
        'a, button, input, textarea, select, [role="button"], .pill, .interactive-card, .pill-logo'
      );
      clickables.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnterClickable);
        el.removeEventListener('mouseleave', handleMouseLeaveClickable);
      });
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  );
};

export default CustomCursor;
