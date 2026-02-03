import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

export const useProjectChat = (projectId: string) => {
    const { socket, isConnected } = useSocket();
    const [messages, setMessages] = useState<any[]>([]);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!socket || !isConnected || !projectId) {
            console.log('⏳ useProjectChat waiting...', { socket: !!socket, isConnected, projectId });
            setLoading(false);
            return;
        }

        setLoading(true);

        // 1. Fetch History from REST API
        const fetchHistory = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
                const response = await fetch(`${baseUrl}/api/chat/project/${projectId}`);
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error("Failed to fetch chat history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();

        // 2. Join the Project Room via Socket
        console.log(`🤝 Joining Project: ${projectId}`);
        socket.emit('join_project_chat', { projectId });

        // 3. Listen for Success
        const handleRoomJoined = (data: { roomId: string, projectId: string }) => {
            console.log("✅ Room joined successfully on server:", data);
            setRoomId(data.roomId);
        };

        // 4. Listen for Incoming Messages
        const handleNewMessage = (msg: any) => {
            console.log("📥 New message received:", msg);
            setMessages((prev) => [...prev, msg]);
        };

        socket.on('room_joined', handleRoomJoined);
        socket.on('receive_message', handleNewMessage);

        return () => {
            socket.off('room_joined', handleRoomJoined);
            socket.off('receive_message', handleNewMessage);
        };
    }, [socket, isConnected, projectId]);

    // Function to send a message
    const sendMessage = (content: string) => {
        if (!socket || !projectId) return;

        const payload = {
            projectId,
            content,
            type: 'text'
        };

        // Server will handle auth and broadcasting
        socket.emit('send_message', payload);
    };

    return { messages, sendMessage, roomId, isConnected, loading };
};
