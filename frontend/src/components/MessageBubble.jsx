import React from "react";

export default function MessageBubble({ message }) {
  const outbound = message.direction === "outbound" || message.direction === "out";
  const text = message.text || "(non-text)";
  const ts = message.timestamp ? new Date(message.timestamp) : new Date(message.createdAt || Date.now());
  return (
    <div style={{ display: "flex", justifyContent: outbound ? "flex-end" : "flex-start" }}>
      <div style={{
        background: outbound ? "#dcf8c6" : "#ffffff",
        padding: "10px 12px",
        borderRadius: 8,
        maxWidth: "60%",
        marginBottom: 8,
        boxShadow: "0 1px 0 rgba(0,0,0,0.06)"
      }}>
        <div style={{ marginBottom: 6 }}>{text}</div>
        <div style={{ fontSize: 11, color: "#666", textAlign: "right" }}>{ts.toLocaleString()}</div>
      </div>
    </div>
  );
}
