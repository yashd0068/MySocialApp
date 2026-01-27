// components/ChatManager.jsx
import { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";
import ChatSidebar from "./ChatSidebar";
import api from "../api/axios";

const ChatManager = () => {
    const [openChats, setOpenChats] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Fetch current user
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get("/users/me");
                setCurrentUser(res.data);
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        };
        fetchUser();
    }, []);

    // Fetch conversations with sorting
    useEffect(() => {
        if (currentUser) fetchConversations();
    }, [currentUser]);

    const fetchConversations = async () => {
        try {
            const res = await api.get("/chat");
            // Sort conversations by last message timestamp (newest first)
            const sortedConversations = (res.data || []).sort((a, b) => {
                const aTime = a.lastMessage?.createdAt || a.updatedAt || 0;
                const bTime = b.lastMessage?.createdAt || b.updatedAt || 0;
                return new Date(bTime) - new Date(aTime);
            });
            setConversations(sortedConversations);
        } catch (err) {
            console.error("Failed to fetch conversations:", err);
        }
    };

    const openChat = (chatId, participant) => {
        setOpenChats(prev => {
            // Check if chat is already open
            const existingIndex = prev.findIndex(chat => chat.chatId === chatId);
            if (existingIndex > -1) {
                // Bring to front if already open
                const chat = prev[existingIndex];
                const newChats = [...prev];
                newChats.splice(existingIndex, 1);
                newChats.push(chat);
                return newChats;
            }

            // Limit to 3 chat windows on desktop
            if (prev.length >= 3) {
                return [...prev.slice(1), { chatId, participant }];
            }

            return [...prev, { chatId, participant }];
        });
        setIsSidebarOpen(false); // Close sidebar on mobile when opening chat
    };

    const closeChat = (chatId) => {
        setOpenChats(prev => prev.filter(chat => chat.chatId !== chatId));
        fetchConversations(); // Refresh conversation list
    };

    const closeAllChats = () => {
        setOpenChats([]);
    };

    // Calculate positions for stacking (desktop only)
    const getChatPosition = (index, total) => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            return {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000 + index
            };
        }

        const offset = 20;
        const startRight = 20;
        const startBottom = 100;
        const maxOffset = 3; // Max 3 windows side by side

        return {
            position: 'fixed',
            right: startRight + ((index % maxOffset) * 320),
            bottom: startBottom + Math.floor(index / maxOffset) * 520,
            width: '300px',
            height: '500px',
            zIndex: 1000 + index
        };
    };

    if (!currentUser) return null;

    return (
        <>
            {/* Chat Sidebar */}
            <ChatSidebar
                conversations={conversations}
                openChats={openChats}
                currentUser={currentUser}
                onOpenChat={openChat}
                onCloseChat={closeChat}
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                onRefresh={fetchConversations}
            />

            {/* Open Chat Windows */}
            {openChats.map((chat, index) => (
                <ChatWindow
                    key={chat.chatId}
                    chatId={chat.chatId}
                    currentUser={currentUser}
                    participant={chat.participant}
                    onClose={() => closeChat(chat.chatId)}
                    onMessageSent={fetchConversations}
                    style={getChatPosition(index, openChats.length)}
                />
            ))}
        </>
    );
};

export default ChatManager;