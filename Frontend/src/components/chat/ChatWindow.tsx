import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

interface ChatWindowProps {
  userId: string; // The user to chat with
}

const ChatWindow: React.FC<ChatWindowProps> = ({ userId }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    // Optionally, poll for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/chat/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.messages || []);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      await api.post('/chat/send', {
        receiverId: userId,
        message: input
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInput('');
      fetchMessages();
    } catch (err) {
      // handle error
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-h-[500px] border rounded-lg bg-white dark:bg-black shadow-md">
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          messages.map(msg => (
            <div key={msg._id} className={`mb-2 flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-3 py-2 rounded-lg max-w-xs ${msg.senderId === user?._id ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'}`}>
                {msg.message}
                <div className="text-xs text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
        />
        <Button onClick={sendMessage} disabled={!input.trim()}>Send</Button>
      </div>
    </div>
  );
};

export default ChatWindow;
