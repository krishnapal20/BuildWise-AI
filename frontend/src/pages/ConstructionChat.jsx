import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
};

export default function ConstructionChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your construction AI assistant. How can I help you today?",
      timestamp: formatTime(new Date()),
      type: 'general',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (actionType = 'ask') => {
    const text = inputText.trim();
    if (!text || loading) return;

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: formatTime(new Date()),
      type: actionType,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/chat/message', {
        message: text,
        action: actionType,
        type: actionType,
      });

      const replyContent =
        response.data?.response ||
        response.data?.message ||
        response.data?.content ||
        response.data?.reply ||
        JSON.stringify(response.data);

      const aiMessage = {
        role: 'assistant',
        content: replyContent,
        timestamp: formatTime(new Date()),
        type: actionType,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat request failed:', err);
      let errMsg = 'Failed to get a response from the assistant. Please verify backend connection and try again.';
      if (typeof err.response?.data?.detail === 'string') {
        errMsg = err.response.data.detail;
      } else if (Array.isArray(err.response?.data?.detail)) {
        errMsg = err.response.data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
      } else if (err.response?.data?.message) {
        errMsg = String(err.response.data.message);
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error: ${errMsg}`,
          timestamp: formatTime(new Date()),
          type: 'error',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage('ask');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 128px)' }}>
      <h1 className="page-title" style={{ marginBottom: '16px' }}>
        AI Chat
      </h1>

      {/* Main Chat Box Container */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          marginBottom: 0,
        }}
      >
        {/* Messages Scroll Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: '#f8fafc',
          }}
        >
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '8px',
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#eef2ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      flexShrink: 0,
                      border: '1px solid #c7d2fe',
                    }}
                  >
                    🤖
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '75%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      background: isUser
                        ? 'linear-gradient(135deg, #4f46e5, #4338ca)'
                        : '#ffffff',
                      color: isUser ? '#ffffff' : '#1e293b',
                      padding: '12px 18px',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                      border: isUser ? 'none' : '1px solid #e2e8f0',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.5,
                      fontSize: '0.96rem',
                    }}
                  >
                    {msg.content}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      marginTop: '4px',
                      padding: '0 4px',
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'center',
                    }}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.type && msg.type !== 'general' && (
                      <span style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>
                        • {msg.type}
                      </span>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#4f46e5',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    👤
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}
              >
                🤖
              </div>
              <div
                style={{
                  background: '#ffffff',
                  padding: '12px 18px',
                  borderRadius: '16px 16px 16px 2px',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#4f46e5',
                    animation: 'spin 1s infinite linear',
                  }}
                />
                BuildWise AI is thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: '16px 24px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          {error && (
            <div
              className="error-message"
              style={{ margin: '0 0 12px 0', padding: '8px 12px', fontSize: '0.85rem' }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Ask a technical construction question, request recommendations, or request reports..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{ flex: 1, minWidth: '240px' }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleSendMessage('ask')}
                disabled={loading || !inputText.trim()}
                style={{ padding: '10px 20px', fontSize: '0.95rem' }}
                title="Send as standard question"
              >
                💬 Ask
              </button>

              <button
                type="button"
                className="btn-outline-teal"
                onClick={() => handleSendMessage('recommend')}
                disabled={loading || !inputText.trim()}
                title="Send for recommendation"
              >
                💡 Recommend
              </button>

              <button
                type="button"
                className="btn-outline-gray"
                onClick={() => handleSendMessage('report')}
                disabled={loading || !inputText.trim()}
                title="Generate structured report"
              >
                📑 Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
