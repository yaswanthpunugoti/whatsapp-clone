import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Sidebar({ onSelect, activeId }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/conversations`);
        const data = await res.json();
        setConversations(data);
        if (!activeId && data.length) onSelect(data[0]);
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // run once

  return (
    <div className="sidebar">
      <h3>Chats</h3>
      {loading && <div>Loading...</div>}
      {conversations.length === 0 && !loading && <div>No conversations</div>}
      <div>
        {conversations.map((c) => {
          const last = c.lastMessage || {};
          return (
            <div
              key={c.wa_id}
              onClick={() => onSelect(c)}
              style={{
                padding: 8,
                cursor: "pointer",
                background: activeId === c.wa_id ? "#eee" : "transparent"
              }}
            >
              <div style={{ fontWeight: "600" }}>{last.name || c.wa_id}</div>
              <div style={{ color: "#666", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {last.text || ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
