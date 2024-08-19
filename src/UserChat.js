import React, { useState, useEffect, useRef } from 'react';

function UserChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wss = useRef(null);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wss.current) {
        wss.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wssss' : 'wsss';
    // const wssUrl = `${protocol}://watch-dog-llm.vercel.app`;
    // const wssUrl = "https://watch-dog-llm.vercel.app";
    const wssUrl = "http://54.252.184.92:5000";
    wss.current = new WebSocket(wssUrl);

    wss.current.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    wss.current.onmessage = (event) => {
      console.log('Received message:', event.data);
      setMessages((prevMessages) => [...prevMessages, { role: 'bot', content: event.data }]);
    };

    wss.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    wss.current.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
      setTimeout(connectWebSocket, 5000);
    };
  };

  const sendMessage = () => {
    if (input.trim() === '' || !isConnected) return;

    console.log('Sending message:', input);
    setMessages((prevMessages) => [...prevMessages, { role: 'user', content: input }]);
    wss.current.send(input);
    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={isConnected ? "Type your message..." : "Connecting..."}
          disabled={!isConnected}
        />
        <button onClick={sendMessage} disabled={!isConnected}>Send</button>
      </div>
    </div>
  );
}

export default UserChat;
