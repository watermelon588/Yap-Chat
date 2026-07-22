import React from "react";
import { useNavigate } from "react-router-dom";

// shared back control - pass `to` for a fixed destination, leave it out to just
// step back through history
const BackButton = ({ to, label = "Back", iconOnly = false, className = "" }) => {
  const navigate = useNavigate();

  const goBack = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      onClick={goBack}
      title={label}
      aria-label={label}
      className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 hover:bg-white/20
        text-white/80 hover:text-white transition-colors cursor-pointer backdrop-blur-xl
        ${iconOnly ? "w-9 h-9 justify-center" : "py-2 px-4 text-xs"} ${className}`}
    >
      <i className="fa-solid fa-arrow-left text-xs"></i>
      {!iconOnly && <span>{label}</span>}
    </button>
  );
};

export default BackButton;
