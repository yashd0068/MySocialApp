// ChatHistory.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ChatWindow from "./ChatWindow";

const ChatHistory = () => {
    const [chats, setChats] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/users/me").then(res => setCurrentUser(res.data));
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const res = await api.get("/chat");
            setChats(res.data);
        } catch (err) {
            console.error("Failed to fetch chats:", err);
        }
    };

    const openChat = (chat) => {
        setActiveChat(chat.chat_id);
    };

    const closeChat = () => {
        setActiveChat(null);
    };

    if (!currentUser) return <div>Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Messages</h1>

            <div className="flex gap-6 h-[600px]">
                {/* Chat list sidebar */}
                <div className="w-1/3 bg-white border rounded-lg overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold">Conversations</h2>
                    </div>
                    <div className="overflow-y-auto h-full">
                        {chats.length === 0 ? (
                            <div className="p-4 text-gray-500">No conversations yet</div>
                        ) : (
                            chats.map(chat => {
                                const otherUser = chat.Participants?.find(p => p.user_id !== currentUser.user_id);
                                const lastMessage = chat.Messages?.[chat.Messages.length - 1];

                                return (
                                    <div
                                        key={chat.chat_id}
                                        onClick={() => openChat(chat)}
                                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${activeChat === chat.chat_id ? 'bg-blue-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={otherUser?.profilePic || "https://via.placeholder.com/40"}
                                                className="w-10 h-10 rounded-full"
                                                alt={otherUser?.name}
                                            />
                                            <div className="flex-1">
                                                <h3 className="font-medium">{otherUser?.name || "Unknown User"}</h3>
                                                {lastMessage && (
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {lastMessage.content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat window area */}
                <div className="flex-1">
                    {activeChat ? (
                        <ChatWindow
                            chatId={activeChat}
                            currentUser={currentUser}
                            onClose={closeChat}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gray-50 border rounded-lg">
                            <div className="text-center text-gray-500">
                                <div className="text-4xl mb-4">💬</div>
                                <p>Select a conversation to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatHistory;