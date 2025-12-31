import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const GeminiChatSidebar = ({ onUseInNote }) => {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi! I am your Gemini assistant. Ask me anything about your notes.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chat', {
        message: trimmed,
        history: newMessages.slice(0, -1),
      });

      const reply =
        (res.data && res.data.reply) ||
        'Sorry, I could not generate a response.';

      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Error talking to Gemini API.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUseInNote = (text) => {
    if (onUseInNote) {
      onUseInNote(text);
    }
  };

  if (!open) {
    return (
      <button
        className="chat-toggle-btn"
        type="button"
        onClick={() => setOpen(true)}
      >
        AI
      </button>
    );
  }

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <span>Gemini Assistant</span>
        <button
          type="button"
          className="chat-close-btn"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
      </div>

      <div className="chat-sidebar-messages">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={
              m.role === 'user'
                ? 'chat-msg chat-msg-user'
                : 'chat-msg chat-msg-assistant'
            }
          >
            <div>{m.content}</div>

            {m.role === 'assistant' && onUseInNote && (
              <button
                type="button"
                className="chat-insert-btn"
                onClick={() => handleUseInNote(m.content)}
              >
                Use in note
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-msg chat-msg-assistant">Thinking…</div>
        )}
      </div>

      <form className="chat-sidebar-input-row" onSubmit={handleSend}>
        <input
          className="chat-sidebar-input"
          placeholder="Ask Gemini…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default GeminiChatSidebar;
