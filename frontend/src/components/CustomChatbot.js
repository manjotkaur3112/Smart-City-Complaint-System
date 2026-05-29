import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function CustomChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your AI Civic Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Generate a random session ID once
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      // POST to the n8n webhook
      const res = await axios.post('https://admin91.app.n8n.cloud/webhook/9a092ef6-a1af-4f8c-bc3a-6fc8fce4bbb0/chat', {
        action: 'sendMessage',
        sessionId: sessionId,
        chatInput: userText,
      });

      let botResponse = 'Received your message.';
      if (res.data && res.data.output) {
        botResponse = res.data.output;
      } else if (Array.isArray(res.data) && res.data[0]?.output) {
        botResponse = res.data[0].output;
      } else if (res.data && typeof res.data === 'string') {
        botResponse = res.data;
      }

      // Strip "Per the database," from the response if present
      botResponse = botResponse.replace(/^Per the database,?\s*/i, "");

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am currently unavailable to answer that.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div style={styles.chatPanel}>
          <div style={styles.chatHeader}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Civic AI Assistant</h3>
            <button style={styles.chatCloseBtn} onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div style={styles.chatBody}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ ...styles.messageRow, justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ ...styles.messageBubble, background: msg.sender === 'user' ? '#4f8ef7' : '#2d3748' }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
                <div style={{ ...styles.messageBubble, background: '#2d3748', fontStyle: 'italic', opacity: 0.7 }}>
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} style={styles.chatFooter}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={styles.chatInput}
              disabled={loading}
            />
            <button type="submit" style={styles.chatSendBtn} disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      <button style={styles.chatbotButton} aria-label="Chatbot" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'}
      </button>
    </>
  );
}

const styles = {
  chatPanel: { position: "fixed", right: 20, bottom: 140, width: 350, height: 500, background: "#131629", borderRadius: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.5)", zIndex: 300, overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid rgba(79,142,247,0.3)", maxWidth: "calc(100vw - 40px)", maxHeight: "calc(100vh - 160px)" },
  chatHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "linear-gradient(135deg, #4f8ef7, #7c3aed)" },
  chatCloseBtn: { background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem", padding: 0 },
  chatBody: { flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 },
  messageRow: { display: "flex", width: "100%" },
  messageBubble: { padding: "10px 14px", borderRadius: 12, color: "#fff", maxWidth: "80%", fontSize: "0.95rem", lineHeight: 1.4 },
  chatFooter: { display: "flex", padding: 12, background: "#1a1d30", borderTop: "1px solid rgba(255,255,255,0.06)" },
  chatInput: { flex: 1, padding: "10px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none", fontSize: "0.95rem" },
  chatSendBtn: { background: "#4f8ef7", color: "#fff", border: "none", borderRadius: 20, padding: "0 16px", marginLeft: 8, cursor: "pointer", fontWeight: 600 },
  chatbotButton: { position: "fixed", right: 20, bottom: 80, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", width: 50, height: 50, background: "#4f8ef7", color: "#fff", borderRadius: "50%", boxShadow: "0 10px 25px rgba(79,142,247,0.3)", border: "none", cursor: "pointer", fontSize: "1.4rem", transition: "transform 0.2s ease" },
};
