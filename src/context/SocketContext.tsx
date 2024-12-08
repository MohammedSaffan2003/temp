import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface OnlineUser {
  userId: string;
  username: string;
  avatarUrl: string;
}

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: OnlineUser[];
}

const SocketContext = createContext<SocketContextType>({ socket: null, onlineUsers: [] });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        auth: { 
          userId: user.id,
          username: user.name,
          avatarUrl: user.avatarUrl
        }
      });

      newSocket.on('users:online', (users: OnlineUser[]) => {
        setOnlineUsers(users);
      });

      newSocket.on('user:connected', (newUser: OnlineUser) => {
        setOnlineUsers(prev => [...prev, newUser]);
      });

      newSocket.on('user:disconnected', (userId: string) => {
        setOnlineUsers(prev => prev.filter(u => u.userId !== userId));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
