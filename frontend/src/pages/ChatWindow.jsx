
// import { useEffect, useState, useRef, useCallback } from "react";
// import api from "../api/axios";
// import io from "socket.io-client";

// const SOCKET_URL = "http://localhost:5000";

// const ChatWindow = ({ chatId, currentUser, onClose }) => {
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState("");
//     const [isConnected, setIsConnected] = useState(false);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);

//     const messagesEndRef = useRef(null);
//     const socketRef = useRef(null);
//     const isMountedRef = useRef(true);
//     const hasFetchedRef = useRef(false);

//     // Fetch messages with cache busting
//     const fetchMessages = useCallback(async () => {
//         if (!chatId || !currentUser?.user_id || hasFetchedRef.current) {
//             return;
//         }

//         console.log("🔍 Fetching messages for chat:", chatId);

//         try {
//             setIsLoading(true);
//             setError(null);
//             hasFetchedRef.current = true;

//             // ADD CACHE BUSTING PARAMETER
//             const timestamp = Date.now();
//             const res = await api.get(`/chat/${chatId}/messages`, {
//                 params: { _t: timestamp }, // Prevent caching
//                 headers: {
//                     'Cache-Control': 'no-cache, no-store, must-revalidate',
//                     'Pragma': 'no-cache',
//                     'Expires': '0'
//                 }
//             });

//             console.log("✅ Messages API response:", {
//                 status: res.status,
//                 dataLength: res.data?.length || 0,
//                 data: res.data
//             });

//             if (isMountedRef.current) {
//                 if (res.data && Array.isArray(res.data)) {
//                     setMessages(res.data);
//                 } else {
//                     console.warn("Unexpected response format:", res.data);
//                     setMessages([]);
//                 }
//             }

//         } catch (err) {
//             console.error("❌ Failed to load messages:", {
//                 message: err.message,
//                 status: err.response?.status,
//                 data: err.response?.data,
//                 config: err.config
//             });

//             if (isMountedRef.current) {
//                 setError(err.response?.data?.message || "Failed to load messages");
//                 setMessages([]);
//             }

//             // Reset fetch flag on error so we can retry
//             hasFetchedRef.current = false;
//         } finally {
//             if (isMountedRef.current) {
//                 setIsLoading(false);
//             }
//         }
//     }, [chatId, currentUser]);

//     // Initialize socket
//     const initSocket = useCallback(() => {
//         if (!chatId || !currentUser?.user_id) return;

//         console.log("🔌 Initializing socket...");

//         // Cleanup existing
//         if (socketRef.current) {
//             socketRef.current.disconnect();
//             socketRef.current = null;
//         }

//         socketRef.current = io(SOCKET_URL, {
//             transports: ["websocket", "polling"],
//             reconnection: true,
//             reconnectionAttempts: 3,
//             reconnectionDelay: 1000,
//         });

//         socketRef.current.on("connect", () => {
//             console.log("✅ Socket connected:", socketRef.current.id);
//             setIsConnected(true);
//             socketRef.current.emit("joinChat", chatId);
//         });

//         socketRef.current.on("disconnect", () => {
//             console.log("❌ Socket disconnected");
//             setIsConnected(false);
//         });

//         socketRef.current.on("connect_error", (error) => {
//             console.error("Socket error:", error.message);
//             setIsConnected(false);
//         });

//         socketRef.current.on("receiveMessage", (incomingMessage) => {
//             console.log("📩 Socket received message:", incomingMessage);

//             if (!incomingMessage) return;

//             setMessages(prev => {
//                 // Check for duplicates
//                 const exists = prev.some(msg =>
//                     msg.message_id === incomingMessage.message_id ||
//                     (msg.temp_id && msg.temp_id === incomingMessage.temp_id)
//                 );

//                 if (exists) return prev;

//                 return [...prev, incomingMessage];
//             });
//         });

//     }, [chatId, currentUser]);

//     // Main initialization
//     useEffect(() => {
//         isMountedRef.current = true;
//         hasFetchedRef.current = false;

//         if (!chatId || !currentUser?.user_id) {
//             console.log("⏸️ Missing chatId or currentUser");
//             return;
//         }

//         console.log("🚀 ChatWindow mounting with:", { chatId, userId: currentUser.user_id });

//         // Fetch messages
//         fetchMessages();

