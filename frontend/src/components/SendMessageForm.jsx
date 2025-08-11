import React, { useState } from "react";

export default function SendMessageForm({ onSend }) {
  const [text, setText] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await onSend(text);
    setText("");
  };

  return (
    <form onSubmit={submit} className="send-message-form">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message"
        style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
      />
      <button type="submit" style={{ marginLeft: 8, padding: "8px 12px", background: "#25d366", color: "#fff", border: "none", borderRadius: 6 }}>
        Send
      </button>
    </form>
  );
}
