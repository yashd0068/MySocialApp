import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import MobileBottomNav from "../components/MobileBottomNav";
import {
    MessageCircle,
    Search,
    Plus,
    User,
    Users,
    Clock,
    Check,
    CheckCheck,
    MoreVertical,
    Filter,
    ChevronLeft
} from "lucide-react";

const Chats = () => {
    const [chats, setChats] = useState([]);
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [activeTab, setActiveTab] = useState("chats"); // "chats" or "followers"
    const [showFollowers, setShowFollowers] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUser();
        fetchChats();
        fetchFollowing();
    }, []);

    useEffect(() => {
        if (search.trim() === "") {
            setFilteredChats(chats);
        } else {
            const filtered = chats.filter(chat => {
                const otherUser = getOtherUser(chat.Participants);
                return otherUser?.name?.toLowerCase().includes(search.toLowerCase());
            });
            setFilteredChats(filtered);
        }
    }, [search, chats]);

    const fetchUser = async () => {
        try {
            const res = await api.get("/users/me");
            setUser(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchChats = async () => {
        try {
            setLoading(true);
            const res = await api.get("/chat");
            console.log("Chats data:", res.data);
            setChats(res.data || []);
            setFilteredChats(res.data || []);
        } catch (err) {
            console.error("Error fetching chats:", err);
            setChats([]);
            setFilteredChats([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowing = async () => {
        try {
            const res = await api.get("/follow/following");
            setFollowing(res.data || []);
        } catch (err) {
            console.error("Error fetching following:", err);
            setFollowing([]);
        }
    };

    const startNewChat = () => {
        navigate("/search");
    };

    const getOtherUser = (participants) => {
        if (!participants || !user) return null;

        console.log("Participants:", participants);
        console.log("Current user ID:", user.user_id);

        // Try different possible structures
        const otherUser = participants.find(p => p.user_id !== user.user_id);

        if (!otherUser) {
            // Check if participants is an array of objects with different property names
            const alternativeOtherUser = participants.find(p =>
                p.id !== user.user_id ||
                p.userId !== user.user_id ||
                p._id !== user.user_id
            );
            return alternativeOtherUser || null;
        }

        return otherUser;
    };

    const getLastMessage = (chat) => {
        if (!chat.lastMessage || !chat.lastMessage.content) {
            return "No messages yet";
        }

        const content = chat.lastMessage.content;
        return content.length > 30
            ? content.substring(0, 30) + "..."
            : content;
    };

    const getMessageStatus = (message) => {
        if (!message) return null;
        // Implement based on your message status logic
        return "delivered";
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diff = now - date;

            if (diff < 60 * 1000) {
                return "Just now";
            } else if (diff < 60 * 60 * 1000) {
                const minutes = Math.floor(diff / (60 * 1000));
                return `${minutes}m`;
            } else if (diff < 24 * 60 * 60 * 1000) {
                const hours = Math.floor(diff / (60 * 60 * 1000));
                return `${hours}h`;
            } else if (diff < 7 * 24 * 60 * 60 * 1000) {
                const days = Math.floor(diff / (24 * 60 * 60 * 1000));
                return `${days}d`;
            } else {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
        } catch (err) {
            return "";
        }
    };

    const startChatWithUser = async (userId) => {
        try {
            const res = await api.post("/chat", { user_id: userId });
            navigate(`/chat/${res.data.chat_id}`);
        } catch (err) {
            console.error("Failed to start chat:", err);
            alert("Failed to start chat. Please try again.");
        }
    };

    const handleSearchFollowers = () => {
        setShowFollowers(true);
    };

    const handleBackToChats = () => {
        setShowFollowers(false);
        setSearch("");
    };

    const filteredFollowing = following.filter(follow =>
        !search || follow.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
                    <div className="max-w-3xl mx-auto px-4 py-3">
                        {showFollowers ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleBackToChats}
                                    className="p-1 hover:bg-gray-100 rounded-full transition"
                                >
                                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                                </button>
                                <div className="flex-1">
                                    <h1 className="text-lg font-bold text-gray-900">New Message</h1>
                                    <p className="text-xs text-gray-500">Select a follower to chat with</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {chats.length} conversations
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSearchFollowers}
                                        className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
                                        title="New message"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Search Bar */}
                        <div className="mt-3 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={showFollowers ? "Search followers..." : "Search messages..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Followers List (for new chat) */}
                {showFollowers && (
                    <div className="max-w-3xl mx-auto px-4 py-4">
                        <div className="mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Users className="w-4 h-4" />
                                <span>Your followers ({filteredFollowing.length})</span>
                            </div>
                        </div>

                        {filteredFollowing.length === 0 ? (
                            <div className="text-center py-10">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {search ? "No matching followers" : "No followers yet"}
                                </h3>
                                <p className="text-gray-500">
                                    {search ? "Try a different search term" : "Follow people to start chatting"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredFollowing.map(follow => (
                                    <div
                                        key={follow.user_id}
                                        onClick={() => startChatWithUser(follow.user_id)}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-all active:scale-[0.98]"
                                    >
                                        {/* Avatar */}
                                        {/* In the followers list section, update the avatar */}
                                        <div className="relative">
                                            {follow.profilePic ? (
                                                <img
                                                    src={`http://localhost:5000${follow.profilePic}`}
                                                    alt={follow.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                    {follow.name?.charAt(0) || 'U'}
                                                </div>
                                            )}

                                            {/* Online Status */}
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {follow.name || 'Unknown User'}
                                            </h3>
                                            <p className="text-xs text-gray-500 truncate">
                                                @{follow.username || 'user'}
                                            </p>
                                        </div>

                                        {/* Action Button */}
                                        <button className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                                            <MessageCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Chat List */}
                {!showFollowers && (
                    <div className="max-w-3xl mx-auto px-4 pb-20">
                        {loading ? (
                            <div className="py-8 space-y-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="text-center py-16 px-4">
                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MessageCircle className="w-12 h-12 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    {search ? "No matching conversations" : "No messages yet"}
                                </h3>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                    {search
                                        ? "Try searching for a different name or start a new conversation"
                                        : "Start chatting with your followers and friends"}
                                </p>
                                {search ? (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                                    >
                                        Clear Search
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSearchFollowers}
                                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-md"
                                    >
                                        <Plus className="w-4 h-4 inline mr-2" />
                                        Start New Chat
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredChats.map(chat => {
                                    const otherUser = getOtherUser(chat.Participants) || chat.otherUser;
                                    const lastMessage = chat.lastMessage || chat.Messages?.[0];
                                    const isUnread = chat.unreadCount > 0;

                                    return (
                                        <Link
                                            key={chat.chat_id}
                                            to={`/chat/${chat.chat_id}`}
                                            state={{ otherUser }}
                                            className="block group"
                                        >
                                            <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all active:scale-[0.98]">
                                                {/* Avatar with Status */}
                                                {/* Avatar with Status */}
                                                {/* Avatar with Status */}
                                                <div className="relative flex-shrink-0">

                                                    {otherUser?.profilePic ? (
                                                        <img
                                                            src={`http://localhost:5000${otherUser.profilePic}`}
                                                            alt={otherUser.name}
                                                            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">
                                                            {otherUser?.name?.charAt(0) || 'U'}
                                                        </div>
                                                    )}

                                                    {/* Online Status */}
                                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>

                                                    {/* Unread Badge */}
                                                    {isUnread && (
                                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                            {chat.unreadCount}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Chat Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h3 className={`font-semibold truncate ${isUnread ? 'text-gray-900' : 'text-gray-800'}`}>
                                                            {otherUser?.name || 'Unknown User'}
                                                        </h3>
                                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                                            {formatTime(lastMessage?.createdAt || chat.updatedAt)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1">
                                                            <p className={`text-sm truncate ${isUnread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                                                {getLastMessage(chat)}
                                                            </p>
                                                        </div>
                                                        <div className="flex-shrink-0">
                                                            {lastMessage?.sender_id === user?.user_id && (
                                                                getMessageStatus(lastMessage) === 'read' ? (
                                                                    <CheckCheck className="w-4 h-4 text-blue-500" />
                                                                ) : getMessageStatus(lastMessage) === 'delivered' ? (
                                                                    <CheckCheck className="w-4 h-4 text-gray-400" />
                                                                ) : (
                                                                    <Check className="w-4 h-4 text-gray-400" />
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* More Options */}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        // Handle more options
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/* Quick Actions */}
                        {filteredChats.length > 0 && !search && (
                            <div className="mt-8 px-4">
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Start a new conversation</h4>
                                            <p className="text-sm text-gray-600 mt-1">Chat with your followers</p>
                                        </div>
                                        <button
                                            onClick={handleSearchFollowers}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                                        >
                                            <Users className="w-4 h-4" />
                                            <span>Browse Followers</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <MobileBottomNav user={user} />
        </>
    );
};

export default Chats;