//         // Setup socket
//         initSocket();

//         return () => {
//             console.log("🧹 ChatWindow cleanup");
//             isMountedRef.current = false;
//             hasFetchedRef.current = false;

//             if (socketRef.current) {
//                 socketRef.current.disconnect();
//                 socketRef.current = null;
//             }
//         };
//     }, [chatId, currentUser, fetchMessages, initSocket]);

//     // Auto-scroll
//     useEffect(() => {
//         if (messages.length > 0 && !isLoading) {
//             setTimeout(() => {
//                 messagesEndRef.current?.scrollIntoView({
//                     behavior: "smooth",
//                     block: "end"
//                 });
//             }, 50);
//         }
//     }, [messages, isLoading]);

//     const sendMessage = async () => {
//         const trimmed = newMessage.trim();
//         if (!trimmed) return;

//         if (!isConnected) {
//             alert("Please wait for connection...");
//             return;
//         }

//         const temp_id = `temp_${Date.now()}`;
//         const optimisticMessage = {
//             temp_id,
//             content: trimmed,
//             sender_id: currentUser.user_id,
//             User: {
//                 user_id: currentUser.user_id,
//                 name: currentUser.name || "You",
//                 profilePic: currentUser.profilePic
//             },
//             createdAt: new Date().toISOString(),
//             isSending: true
//         };

//         setMessages(prev => [...prev, optimisticMessage]);
//         setNewMessage("");

//         try {
//             console.log("📤 Sending message...");
//             const response = await api.post(`/chat/${chatId}/message`, {
//                 content: trimmed,
//             }, {
//                 headers: {
//                     'Cache-Control': 'no-cache'
//                 }
//             });

//             console.log("✅ Message sent response:", response.data);

//             // Update optimistic message
//             setMessages(prev =>
//                 prev.map(msg =>
//                     msg.temp_id === temp_id
//                         ? { ...response.data, isSending: false }
//                         : msg
//                 )
//             );

//         } catch (err) {
//             console.error("❌ Send failed:", err);

//             setMessages(prev =>
//                 prev.map(msg =>
//                     msg.temp_id === temp_id
//                         ? { ...msg, isSending: false, failed: true }
//                         : msg
//                 )
//             );

//             alert("Failed to send message");
//         }
//     };

//     const handleKeyDown = (e) => {
//         if (e.key === "Enter" && !e.shiftKey) {
//             e.preventDefault();
//             sendMessage();
//         }
//     };

//     const retryLoad = () => {
//         hasFetchedRef.current = false;
//         setError(null);
//         fetchMessages();
//     };

//     return (
//         <div className="fixed inset-0 md:inset-auto md:bottom-8 md:right-8 w-full h-full md:w-80 lg:w-96 md:h-[500px] bg-white border md:rounded-lg shadow-2xl flex flex-col z-50">
//             {/* Header with debug info */}
//             <div className="flex justify-between items-center p-4 border-b bg-gray-50">
//                 <div className="flex items-center gap-3">
//                     <h2 className="font-semibold text-gray-900">Chat</h2>
//                     <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
//                     <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
//                         ID: {chatId}
//                     </span>
//                 </div>
//                 <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
//                     ×
//                 </button>
//             </div>

//             {/* Debug panel */}
//             <div className="px-4 py-2 bg-blue-50 border-b text-xs text-blue-700 flex justify-between items-center">
//                 <div>
//                     <span>Status: </span>
//                     <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
//                         {isConnected ? 'Connected' : 'Disconnected'}
//                     </span>
//                 </div>
//                 <div>
//                     <span>Messages: </span>
//                     <span className="font-medium">{messages.length}</span>
//                 </div>
//                 <button
//                     onClick={() => {
//                         console.log("Current state:", { messages, isLoading, error, chatId });
//                         retryLoad();
//                     }}
//                     className="text-blue-600 hover:text-blue-800 font-medium"
//                 >
//                     Refresh
//                 </button>
//             </div>

