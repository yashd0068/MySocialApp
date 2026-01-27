// components/ChatSidebar.jsx
import { useState, useEffect } from "react";
import api from "../api/axios";
import { MessageCircle, X } from "lucide-react";

const ChatSidebar = ({ onOpenChat, openChats, onCloseChat, currentUser }) => {
    const [conversations, setConversations] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await api.get("/chat");
            setConversations(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            {/* Floating chat button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-20 right-4 md:bottom-8 md:right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg z-40"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>

            {/* Chat sidebar */}
            <div
                className={`
          fixed inset-y-0 right-0 
          w-full md:w-80 
          bg-white shadow-2xl
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          z-50
        `}
            >
                <div className="p-4 border-b">
                    <h3 className="font-bold text-lg">Messages</h3>
                    <p className="text-sm text-gray-500">
                        {openChats.length} chat(s) open
                    </p>
                </div>

                <div className="p-2">
                    {/* Currently open chats */}
                    {openChats.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                                Active
                            </h4>

                            {openChats.map((chat) => (
                                <div
                                    key={chat.chatId}
                                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                                    onClick={() =>
                                        onOpenChat(chat.chatId, chat.participant)
                                    }
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={chat.participant?.profilePic || "/default-avatar.png"}
                                            alt=""
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <span>{chat.participant?.name}</span>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCloseChat(chat.chatId);
                                        }}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* All conversations */}
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                        All Conversations
                    </h4>

                    <div className="space-y-1">
                        {conversations.map((conv) => {
                            // find the other user in this chat
                            const otherUser = conv.Participants?.find(
                                (p) => p.user_id !== currentUser.user_id
                            );

                            return (
                                <div
                                    key={conv.chat_id}
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded cursor-pointer"
                                    onClick={() =>
                                        onOpenChat(conv.chat_id, otherUser)
                                    }
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={
                                                otherUser?.profilePic || "/default-avatar.png"
                                            }
                                            alt={otherUser?.name}
                                            className="w-10 h-10 rounded-full"
                                        />

                                        <div>
                                            <p className="font-medium">{otherUser?.name}</p>
                                            const lastMsg = conv.Messages?.[conv.Messages.length - 1];

                                            <p className="text-sm text-gray-500 truncate max-w-[150px]">
                                                {lastMsg ? lastMsg.content : "No messages yet"}
                                            </p>
                                        </div>
                                    </div>

                                    {conv.unread_count > 0 && (
                                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatSidebar;
