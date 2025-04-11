import React, { useState } from "react"; // <- React import added
import "./index.css";

export default function App() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [file, setFile] = useState(null);
  const [uploadResponse, setUploadResponse] = useState("");

  const handleSend = async () => {
    try {
      const res = await fetch("https://b8ta-backend.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setReply(data.reply);
    } catch (err) {
      console.error("Chat error:", err);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("https://b8ta-backend.onrender.com/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadResponse(data.insights);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">b8ta</div>
        <a href="#" className="signin">sign in</a>
      </header>

      <main className="main-content">
        <h1>Your AI CFO</h1>
        <p>
          b8ta turns your financial data into personalized advice—analyze spending, maximize tax efficiency, and optimize cash.
        </p>

        <div className="chat-container">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can I help?"
            className="chat-input"
          />
          <button onClick={handleSend} className="chat-btn">
            How can I help?
          </button>
          {reply && <p className="reply">💬 {reply}</p>}
        </div>

        <div className="file-container">
          <input
            type="file"
            accept=".txt,.csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input"
          />
          <button onClick={handleFileUpload} className="file-btn">
            Analyze Your File
          </button>
          {uploadResponse && (
            <div className="upload-response">
              <strong>Insights:</strong>
              <p>{uploadResponse}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        © 2025 Summit Growth LLC. All rights reserved.
      </footer>
    </div>
  );
}