//             {/* Error display */}
//             {error && (
//                 <div className="p-3 bg-red-50 border-b">
//                     <div className="flex justify-between items-center">
//                         <span className="text-red-700 text-sm">{error}</span>
//                         <button
//                             onClick={retryLoad}
//                             className="text-red-700 hover:text-red-900 text-sm font-medium px-3 py-1 bg-red-100 rounded"
//                         >
//                             Retry
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
//                 {isLoading ? (
//                     <div className="flex flex-col items-center justify-center h-full space-y-3">
//                         <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
//                         <div className="text-center">
//                             <p className="text-gray-700 font-medium">Loading messages...</p>
//                             <p className="text-gray-500 text-sm mt-1">Chat ID: {chatId}</p>
//                         </div>
//                     </div>
//                 ) : messages.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center h-full text-center p-8">
//                         <div className="text-5xl mb-4">💬</div>
//                         <h3 className="text-gray-800 font-medium text-lg">No messages yet</h3>
//                         <p className="text-gray-500 mt-2">Start the conversation!</p>
//                         <div className="mt-4 text-xs text-gray-400 space-y-1">
//                             <p>Chat ID: {chatId}</p>
//                             <p>Status: {isConnected ? 'Connected ✓' : 'Disconnected ✗'}</p>
//                         </div>
//                         <button
//                             onClick={retryLoad}
//                             className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
//                         >
//                             Load Messages
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="space-y-3">
//                         {messages.map((msg, index) => {
//                             const isMe = msg.sender_id === currentUser.user_id;
//                             const isOptimistic = msg.isSending;
//                             const isFailed = msg.failed;

//                             return (
//                                 <div
//                                     key={msg.message_id || msg.temp_id || `msg-${index}`}
//                                     className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
//                                 >
//                                     <div className={`max-w-[85%] ${isMe ? 'text-right' : ''}`}>
//                                         {!isMe && msg.User?.name && (
//                                             <div className="text-xs text-gray-600 mb-1 ml-1">
//                                                 {msg.User.name}
//                                             </div>
//                                         )}
//                                         <div className={`rounded-2xl px-4 py-3 ${isMe
//                                             ? `bg-indigo-600 text-white ${isOptimistic ? 'opacity-80' : ''} ${isFailed ? 'bg-red-100 text-red-800' : ''}`
//                                             : 'bg-white border text-gray-800'
//                                             }`}>
//                                             <div className="text-sm">{msg.content}</div>
//                                             <div className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
//                                                 {new Date(msg.createdAt).toLocaleTimeString([], {
//                                                     hour: '2-digit',
//                                                     minute: '2-digit'
//                                                 })}
//                                                 {isOptimistic && <span className="ml-2">🕐</span>}
//                                                 {isFailed && <span className="ml-2 text-red-300">✗</span>}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                         <div ref={messagesEndRef} />
//                     </div>
//                 )}
//             </div>

//             {/* Input */}
//             <div className="border-t p-4 bg-white">
//                 <div className="flex gap-2">
//                     <input
//                         type="text"
//                         value={newMessage}
//                         onChange={(e) => setNewMessage(e.target.value)}
//                         onKeyDown={handleKeyDown}
//                         placeholder={isConnected ? "Type a message..." : "Connecting..."}
//                         className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
//                         disabled={!isConnected}
//                     />
//                     <button
//                         onClick={sendMessage}
//                         disabled={!newMessage.trim() || !isConnected}
//                         className="px-5 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
//                     >
//                         Send
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ChatWindow;

// ChatWindow.jsx - FINAL FIXED VERSION (no duplicates)
// ChatWindow.jsx - SIMPLER VERSION
import { useEffect, useState, useRef, useCallback } from "react";
import api from "../api/axios";
import io from "socket.io-client";
import { ArrowLeft, Send, Paperclip, Smile, MoreVertical } from "lucide-react";

const SOCKET_URL = "http://localhost:5000";

