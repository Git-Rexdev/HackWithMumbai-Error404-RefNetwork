import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { MessageSquare, Users, Clock } from 'lucide-react';
import { Message, User } from '../../types';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface ChatUser {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

const ChatList: React.FC = () => {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat');
      const messages = response.data.messages || [];
      
      // Deduplicate conversations: only one chat per user (regardless of sender/receiver direction)
      const userMap = new Map<string, ChatUser>();
      messages.forEach((message: Message) => {
        if (!user) return;
        // Get the other user's _id
        let otherUser: User;
        if (message.sender._id === user._id) {
          otherUser = message.receiver;
        } else {
          otherUser = message.sender;
        }
        const userId = otherUser._id;
        // Only keep the latest message for each conversation
        if (!userMap.has(userId) || new Date(message.createdAt) > new Date(userMap.get(userId)!.lastMessage.createdAt)) {
          userMap.set(userId, {
            user: otherUser,
            lastMessage: message,
            unreadCount: 0
          });
        }
      });
      setChatUsers(Array.from(userMap.values()).sort((a, b) =>
        new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
      ));
    } catch (err) {
      setError('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'fresher':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchChats}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
  <h1 className="text-3xl font-bold text-primary">Messages</h1>
        <p className="mt-2 text-gray-600">
          Your conversations with other users
        </p>
      </div>

      {chatUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start a conversation with other users.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {chatUsers.map((chatUser) => (
            <Card key={chatUser.user._id} className="hover:shadow-md transition-shadow">
              <Link to={`/messages/${chatUser.user._id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {getInitials(chatUser.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                          {chatUser.user.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={getRoleColor(chatUser.user.role)}>
                            {chatUser.user.role}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatTime(chatUser.lastMessage.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {chatUser.lastMessage.message}
                      </p>
                      
                      {chatUser.unreadCount > 0 && (
                        <div className="flex items-center mt-2">
                          <Badge variant="destructive" className="text-xs">
                            {chatUser.unreadCount} unread
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;
