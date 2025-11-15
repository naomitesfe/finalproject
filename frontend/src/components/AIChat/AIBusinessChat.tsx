import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Sparkles, Plus, MessageSquare, Loader } from 'lucide-react';

interface ChatSession {
  _id: string;
  title: string;
  updatedAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export const AIBusinessChat = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = (import.meta as any).env?.VITE_API_URL || '';

  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  useEffect(() => {
    if (currentSession) loadMessages(currentSession._id);
  }, [currentSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const loadSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setSessions(data);
      if (data.length > 0 && !currentSession) setCurrentSession(data[0]);
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/chat/messages/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const createNewSession = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: 'New Business Chat' }),
      });
      const data = await res.json();
      setSessions([data, ...sessions]);
      setCurrentSession(data);

      // Save initial greeting
      await fetch(`${API_URL}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId: data._id,
          role: 'assistant',
          content: `Hi! I'm your AI business advisor for TefTef...`
        }),
      });

      await loadMessages(data._id);
    } catch (err) {
      console.error('Error creating session:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentSession || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setStreamingText('');
    setError('');

    try {
      // Save user message
      await fetch(`${API_URL}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId: currentSession._id,
          role: 'user',
          content: userMessage,
        }),
      });

      await loadMessages(currentSession._id);

      // Request AI response from backend
      const res = await fetch(`${API_URL}/api/chat/ai-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sessionId: currentSession._id, message: userMessage }),
      });
      const data = await res.json();

      const aiResponse = data.response;

      // Stream AI response
      for (let i = 0; i < aiResponse.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 5));
        setStreamingText(aiResponse.substring(0, i + 1));
      }

      // Save AI response
      await fetch(`${API_URL}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId: currentSession._id,
          role: 'assistant',
          content: aiResponse,
        }),
      });

      setStreamingText('');
      await loadMessages(currentSession._id);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white px-4 py-2 rounded-lg hover:shadow-lg transition duration-200"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map((s) => (
            <button
              key={s._id}
              onClick={() => setCurrentSession(s)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-100 ${
                currentSession?._id === s._id ? 'bg-blue-50 border-l-4 border-l-[#00AEEF]' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700 truncate">{s.title}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(s.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Sparkles size={20} className="text-[#00AEEF]" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">AI Business Advisor</h2>
            <p className="text-xs text-gray-500">Intelligent guidance for your business</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md px-4 py-3 rounded-lg ${msg.role === 'user' ? 'bg-[#00AEEF] text-white rounded-br-none' : 'bg-gray-200 text-gray-900 rounded-bl-none'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {streamingText && (
            <div className="flex justify-start">
              <div className="max-w-md px-4 py-3 rounded-lg bg-gray-200 text-gray-900 rounded-bl-none">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {streamingText}
                  <span className="inline-block w-2 h-4 ml-1 bg-gray-900 animate-pulse"></span>
                </p>
              </div>
            </div>
          )}

          {loading && !streamingText && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-lg bg-gray-200">
                <Loader size={20} className="text-gray-900 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white border-t border-gray-200 p-4 shadow-md">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              placeholder="Ask your AI advisor..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white px-6 py-3 rounded-lg hover:shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
