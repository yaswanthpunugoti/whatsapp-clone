import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import "./App.css";

export default function App() {
  const [activeConversation, setActiveConversation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() =>
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className={`app${darkMode ? " dark" : ""}`}>
      {/* Sidebar */}
      <div className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <Sidebar
          onSelect={(conv) => {
            setActiveConversation(conv);
            setSidebarOpen(false);
          }}
          activeId={activeConversation?.wa_id}
        />
      </div>

      {/* Chat window */}
      <ChatWindow conversation={activeConversation} />

      {/* Buttons */}
      <button
        className="sidebar-toggle-btn"
        onClick={() => setSidebarOpen((open) => !open)}
      >
        ☰
      </button>

      <button
        className="theme-toggle-btn"
        onClick={() => setDarkMode((d) => !d)}
        aria-label="Toggle dark mode"
      >
        {darkMode ? "🌙" : "☀️"}
      </button>
    </div>
  );
}
