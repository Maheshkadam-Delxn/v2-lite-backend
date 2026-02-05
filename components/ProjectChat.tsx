"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useProjectChat } from '../hooks/useProjectChat';

interface ProjectChatProps {
    projectId: string;
    projectName?: string;
}

export const ProjectChat = ({ projectId, projectName }: ProjectChatProps) => {
    const { messages, sendMessage, isConnected, loading } = useProjectChat(projectId);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="flex flex-col h-[500px] w-full max-w-md bg-white rounded-lg shadow-xl border overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg">{projectName || "Project Chat"}</h3>
                    <p className="text-xs opacity-80">{isConnected ? "🟢 Online" : "🔴 Reconnecting..."}</p>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4"
            >
                {loading ? (
                    <div className="text-center text-gray-500 py-10">Loading history...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 italic">No messages yet. Say hello!</div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender === 'me' || (typeof msg.senderId === 'object' && msg.senderId?.email === 'current-user@example.com'); // This is a placeholder for logic
                        // Note: In real app, compare with authenticated user ID

                        return (
                            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none'
                                    } shadow-sm`}>
                                    {!isMe && msg.senderId?.name && (
                                        <div className="text-[10px] font-bold mb-1 opacity-70">{msg.senderId.name}</div>
                                    )}
                                    <div>{msg.content}</div>
                                </div>
                                <span className="text-[9px] text-gray-400 mt-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={!isConnected}
                />
                <button
                    onClick={handleSend}
                    disabled={!isConnected || !inputValue.trim()}
                    className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
