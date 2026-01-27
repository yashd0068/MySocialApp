// pages/ChatPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import MobileBottomNav from "../components/MobileBottomNav";
import ChatList from "../components/chatList";
import ChatWindow from "./ChatWindow";
import FollowerList from "./FollowersModal";

const ChatPage = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [showNewChat, setShowNewChat] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUser();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
    };

    const fetchUser = async () => {
        try {
            const res = await api.get("/users/me");
            setCurrentUser(res.data);
        } catch (err) {
            console.error("Failed to fetch user:", err);
            navigate("/login");
        }
    };

    const handleSelectChat = (conversation) => {
        const otherUser = conversation.Participants?.find(
            p => p.user_id !== currentUser.user_id
        );
        setActiveChat(conversation.chat_id);
        setOtherUser(otherUser);
        setShowNewChat(false);
    };

    const handleNewChat = () => {
        setShowNewChat(true);
        setActiveChat(null);
    };

    const handleStartChat = async (userId) => {
        try {
            const res = await api.post("/chat", { user_id: userId });
            navigate(`/chat/${res.data.chat_id}`);
        } catch (err) {
            console.error("Failed to start chat:", err);
            alert("Failed to start chat. Please try again.");
        }
    };

    const handleBack = () => {
        if (showNewChat) {
            setShowNewChat(false);
        } else {
            setActiveChat(null);
        }
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-50">
                {/* Mobile Header */}
                {isMobile && (activeChat || showNewChat) && (
                    <div className="sticky top-0 z-30 bg-white border-b">
                        <div className="flex items-center p-4">
                            <button
                                onClick={handleBack}
                                className="p-2 -ml-2"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="ml-2 text-lg font-semibold">
                                {showNewChat ? "New Message" : otherUser?.name || "Chat"}
                            </h2>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="max-w-7xl mx-auto">
                    {/* Desktop Layout */}
                    {!isMobile ? (
                        <div className="flex h-[calc(100vh-64px)]">
                            {/* Left: Chat List */}
                            <div className="w-1/3 border-r bg-white">
                                <ChatList
                                    currentUser={currentUser}
                                    onSelectChat={handleSelectChat}
                                    activeChatId={activeChat}
                                    onNewChat={handleNewChat}
                                />
                            </div>

                            {/* Right: Chat Window or New Chat */}
                            <div className="flex-1">
                                {showNewChat ? (
                                    <FollowerList
                                        currentUser={currentUser}
                                        onSelectUser={handleStartChat}
                                        onBack={() => setShowNewChat(false)}
                                    />
                                ) : activeChat ? (
                                    <ChatWindow
                                        chatId={activeChat}
                                        currentUser={currentUser}
                                        otherUser={otherUser}
                                        onBack={() => setActiveChat(null)}
                                        className="h-full"
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                                            <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Messages</h3>
                                        <p className="text-gray-600 mb-6 max-w-md">
                                            Select a conversation from the list or start a new chat with your followers
                                        </p>
                                        <button
                                            onClick={handleNewChat}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition"
                                        >
                                            Start New Chat
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Mobile Layout */
                        <div className="h-[calc(100vh-56px)]">
                            {showNewChat ? (
                                <FollowerList
                                    currentUser={currentUser}
                                    onSelectUser={handleStartChat}
                                    onBack={() => setShowNewChat(false)}
                                />
                            ) : activeChat ? (
                                <ChatWindow
                                    chatId={activeChat}
                                    currentUser={currentUser}
                                    otherUser={otherUser}
                                    onBack={() => setActiveChat(null)}
                                    className="h-full"
                                />
                            ) : (
                                <ChatList
                                    currentUser={currentUser}
                                    onSelectChat={handleSelectChat}
                                    activeChatId={activeChat}
                                    onNewChat={handleNewChat}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            <MobileBottomNav user={currentUser} />
        </>
    );
};

export default ChatPage;