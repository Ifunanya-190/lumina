import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ReactMarkdown from 'react-markdown';
import { FaTimes, FaPaperPlane, FaTrash, FaBrain, FaRobot, FaLock, FaCopy, FaPen, FaCheck } from 'react-icons/fa';
import TypingMessage from './TypingMessage';

const AIMentor = () => {
  const { chatOpen, setChatOpen, chatMessages, setChatMessages, sendChat, clearChat, aiStatus, isLoggedIn, user } = useApp();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);
  const editRef = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (chatOpen) inputRef.current?.focus();
  }, [chatOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setLoading(true);
    await sendChat(msg);
    setLoading(false);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const startEdit = (idx, content) => {
    setEditingIdx(idx);
    setEditText(content);
    setTimeout(() => editRef.current?.focus(), 50);
  };

  const submitEdit = async () => {
    if (!editText.trim() || loading) return;
    const trimmed = editText.trim();
    // Remove this message and all messages after it, then re-send
    setChatMessages(prev => prev.slice(0, editingIdx));
    setEditingIdx(null);
    setEditText('');
    setLoading(true);
    await sendChat(trimmed);
    setLoading(false);
  };

  const suggestions = [
    "What should I learn first?",
    "Create a tutorial about photography",
    "Help me with guitar chords",
    "What's the best way to start painting?",
  ];

  return (
    <>
      {/* Overlay */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setChatOpen(false)} />
      )}

      {/* Chat Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 transition-transform duration-500 ease-out ${
          chatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full bg-nebula-900/95 backdrop-blur-2xl border-l border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-pink flex items-center justify-center">
                <FaBrain className="text-white text-lg" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Lumina</h3>
                <span className="text-[11px] text-white/40 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${aiStatus?.ai_available ? 'bg-aurora-green' : 'bg-aurora-cyan'}`} />
                  {aiStatus?.ai_available ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                title="Clear chat"
              >
                <FaTrash className="text-xs" />
              </button>
              <button
                onClick={() => setChatOpen(false)}
                className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!isLoggedIn ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-blue/20 flex items-center justify-center mb-4">
                  <FaLock className="text-3xl text-aurora-cyan" />
                </div>
                <h4 className="text-white font-semibold mb-2">Sign In Required</h4>
                <p className="text-white/40 text-sm mb-6">Create an account or sign in to chat with Lumina and get personalized learning guidance.</p>
                <Link
                  to="/auth"
                  onClick={() => setChatOpen(false)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-white font-semibold hover:shadow-lg transition-all"
                >
                  Sign In to Chat
                </Link>
              </div>
            ) : user?.skill_level === 'undecided' ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-aurora-cyan/20 via-aurora-blue/20 to-aurora-pink/20 flex items-center justify-center mb-4">
                  <FaBrain className="text-3xl text-aurora-cyan" />
                </div>
                <h4 className="text-white font-semibold mb-2">Complete Your Assessment</h4>
                <p className="text-white/40 text-sm mb-6">Take a quick skill assessment first so Lumina can personalize your experience.</p>
                <Link
                  to="/assessment"
                  onClick={() => setChatOpen(false)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-white font-semibold hover:shadow-lg transition-all"
                >
                  Take Assessment
                </Link>
              </div>
            ) : (
            <>
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-blue/20 flex items-center justify-center mb-4">
                  <FaRobot className="text-3xl text-aurora-cyan" />
                </div>
                <h4 className="text-white font-semibold mb-2">Hey! I'm Lumina</h4>
                <p className="text-white/40 text-sm mb-6">Your personal learning companion. Ask me anything about skills, tutorials, or let me create a custom lesson for you.</p>
                <div className="grid gap-2 w-full">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      className="text-left px-4 py-2.5 rounded-xl glass text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, i) => {
              const isLastAiMessage = msg.role === 'assistant' && i === chatMessages.length - 1;
              const isUser = msg.role === 'user';
              const isEditing = editingIdx === i;

              return (
                <div key={i} className={`group flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex flex-col max-w-[85%]">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          ref={editRef}
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') submitEdit(); if (e.key === 'Escape') setEditingIdx(null); }}
                          className="flex-1 bg-white/10 border border-aurora-cyan/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-aurora-cyan/50"
                        />
                        <button onClick={submitEdit} disabled={!editText.trim() || loading} className="p-2 rounded-lg bg-aurora-cyan/20 text-aurora-cyan hover:bg-aurora-cyan/30 transition-colors disabled:opacity-30">
                          <FaPaperPlane className="text-xs" />
                        </button>
                        <button onClick={() => setEditingIdx(null)} className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white/60 transition-colors">
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`px-4 py-3 text-sm leading-relaxed ${
                          isUser
                            ? 'chat-bubble-user text-white'
                            : 'chat-bubble-ai text-white/90'
                        }`}
                      >
                        {isUser ? (
                          msg.content
                        ) : isLastAiMessage ? (
                          <TypingMessage content={msg.content} />
                        ) : (
                          <div className="ai-markdown">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Action buttons */}
                    {!isEditing && (
                      <div className={`flex items-center gap-1 mt-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <button
                          onClick={() => handleCopy(msg.content, i)}
                          className="p-1.5 rounded-md text-white/25 hover:text-white/60 hover:bg-white/5 transition-colors"
                          title="Copy"
                        >
                          {copiedIdx === i ? <FaCheck className="text-[10px] text-aurora-green" /> : <FaCopy className="text-[10px]" />}
                        </button>
                        {isUser && (
                          <button
                            onClick={() => startEdit(i, msg.content)}
                            className="p-1.5 rounded-md text-white/25 hover:text-white/60 hover:bg-white/5 transition-colors"
                            title="Edit & resend"
                          >
                            <FaPen className="text-[10px]" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="chat-bubble-ai px-5 py-4">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-aurora-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-aurora-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-aurora-pink animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEnd} />
            </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isLoggedIn && user?.skill_level !== 'undecided' ? "Ask Lumina anything..." : "Sign in to chat..."}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-aurora-cyan/50 focus:ring-1 focus:ring-aurora-cyan/30 transition-all"
                disabled={!isLoggedIn || user?.skill_level === 'undecided'}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading || !isLoggedIn || user?.skill_level === 'undecided'}
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-white disabled:opacity-30 hover:shadow-lg hover:shadow-aurora-cyan/20 transition-all active:scale-95"
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIMentor;
