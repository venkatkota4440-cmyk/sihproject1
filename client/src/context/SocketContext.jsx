import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const s = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    s.on('connect', () => {
      if (user?.id) {
        s.emit('join:user', user.id);
      }
    });

    s.on('telemetry:broadcast', (data) => {
      setTelemetry(data);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, telemetry }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
