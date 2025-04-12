// /frontend/components/chat.js

import { useEffect, useState, useRef } from 'react';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const sessionId = useRef(
    sessionStorage.getItem('sessionId') || crypto.randomUUID()
  );

  useEffect(() => {
    sessionStorage.setItem('sessionId', sessionId.current);
    const history = sessionStorage.getItem('chatHistory');
    if (history) setMessages(JSON.parse(history));
  }, []);

  useEffect(() => {
    if (chatContainerRef.current)
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSend = async () => {
    if (!input && !file) return;
    setIsLoading(true);

    const updatedMessages = [...messages];
    let parsedFileText = '';

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const { parsedText } = await uploadRes.json();
      parsedFileText = parsedText;
      updatedMessages.push({ role: 'user', content: `Here’s a file I uploaded:\n${parsedText}` });
    }

    if (input) {
      updatedMessages.push({ role: 'user', content: input });
    }

    setMessages(updatedMessages);
    setInput('');
    setFile(null);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updatedMessages, sessionId: sessionId.current }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullReply = '';
    const streamMessage = { role: 'assistant', content: '' };
    const streamUpdate = [...updatedMessages, streamMessage];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      fullReply += chunk;
      streamMessage.content += chunk;
      setMessages([...streamUpdate]);
    }

    setMessages([...updatedMessages, { role: 'assistant', content: fullReply }]);
    sessionStorage.setItem('chatHistory', JSON.stringify([...updatedMessages, { role: 'assistant', content: fullReply }]));
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <div
        className="flex-1 overflow-y-auto space-y-4 bg-gray-50 p-4 rounded-md"
        ref={chatContainerRef}
      >
        {messages.map((msg, i) => (
          <div key={i} className={`text-${msg.role === 'user' ? 'right' : 'left'}`}>
            <div
              className={`inline-block px-4 py-2 rounded-lg max-w-xl whitespace-pre-wrap ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center space-x-2">
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.csv,.xlsx,.xls"
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
        />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 p-2 border rounded-md"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="px-4 py-2 bg-black text-white rounded-md"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
