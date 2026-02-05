"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // 1. Initialize Socket
        // In dev, use localhost:4000
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
            withCredentials: true, // Important for cookies/auth
            transports: ['websocket'],
            autoConnect: true,
        });

        // 2. Setup Listeners
        socketInstance.on('connect', () => {
            console.log('✅ Socket Connected Successfully! ID:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('connect_error', (err) => {
            console.error('❌ Socket Connection Error:', err.message);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('❌ Socket Disconnected. Reason:', reason);
            setIsConnected(false);
        });

        setSocket(socketInstance);

        // 3. Cleanup
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
