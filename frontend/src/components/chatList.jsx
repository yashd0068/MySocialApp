import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
    Search, Plus, Users, MoreVertical, Check, CheckCheck, Clock, Video, Phone, UserPlus, Filter, Archive, Pin, Delete, Camera, Image as ImageIcon, Sticker, Send, Mic, X, ChevronDown, Crown, Verified, Star,
    MessageCircle, Heart, ThumbsUp, Laugh, Angry, Rocket, TrendingUp, Zap, Shield, Globe, Lock, Bell, BellOff, Edit, Copy, Forward, Bookmark, Flag, Eye, EyeOff, Download, Share2, MoreHorizontal
    // Mute,// Fire,// Sad, // Gif,
} from "lucide-react";
import { formatDistanceToNow, format } from 'date-fns';

const ChatList = ({ currentUser, onSelectChat, activeChatId, onNewChat, onTypingStatus }) => {
    const [conversations, setConversations] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all'); // all, unread, groups, archived
    const [selectedChats, setSelectedChats] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [typingUsers, setTypingUsers] = useState({});
    const [onlineUsers, setOnlineUsers] = useState({});
    const [lastSeen, setLastSeen] = useState({});
    const navigate = useNavigate();

    // Enhanced fetch with error handling and retry
    const fetchConversations = useCallback(async (showLoading = true) => {
        if (!currentUser) return;

        try {
            if (showLoading) setLoading(true);

            const res = await api.get("/chat", {
                params: {
                    include: 'lastMessage,unreadCount,participants',
                    sort: 'updatedAt:desc'
                }
            });

            // Sort by last activity with priority for pinned chats
            const sortedConversations = (res.data || []).sort((a, b) => {
                // Pinned chats first
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;

                // Unread chats next
                if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
                if (a.unreadCount === 0 && b.unreadCount > 0) return 1;

                // Then by timestamp
                const aTime = a.lastMessage?.createdAt || a.updatedAt || a.createdAt;
                const bTime = b.lastMessage?.createdAt || b.updatedAt || b.createdAt;
                return new Date(bTime) - new Date(aTime);
            });

            setConversations(sortedConversations);

            // Update online status
            updateOnlineStatus(sortedConversations);

        } catch (err) {
            console.error("Failed to fetch conversations:", err);
            // Implement retry logic
            setTimeout(() => fetchConversations(false), 3000);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        const handleChatDeleted = (data) => {
            if (data.chatId === activeChatId) {
                onSelectChat(null); // Close active chat if it's deleted
            }
            fetchConversations(); // Refresh chat list
        };

        if (socketRef.current) {
            socketRef.current.on("chatDeleted", handleChatDeleted);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off("chatDeleted", handleChatDeleted);
            }
        };
    }, [activeChatId, fetchConversations, onSelectChat]);

    // Update online status for users
    const updateOnlineStatus = (conversations) => {
        const status = {};
        conversations.forEach(conv => {
            const otherUser = getOtherUser(conv.Participants);
            if (otherUser) {
                // Mock online status - replace with actual socket connection
                status[otherUser.user_id] = Math.random() > 0.5;
                if (!status[otherUser.user_id]) {
                    setLastSeen(prev => ({
                        ...prev,
                        [otherUser.user_id]: new Date(Date.now() - Math.random() * 86400000).toISOString()
                    }));
                }
            }
        });
        setOnlineUsers(status);
    };

    // Real-time updates
    useEffect(() => {
        fetchConversations();

        // Polling for updates (replace with WebSocket)
        const interval = setInterval(() => {
            fetchConversations(false);
        }, 10000); // Update every 10 seconds

        // Typing simulation
        const typingInterval = setInterval(() => {
            if (conversations.length > 0 && Math.random() > 0.8) {
                const randomConv = conversations[Math.floor(Math.random() * conversations.length)];
                const otherUser = getOtherUser(randomConv.Participants);
                if (otherUser) {
                    setTypingUsers(prev => ({
                        ...prev,
                        [randomConv.chat_id]: otherUser.name
                    }));

                    setTimeout(() => {
                        setTypingUsers(prev => {
                            const newState = { ...prev };
                            delete newState[randomConv.chat_id];
                            return newState;
                        });
                    }, 2000);
                }
            }
        }, 15000);

        return () => {
            clearInterval(interval);
            clearInterval(typingInterval);
        };
    }, [fetchConversations]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchConversations(false);
        setTimeout(() => setRefreshing(false), 500);
    };

    const getOtherUser = (participants) => {
        if (!participants || !currentUser) return null;
        return participants.find(p => p.user_id !== currentUser.user_id);
    };

    const isGroupChat = (participants) => {
        return participants && participants.length > 2;
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "";

        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diff = now - date;

            // Within last minute
            if (diff < 60 * 1000) {
                return "Just now";
            }

            // Today
            if (date.toDateString() === now.toDateString()) {
                return format(date, 'h:mm a');
            }

            // Yesterday
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            if (date.toDateString() === yesterday.toDateString()) {
                return "Yesterday";
            }

            // This week
            if (diff < 7 * 24 * 60 * 60 * 1000) {
                return format(date, 'EEE');
            }

            // This year
            if (date.getFullYear() === now.getFullYear()) {
                return format(date, 'MMM d');
            }

            // Older
            return format(date, 'MM/dd/yy');
        } catch (err) {
            return "";
        }
    };

    const getLastSeen = (userId) => {
        const seenTime = lastSeen[userId];
        if (!seenTime) return "Recently";

        return formatDistanceToNow(new Date(seenTime), { addSuffix: true });
    };

    const getMessageStatus = (message) => {
        if (!message || message.sender_id !== currentUser?.user_id) return null;

        if (message.readBy && message.readBy.length > 0) return 'read';
        if (message.delivered) return 'delivered';
        if (message.sent) return 'sent';
        return 'sending';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'read':
                return <CheckCheck className="w-4 h-4 text-blue-500" />;
            case 'delivered':
                return <CheckCheck className="w-4 h-4 text-gray-400" />;
            case 'sent':
                return <Check className="w-4 h-4 text-gray-400" />;
            default:
                return <Clock className="w-3 h-3 text-gray-400" />;
        }
    };

    const handleChatLongPress = (chatId) => {
        if (isSelectionMode) {
            if (selectedChats.includes(chatId)) {
                setSelectedChats(prev => prev.filter(id => id !== chatId));
            } else {
                setSelectedChats(prev => [...prev, chatId]);
            }
        } else {
            setIsSelectionMode(true);
            setSelectedChats([chatId]);
        }
    };

    const handleBulkAction = (action) => {
        switch (action) {
            case 'archive':
                // Archive selected chats
                break;
            case 'delete':
                // Delete selected chats
                break;
            case 'read':
                // Mark as read
                break;
            case 'unread':
                // Mark as unread
                break;
            case 'pin':
                // Pin chats
                break;
            case 'mute':
                // Mute notifications
                break;
        }
        setIsSelectionMode(false);
        setSelectedChats([]);
    };

    const filteredConversations = useMemo(() => {
        let filtered = conversations;

        // Apply search filter
        if (search.trim()) {
            filtered = filtered.filter(conv => {
                const otherUser = getOtherUser(conv.Participants);
                const searchLower = search.toLowerCase();

                return (
                    otherUser?.name?.toLowerCase().includes(searchLower) ||
                    otherUser?.username?.toLowerCase().includes(searchLower) ||
                    conv.lastMessage?.content?.toLowerCase().includes(searchLower) ||
                    (isGroupChat(conv.Participants) && conv.groupName?.toLowerCase().includes(searchLower))
                );
            });
        }

        // Apply type filter
        switch (filter) {
            case 'unread':
                filtered = filtered.filter(conv => conv.unreadCount > 0);
                break;
            case 'groups':
                filtered = filtered.filter(conv => isGroupChat(conv.Participants));
                break;
            case 'archived':
                filtered = filtered.filter(conv => conv.isArchived);
                break;
            case 'pinned':
                filtered = filtered.filter(conv => conv.isPinned);
                break;
        }

        return filtered;
    }, [conversations, search, filter]);

    const handleStartVideoCall = async (chatId) => {
        // Implement video call initiation
        alert(`Starting video call for chat ${chatId}`);
    };

    const handleStartVoiceCall = async (chatId) => {
        // Implement voice call initiation
        alert(`Starting voice call for chat ${chatId}`);
    };

    const handleViewProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
            {/* Enhanced Header */}
            <div className="p-4 border-b dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img
                                src={currentUser?.profilePic || `https://ui-avatars.com/api/?name=${currentUser?.name}&background=6366f1&color=fff`}
                                alt={currentUser?.name}
                                className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-lg"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {conversations.length} conversations • {conversations.filter(c => c.unreadCount > 0).length} unread
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isSelectionMode ? (
                            <>
                                <button
                                    onClick={() => setIsSelectionMode(false)}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedChats.length} selected
                                </span>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all hover:rotate-180"
                                    title="Refresh"
                                >
                                    <svg
                                        className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                </button>
                                <button
                                    onClick={onNewChat}
                                    className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
                                    title="New message"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                                <div className="relative">
                                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Enhanced Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500" />
                    <input
                        type="text"
                        placeholder="Search messages, people, or groups..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Quick Filters */}
                <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === 'all'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === 'unread'
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        Unread
                    </button>
                    <button
                        onClick={() => setFilter('groups')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === 'groups'
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        Groups
                    </button>
                    <button
                        onClick={() => setFilter('pinned')}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === 'pinned'
                            ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        Pinned
                    </button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {isSelectionMode && (
                <div className="flex items-center justify-between p-3 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkAction('read')}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                            title="Mark as read"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleBulkAction('unread')}
                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                            title="Mark as unread"
                        >
                            <EyeOff className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleBulkAction('archive')}
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                            title="Archive"
                        >
                            <Archive className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleBulkAction('delete')}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            title="Delete"
                        >
                            <Delete className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsSelectionMode(false)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Conversation List with Enhanced UI */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {loading ? (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-12 h-12 text-purple-400 dark:text-purple-500" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
                                <Fire className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {search ? "No matches found" : "No conversations yet"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                            {search
                                ? "Try searching with a different term or start a new conversation"
                                : "Start chatting with friends, family, or create a group!"
                            }
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={onNewChat}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                            >
                                <Plus className="w-4 h-4 inline mr-2" />
                                Start New Chat
                            </button>
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="divide-y dark:divide-gray-800">
                        {filteredConversations.map((conversation) => {
                            const otherUser = getOtherUser(conversation.Participants);
                            const isGroup = isGroupChat(conversation.Participants);
                            const lastMessage = conversation.lastMessage;
                            const isActive = activeChatId === conversation.chat_id;
                            const isUnread = conversation.unreadCount > 0;
                            const isTyping = typingUsers[conversation.chat_id];
                            const isSelected = selectedChats.includes(conversation.chat_id);
                            const isOnline = otherUser && onlineUsers[otherUser.user_id];
                            const messageStatus = getMessageStatus(lastMessage);

                            return (
                                <div
                                    key={conversation.chat_id}
                                    onClick={() => !isSelectionMode && onSelectChat(conversation)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        handleChatLongPress(conversation.chat_id);
                                    }}
                                    className={`
                                        relative flex items-center gap-3 p-4 cursor-pointer 
                                        transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50
                                        ${isActive ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500' : ''}
                                        ${isUnread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                                        ${isSelected ? 'bg-purple-100 dark:bg-purple-900/30' : ''}
                                        group
                                    `}
                                >
                                    {/* Selection Checkbox */}
                                    {isSelectionMode && (
                                        <div className="flex-shrink-0">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleChatLongPress(conversation.chat_id)}
                                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                            />
                                        </div>
                                    )}

                                    {/* User/Group Avatar */}
                                    <div className="relative flex-shrink-0">
                                        {isGroup ? (
                                            <div className="relative">
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                    <Users className="w-6 h-6" />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-900">
                                                    {conversation.Participants?.length || 0}
                                                </div>
                                            </div>
                                        ) : otherUser?.profilePic ? (
                                            <>
                                                <img
                                                    src={`http://localhost:5000${otherUser.profilePic}`}
                                                    alt={otherUser.name}
                                                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-gray-900 shadow-lg"
                                                />
                                                {isOnline && (
                                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                {otherUser?.name?.charAt(0) || 'U'}
                                            </div>
                                        )}

                                        {/* Unread Badge */}
                                        {isUnread && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                            </div>
                                        )}

                                        {/* Pinned Indicator */}
                                        {conversation.isPinned && (
                                            <div className="absolute -top-2 left-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-full flex items-center justify-center">
                                                <Pin className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Conversation Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-semibold truncate ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {isGroup ? conversation.groupName || 'Group Chat' : otherUser?.name || 'Unknown User'}
                                                </h3>
                                                {otherUser?.isVerified && (
                                                    <Verified className="w-4 h-4 text-blue-500" />
                                                )}
                                                {conversation.isMuted && (
                                                    <Mute className="w-3 h-3 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isTyping ? (
                                                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400 animate-pulse">
                                                        typing...
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                        {formatTime(lastMessage?.createdAt || conversation.updatedAt)}
                                                    </span>
                                                )}
                                                {!isSelectionMode && (
                                                    <ChevronDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 min-w-0">
                                                {isTyping ? (
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"></div>
                                                        <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                        <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                        <span className="text-sm text-purple-600 dark:text-purple-400">
                                                            {isTyping} is typing...
                                                        </span>
                                                    </div>
                                                ) : lastMessage ? (
                                                    <div className="flex items-center gap-2">
                                                        {lastMessage.sender_id === currentUser?.user_id && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                You:
                                                            </span>
                                                        )}
                                                        <p className={`text-sm truncate ${isUnread ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                            {lastMessage.content || (
                                                                lastMessage.mediaUrl ? (
                                                                    <span className="flex items-center gap-1">
                                                                        <Camera className="w-3 h-3" />
                                                                        Photo
                                                                    </span>
                                                                ) : 'Sent a message'
                                                            )}
                                                        </p>
                                                        {lastMessage.reactions && lastMessage.reactions.length > 0 && (
                                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                {lastMessage.reactions[0].emoji}
                                                                {lastMessage.reactions.length > 1 && ` +${lastMessage.reactions.length - 1}`}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                        Start a conversation
                                                    </p>
                                                )}
                                            </div>

                                            {/* Message Status */}
                                            {lastMessage?.sender_id === currentUser?.user_id && (
                                                <div className="flex-shrink-0">
                                                    {getStatusIcon(messageStatus)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Online Status / Last Seen */}
                                        {!isGroup && otherUser && (
                                            <div className="mt-1">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {isOnline ? (
                                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                            Online
                                                        </span>
                                                    ) : (
                                                        `Last seen ${getLastSeen(otherUser.user_id)}`
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Actions (Hover) */}
                                    {!isSelectionMode && (
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartVideoCall(conversation.chat_id);
                                                }}
                                                className="p-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full hover:shadow-lg transition-all"
                                                title="Video call"
                                            >
                                                <Video className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartVoiceCall(conversation.chat_id);
                                                }}
                                                className="p-2 bg-gradient-to-r from-green-500 to-emerald-400 text-white rounded-full hover:shadow-lg transition-all"
                                                title="Voice call"
                                            >
                                                <Phone className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            {!isSelectionMode && (
                <div className="absolute bottom-6 right-6">
                    <div className="flex flex-col items-end gap-3">
                        <div className="flex flex-col items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => {/* Create group */ }}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                <Users className="w-4 h-4" />
                                <span className="text-sm">New Group</span>
                            </button>
                            <button
                                onClick={onNewChat}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span className="text-sm">New Chat</span>
                            </button>
                        </div>
                        <button
                            onClick={onNewChat}
                            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 flex items-center justify-center"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatList;// components/ChatManager.jsx
