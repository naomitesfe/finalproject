import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, Send } from 'lucide-react';
import io, { Socket } from 'socket.io-client';

interface ChatMessage {
  _id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  senderName?: string;
  recipientName?: string;
}

export const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = (import.meta as any).env?.VITE_API_URL || '';

  useEffect(() => {
    if (!user) return;

    // Initialize Socket.IO client
    const socket = io(API_URL, {
      auth: { token: localStorage.getItem('token') }
    });

    socketRef.current = socket;

    // Load initial messages
    fetch(`${API_URL}/api/messages`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading messages:', err);
        setLoading(false);
      });

    // Listen for incoming messages
    socket.on('message', (msg: ChatMessage) => {
      setMessages(prev => [msg, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;

    const optimisticMsg: ChatMessage = {
      _id: `temp-${Date.now()}`,
      senderId: (user as any)?._id || '',
      recipientId: '', // set recipient ID dynamically
      content: input.trim(),
      createdAt: new Date().toISOString()
    };

    // Emit to backend (server will typically return/generate the real _id)
    socketRef.current.emit('sendMessage', {
      senderId: optimisticMsg.senderId,
      recipientId: optimisticMsg.recipientId,
      content: optimisticMsg.content,
      createdAt: optimisticMsg.createdAt
    });

    // Optimistically update UI
    setMessages(prev => [optimisticMsg, ...prev]);
    setInput('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00AEEF]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2C45] mb-2">Messages</h1>
        <p className="text-gray-600">Connect with entrepreneurs, investors, and realtors</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No messages yet</h3>
            <p className="text-gray-500">Start connecting with other users to exchange messages</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              // ensure we have an id to compare (cast to any because AuthContext user type may not include _id)
              const userId = (user as any)?._id || '';
              const isOwn = msg.senderId === userId;
              const otherUserName = isOwn ? msg.recipientName : msg.senderName;

              return (
                <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md ${isOwn ? 'bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white' : 'bg-gray-100 text-gray-800'} rounded-lg p-4`}>
                    {!isOwn && <p className="text-xs font-semibold mb-1">{otherUserName}</p>}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-2 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent"
          onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
        />
        <button
          onClick={sendMessage}
          className="bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white px-6 py-3 rounded-lg hover:shadow-lg transition duration-200"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
