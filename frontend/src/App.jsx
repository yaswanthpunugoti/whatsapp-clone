import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import "./App.css";

export default function App() {
  const [activeConversation, setActiveConversation] = useState(null);

  return (
    <div className="app">
      <Sidebar onSelect={(conv) => setActiveConversation(conv)} activeId={activeConversation?.wa_id} />
      <ChatWindow conversation={activeConversation} />
    </div>
  );
}