const ChatWindow = ({ chatId, currentUser, onClose, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const lastMessageIdRef = useRef(null);

    // Check if mobile
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchMessages = useCallback(async () => {
        if (!chatId) return;

        try {
            setIsLoading(true);
            const res = await api.get(`/chat/${chatId}/messages`);
            setMessages(res.data || []);

            if (res.data && res.data.length > 0) {
                lastMessageIdRef.current = res.data[res.data.length - 1].message_id;
            }

        } catch (err) {
            console.error("Failed to load messages:", err);
        } finally {
            setIsLoading(false);
        }
    }, [chatId]);

    useEffect(() => {
        if (!chatId || !currentUser?.user_id) return;

        fetchMessages();

        socketRef.current = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            reconnection: true,
        });

        socketRef.current.on("connect", () => {
            setIsConnected(true);
            socketRef.current.emit("joinChat", chatId);
        });

        socketRef.current.on("disconnect", () => {
            setIsConnected(false);
        });

        socketRef.current.on("receiveMessage", (incomingMessage) => {
            if (!incomingMessage) return;

            setMessages(prev => {
                const exists = prev.some(msg =>
                    msg.message_id === incomingMessage.message_id
                );

                if (exists) {
                    return prev;
                }

                if (lastMessageIdRef.current &&
                    incomingMessage.message_id <= lastMessageIdRef.current) {
                    return prev;
                }

                lastMessageIdRef.current = incomingMessage.message_id;
                return [...prev, incomingMessage];
            });
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [chatId, currentUser?.user_id, fetchMessages]);

    useEffect(() => {
        if (messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const sendMessage = async () => {
        const trimmed = newMessage.trim();
        if (!trimmed || !isConnected) return;

        setNewMessage("");

        try {
            await api.post(`/chat/${chatId}/message`, {
                content: trimmed,
            });
        } catch (err) {
            console.error("Send failed:", err);
            alert("Failed to send message");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Function to handle back button
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (onClose) {
            onClose();
        }
    };

    return (
        <div className="
            fixed inset-0 
            md:inset-auto md:bottom-8 md:right-8 
            w-full h-full 
            md:w-80 lg:w-96 md:h-[500px] 
            bg-white
            md:border md:rounded-lg
            flex flex-col 
            z-50
        ">
            {/* Instagram-like Header with Back Button */}
            <div className="
                flex items-center justify-between
                p-3 border-b
                bg-white
                sticky top-0 z-10
                md:rounded-t-lg
            ">
                {/* Left: Back button and user info */}
                <div className="flex items-center gap-3">
                    {isMobile ? (
                        <button
                            onClick={handleBack}
                            className="p-2 -ml-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="p-2 -ml-2"
                        >
                            <span className="text-2xl">×</span>
                        </button>
                    )}

                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {currentUser?.name?.charAt(0) || 'U'}
                        </div>

                        <div>
                            <h3 className="font-semibold text-sm">
                                {currentUser?.name || 'User'}
                            </h3>
                            <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                                <span className="text-xs text-gray-500">
                                    {isConnected ? 'Active now' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: More options */}
                <button className="p-2">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Container */}
            <div className="
                flex-1 overflow-y-auto 
                p-4
                bg-gradient-to-b from-white to-gray-50
                pb-24 md:pb-4
            ">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <div className="text-4xl mb-4 opacity-20">💬</div>
                        <p className="text-gray-400">No messages yet</p>
                        <p className="text-sm text-gray-300 mt-1">Start the conversation</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => {
                            const isMe = msg.sender_id === currentUser.user_id;

                            return (
                                <div
                                    key={`msg_${msg.message_id}_${msg.createdAt}`}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] ${isMe ? 'text-right' : ''}`}>
                                        <div className={`
                                            px-4 py-3 
                                            ${isMe
                                                ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-2xl rounded-tr-none'
                                                : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-none'
                                            }
                                            shadow-sm
                                        `}>
                                            <div className="text-sm">
                                                {msg.content}
                                            </div>
                                            <div className={`
                                                text-xs mt-1
                                                ${isMe ? 'text-blue-100' : 'text-gray-500'}
                                            `}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Section */}
            <div className="
                absolute bottom-0 left-0 right-0
                md:static
                p-3
                bg-white
                border-t
            ">
                <div className="flex items-center gap-2">
                    <button className="
                        p-2
                        text-gray-500
                        hover:text-gray-700
                    ">
                        <Paperclip className="w-5 h-5" />
                    </button>

                    <button className="
                        p-2
                        text-gray-500
                        hover:text-gray-700
                    ">
                        <Smile className="w-5 h-5" />
                    </button>

                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message..."
                        className="
                            flex-1 px-4 py-3
                            bg-gray-100
                            rounded-full
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            text-sm
                            placeholder-gray-500
                        "
                        disabled={!isConnected}
                    />

                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || !isConnected}
                        className={`
                            p-2
                            rounded-full
                            ${newMessage.trim()
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'text-gray-400'
                            }
                            transition-colors
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;