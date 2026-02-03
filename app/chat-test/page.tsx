"use client";
import React, { useState } from 'react';
import { ProjectChat } from '../../components/ProjectChat';

export default function ChatTestPage() {
    const [projectId, setProjectId] = useState("");
    const [activeProject, setActiveProject] = useState("");

    const handleStartChat = () => {
        if (projectId.trim()) {
            setActiveProject(projectId.trim());
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8 text-blue-800">🛠️ Local Chat Integration Tester</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8 w-full max-w-md">
                <p className="text-sm text-gray-600 mb-4">
                    Enter a valid <b>Project ID</b> from your database to start testing.
                </p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        placeholder="Paste Project ID here..."
                        className="flex-1 border rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        onClick={handleStartChat}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Start Chat
                    </button>
                </div>
            </div>

            {activeProject ? (
                <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ProjectChat projectId={activeProject} projectName="Test Project Connection" />
                </div>
            ) : (
                <div className="text-gray-400 italic">Enter a Project ID above to load the chat component.</div>
            )}

            <div className="mt-12 max-w-2xl text-sm text-gray-500 bg-blue-50 p-4 rounded border border-blue-200">
                <h4 className="font-bold mb-2">How to test:</h4>
                <ol className="list-decimal ml-5 space-y-1">
                    <li>Ensure your local socket server is running (Port 4000).</li>
                    <li>Open this page in <b>two different</b> browser windows.</li>
                    <li>Enter the <b>same</b> Project ID in both.</li>
                    <li>Send a message in one and watch it appear in the other!</li>
                </ol>
            </div>
        </div>
    );
}
