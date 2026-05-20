import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { getAccessToken } from '../lib/api.js';
import { useAuth } from './AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, profile } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !getAccessToken()) {
      setConnected(false);
      setSocket(null);
      return undefined;
    }

    const client = io(SOCKET_URL, {
      auth: { token: getAccessToken() },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    client.on('connect', () => setConnected(true));
    client.on('disconnect', () => setConnected(false));
    client.on('connect_error', () => setConnected(false));

    setSocket(client);

    return () => {
      client.disconnect();
      setConnected(false);
      setSocket(null);
    };
  }, [isAuthenticated, profile?._id]);

  const value = useMemo(() => ({
    socket,
    connected,
    joinConversation: (conversationId) => socket?.emit('conversation:join', conversationId),
    leaveConversation: (conversationId) => socket?.emit('conversation:leave', conversationId),
  }), [socket, connected]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
