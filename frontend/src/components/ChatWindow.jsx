import React, { useEffect, useState, useRef } from "react";
import MessageBubble from "./MessageBubble";
import SendMessageForm from "./SendMessageForm";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ChatWindow({ conversation }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    async function loadMessages() {
      setLoading(true);
      try {
        const encodedId = encodeURIComponent(conversation.wa_id);
        const res = await fetch(`${API}/api/conversations/${encodedId}/messages`);
        const data = await res.json();
        if (!cancelled) setMessages(data);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadMessages();

    // optional: refresh messages every 5s
    const t = setInterval(loadMessages, 5000);

    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [conversation]);

  useEffect(() => {
    // scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(text) {
    if (!conversation) return;
    try {
      const res = await fetch(`${API}/api/conversations/${encodeURIComponent(conversation.wa_id)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error("Send failed");
      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      // after sending, backend status will be 'sent' local; processor could update later
    } catch (err) {
      console.error("Send failed", err);
      alert("Failed to send message (see console)");
    }
  };

  if (!conversation) return <div className="chat-window">Select a chat</div>;

  return (
    <div className="chat-window">
      <div className="chat-header">{conversation.lastMessage?.name || conversation.wa_id}</div>

      <div className="messages" ref={scrollRef}>
        {loading && <div>Loading messages...</div>}
        {messages.map((m) => (
          <MessageBubble key={m._id || m.msg_id || Math.random()} message={m} />
        ))}
      </div>

      <SendMessageForm onSend={handleSend} />
    </div>
  );
}
