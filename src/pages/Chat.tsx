import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { Send, Search, Circle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    avatarUrl: string;
  };
  timestamp: string;
}

interface ChatRoom {
  _id: string;
  participants: Array<{
    _id: string;
    username: string;
    avatarUrl: string;
  }>;
  lastMessage: string;
}

export default function Chat() {
  const { user, token } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
  }, [token]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
      socket?.emit('join-chat', activeChat);
    }

    return () => {
      if (activeChat) {
        socket?.emit('leave-chat', activeChat);
      }
    };
  }, [activeChat]);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });
    }
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChats = async () => {
    try {
      const response = await axios.get('/api/chat', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await axios.get(`/api/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat || !newMessage.trim() || !socket) return;

    try {
      const response = await axios.post(
        `/api/chat/${activeChat}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit('send-message', {
        chatId: activeChat,
        message: response.data
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-8rem)] flex">
        {/* Chat List and Online Users */}
        <div className="w-1/3 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Online Users */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Online Users</h3>
            <div className="space-y-2">
              {onlineUsers.map(user => (
                <div key={user.userId} className="flex items-center space-x-2">
                  <Circle className="h-2 w-2 text-green-500 fill-current" />
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm">{user.username}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chats.map(chat => (
              <button
                key={chat._id}
                onClick={() => setActiveChat(chat._id)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 ${
                  activeChat === chat._id ? 'bg-gray-50' : ''
                }`}
              >
                <img
                  src={chat.participants[0]._id === user?.id ? 
                    chat.participants[1].avatarUrl : 
                    chat.participants[0].avatarUrl}
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-medium">
                    {chat.participants[0]._id === user?.id ? 
                      chat.participants[1].username : 
                      chat.participants[0].username}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
                {onlineUsers.some(u => 
                  u.userId === (chat.participants[0]._id === user?.id ? 
                    chat.participants[1]._id : 
                    chat.participants[0]._id)
                ) && (
                  <Circle className="h-2 w-2 text-green-500 fill-current" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              <div className="p-4 border-b">
                <h2 className="font-semibold">
                  {chats.find(c => c._id === activeChat)?.participants.find(p => p._id !== user?.id)?.username}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {messages.map(message => (
                  <div
                    key={message._id}
                    className={`mb-4 flex ${
                      message.sender._id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender._id === user?.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p>{message.content}</p>
                      <span className="text-xs opacity-75">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
