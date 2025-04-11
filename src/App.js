import React, { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [file, setFile] = useState(null);
  const [uploadResponse, setUploadResponse] = useState('');

  const handleChat = async () => {
    const res = await fetch('https://b8ta-backend.onrender.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    setChatResponse(data.reply);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('https://b8ta-backend.onrender.com/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    setUploadResponse(data.insights);
  };

  return (
    <div className="App" style={{ maxWidth: '600px', margin: 'auto', padding: '2rem' }}>
      <h1>B8ta Bot</h1>
      <p>Ask questions about finance, accounting, taxes, or legal topics</p>

      <div className="chatbox" style={{ marginBottom: '2rem' }}>
        <textarea
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask your question here..."
          style={{ width: '100%', padding: '10px' }}
        />
        <button onClick={handleChat} style={{ marginTop: '10px' }}>Ask B8ta</button>
        {chatResponse && <div className="response" style={{ marginTop: '1rem' }}>{chatResponse}</div>}
      </div>

      <hr />

      <div className="uploader" style={{ marginTop: '2rem' }}>
        <h3>Upload a financial document (.csv or .txt)</h3>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload} style={{ marginTop: '10px' }}>Upload & Analyze</button>
        {uploadResponse && <div className="response" style={{ marginTop: '1rem' }}>{uploadResponse}</div>}
      </div>
    </div>
  );
}

export default App;