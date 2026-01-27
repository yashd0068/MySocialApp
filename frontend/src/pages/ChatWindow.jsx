
// // import { useEffect, useState, useRef, useCallback } from "react";
// // import api from "../api/axios";
// // import io from "socket.io-client";

// // const SOCKET_URL = "http://localhost:5000";

// // const ChatWindow = ({ chatId, currentUser, onClose }) => {
// //     const [messages, setMessages] = useState([]);
// //     const [newMessage, setNewMessage] = useState("");
// //     const [isConnected, setIsConnected] = useState(false);
// //     const [isLoading, setIsLoading] = useState(true);
// //     const [error, setError] = useState(null);

// //     const messagesEndRef = useRef(null);
// //     const socketRef = useRef(null);
// //     const isMountedRef = useRef(true);
// //     const hasFetchedRef = useRef(false);

// //     // Fetch messages with cache busting
// //     const fetchMessages = useCallback(async () => {
// //         if (!chatId || !currentUser?.user_id || hasFetchedRef.current) {
// //             return;
// //         }

// //         console.log("🔍 Fetching messages for chat:", chatId);

// //         try {
// //             setIsLoading(true);
// //             setError(null);
// //             hasFetchedRef.current = true;

// //             // ADD CACHE BUSTING PARAMETER
// //             const timestamp = Date.now();
// //             const res = await api.get(`/chat/${chatId}/messages`, {
// //                 params: { _t: timestamp }, // Prevent caching
// //                 headers: {
// //                     'Cache-Control': 'no-cache, no-store, must-revalidate',
// //                     'Pragma': 'no-cache',
// //                     'Expires': '0'
// //                 }
// //             });

// //             console.log("✅ Messages API response:", {
// //                 status: res.status,
// //                 dataLength: res.data?.length || 0,
// //                 data: res.data
// //             });

// //             if (isMountedRef.current) {
// //                 if (res.data && Array.isArray(res.data)) {
// //                     setMessages(res.data);
// //                 } else {
// //                     console.warn("Unexpected response format:", res.data);
// //                     setMessages([]);
// //                 }
// //             }

// //         } catch (err) {
// //             console.error("❌ Failed to load messages:", {
// //                 message: err.message,
// //                 status: err.response?.status,
// //                 data: err.response?.data,
// //                 config: err.config
// //             });

// //             if (isMountedRef.current) {
// //                 setError(err.response?.data?.message || "Failed to load messages");
// //                 setMessages([]);
// //             }

// //             // Reset fetch flag on error so we can retry
// //             hasFetchedRef.current = false;
// //         } finally {
// //             if (isMountedRef.current) {
// //                 setIsLoading(false);
// //             }
// //         }
// //     }, [chatId, currentUser]);

// //     // Initialize socket
// //     const initSocket = useCallback(() => {
// //         if (!chatId || !currentUser?.user_id) return;

// //         console.log("🔌 Initializing socket...");

// //         // Cleanup existing
// //         if (socketRef.current) {
// //             socketRef.current.disconnect();
// //             socketRef.current = null;
// //         }

// //         socketRef.current = io(SOCKET_URL, {
// //             transports: ["websocket", "polling"],
// //             reconnection: true,
// //             reconnectionAttempts: 3,
// //             reconnectionDelay: 1000,
// //         });

// //         socketRef.current.on("connect", () => {
// //             console.log("✅ Socket connected:", socketRef.current.id);
// //             setIsConnected(true);
// //             socketRef.current.emit("joinChat", chatId);
// //         });

// //         socketRef.current.on("disconnect", () => {
// //             console.log("❌ Socket disconnected");
// //             setIsConnected(false);
// //         });

// //         socketRef.current.on("connect_error", (error) => {
// //             console.error("Socket error:", error.message);
// //             setIsConnected(false);
// //         });

// //         socketRef.current.on("receiveMessage", (incomingMessage) => {
// //             console.log("📩 Socket received message:", incomingMessage);

// //             if (!incomingMessage) return;

// //             setMessages(prev => {
// //                 // Check for duplicates
// //                 const exists = prev.some(msg =>
// //                     msg.message_id === incomingMessage.message_id ||
// //                     (msg.temp_id && msg.temp_id === incomingMessage.temp_id)
// //                 );

// //                 if (exists) return prev;

// //                 return [...prev, incomingMessage];
// //             });
// //         });

// //     }, [chatId, currentUser]);

// //     // Main initialization
// //     useEffect(() => {
// //         isMountedRef.current = true;
// //         hasFetchedRef.current = false;

// //         if (!chatId || !currentUser?.user_id) {
// //             console.log("⏸️ Missing chatId or currentUser");
// //             return;
// //         }

// //         console.log("🚀 ChatWindow mounting with:", { chatId, userId: currentUser.user_id });

// //         // Fetch messages
// //         fetchMessages();

// //         // Setup socket
// //         initSocket();

// //         return () => {
// //             console.log("🧹 ChatWindow cleanup");
// //             isMountedRef.current = false;
// //             hasFetchedRef.current = false;

// //             if (socketRef.current) {
// //                 socketRef.current.disconnect();
// //                 socketRef.current = null;
// //             }
// //         };
// //     }, [chatId, currentUser, fetchMessages, initSocket]);

// //     // Auto-scroll
// //     useEffect(() => {
// //         if (messages.length > 0 && !isLoading) {
// //             setTimeout(() => {
// //                 messagesEndRef.current?.scrollIntoView({
// //                     behavior: "smooth",
// //                     block: "end"
// //                 });
// //             }, 50);
// //         }
// //     }, [messages, isLoading]);

// //     const sendMessage = async () => {
// //         const trimmed = newMessage.trim();
// //         if (!trimmed) return;

// //         if (!isConnected) {
// //             alert("Please wait for connection...");
// //             return;
// //         }

// //         const temp_id = `temp_${Date.now()}`;
// //         const optimisticMessage = {
// //             temp_id,
// //             content: trimmed,
// //             sender_id: currentUser.user_id,
// //             User: {
// //                 user_id: currentUser.user_id,
// //                 name: currentUser.name || "You",
// //                 profilePic: currentUser.profilePic
// //             },
// //             createdAt: new Date().toISOString(),
// //             isSending: true
// //         };

// //         setMessages(prev => [...prev, optimisticMessage]);
// //         setNewMessage("");

// //         try {
// //             console.log("📤 Sending message...");
// //             const response = await api.post(`/chat/${chatId}/message`, {
// //                 content: trimmed,
// //             }, {
// //                 headers: {
// //                     'Cache-Control': 'no-cache'
// //                 }
// //             });

// //             console.log("✅ Message sent response:", response.data);

// //             // Update optimistic message
// //             setMessages(prev =>
// //                 prev.map(msg =>
// //                     msg.temp_id === temp_id
// //                         ? { ...response.data, isSending: false }
// //                         : msg
// //                 )
// //             );

// //         } catch (err) {
// //             console.error("❌ Send failed:", err);

// //             setMessages(prev =>
// //                 prev.map(msg =>
// //                     msg.temp_id === temp_id
// //                         ? { ...msg, isSending: false, failed: true }
// //                         : msg
// //                 )
// //             );

// //             alert("Failed to send message");
// //         }
// //     };

// //     const handleKeyDown = (e) => {
// //         if (e.key === "Enter" && !e.shiftKey) {
// //             e.preventDefault();
// //             sendMessage();
// //         }
// //     };

// //     const retryLoad = () => {
// //         hasFetchedRef.current = false;
// //         setError(null);
// //         fetchMessages();
// //     };

// //     return (
// //         <div className="fixed inset-0 md:inset-auto md:bottom-8 md:right-8 w-full h-full md:w-80 lg:w-96 md:h-[500px] bg-white border md:rounded-lg shadow-2xl flex flex-col z-50">
// //             {/* Header with debug info */}
// //             <div className="flex justify-between items-center p-4 border-b bg-gray-50">
// //                 <div className="flex items-center gap-3">
// //                     <h2 className="font-semibold text-gray-900">Chat</h2>
// //                     <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
// //                     <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
// //                         ID: {chatId}
// //                     </span>
// //                 </div>
// //                 <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
// //                     ×
// //                 </button>
// //             </div>

// //             {/* Debug panel */}
// //             <div className="px-4 py-2 bg-blue-50 border-b text-xs text-blue-700 flex justify-between items-center">
// //                 <div>
// //                     <span>Status: </span>
// //                     <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
// //                         {isConnected ? 'Connected' : 'Disconnected'}
// //                     </span>
// //                 </div>
// //                 <div>
// //                     <span>Messages: </span>
// //                     <span className="font-medium">{messages.length}</span>
// //                 </div>
// //                 <button
// //                     onClick={() => {
// //                         console.log("Current state:", { messages, isLoading, error, chatId });
// //                         retryLoad();
// //                     }}
// //                     className="text-blue-600 hover:text-blue-800 font-medium"
// //                 >
// //                     Refresh
// //                 </button>
// //             </div>

// //             {/* Error display */}
// //             {error && (
// //                 <div className="p-3 bg-red-50 border-b">
// //                     <div className="flex justify-between items-center">
// //                         <span className="text-red-700 text-sm">{error}</span>
// //                         <button
// //                             onClick={retryLoad}
// //                             className="text-red-700 hover:text-red-900 text-sm font-medium px-3 py-1 bg-red-100 rounded"
// //                         >
// //                             Retry
// //                         </button>
// //                     </div>
// //                 </div>
// //             )}

// //             {/* Messages */}
// //             <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
// //                 {isLoading ? (
// //                     <div className="flex flex-col items-center justify-center h-full space-y-3">
// //                         <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
// //                         <div className="text-center">
// //                             <p className="text-gray-700 font-medium">Loading messages...</p>
// //                             <p className="text-gray-500 text-sm mt-1">Chat ID: {chatId}</p>
// //                         </div>
// //                     </div>
// //                 ) : messages.length === 0 ? (
// //                     <div className="flex flex-col items-center justify-center h-full text-center p-8">
// //                         <div className="text-5xl mb-4">💬</div>
// //                         <h3 className="text-gray-800 font-medium text-lg">No messages yet</h3>
// //                         <p className="text-gray-500 mt-2">Start the conversation!</p>
// //                         <div className="mt-4 text-xs text-gray-400 space-y-1">
// //                             <p>Chat ID: {chatId}</p>
// //                             <p>Status: {isConnected ? 'Connected ✓' : 'Disconnected ✗'}</p>
// //                         </div>
// //                         <button
// //                             onClick={retryLoad}
// //                             className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
// //                         >
// //                             Load Messages
// //                         </button>
// //                     </div>
// //                 ) : (
// //                     <div className="space-y-3">
// //                         {messages.map((msg, index) => {
// //                             const isMe = msg.sender_id === currentUser.user_id;
// //                             const isOptimistic = msg.isSending;
// //                             const isFailed = msg.failed;

// //                             return (
// //                                 <div
// //                                     key={msg.message_id || msg.temp_id || `msg-${index}`}
// //                                     className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
// //                                 >
// //                                     <div className={`max-w-[85%] ${isMe ? 'text-right' : ''}`}>
// //                                         {!isMe && msg.User?.name && (
// //                                             <div className="text-xs text-gray-600 mb-1 ml-1">
// //                                                 {msg.User.name}
// //                                             </div>
// //                                         )}
// //                                         <div className={`rounded-2xl px-4 py-3 ${isMe
// //                                             ? `bg-indigo-600 text-white ${isOptimistic ? 'opacity-80' : ''} ${isFailed ? 'bg-red-100 text-red-800' : ''}`
// //                                             : 'bg-white border text-gray-800'
// //                                             }`}>
// //                                             <div className="text-sm">{msg.content}</div>
// //                                             <div className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
// //                                                 {new Date(msg.createdAt).toLocaleTimeString([], {
// //                                                     hour: '2-digit',
// //                                                     minute: '2-digit'
// //                                                 })}
// //                                                 {isOptimistic && <span className="ml-2">🕐</span>}
// //                                                 {isFailed && <span className="ml-2 text-red-300">✗</span>}
// //                                             </div>
// //                                         </div>
// //                                     </div>
// //                                 </div>
// //                             );
// //                         })}
// //                         <div ref={messagesEndRef} />
// //                     </div>
// //                 )}
// //             </div>

// //             {/* Input */}
// //             <div className="border-t p-4 bg-white">
// //                 <div className="flex gap-2">
// //                     <input
// //                         type="text"
// //                         value={newMessage}
// //                         onChange={(e) => setNewMessage(e.target.value)}
// //                         onKeyDown={handleKeyDown}
// //                         placeholder={isConnected ? "Type a message..." : "Connecting..."}
// //                         className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
// //                         disabled={!isConnected}
// //                     />
// //                     <button
// //                         onClick={sendMessage}
// //                         disabled={!newMessage.trim() || !isConnected}
// //                         className="px-5 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
// //                     >
// //                         Send
// //                     </button>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default ChatWindow;

// // ChatWindow.jsx - FINAL FIXED VERSION (no duplicates)
// // ChatWindow.jsx - SIMPLER VERSION
// // ChatWindow.jsx - UPDATED VERSION with proper participant name
// // import { useEffect, useState, useRef, useCallback } from "react";
// // import api from "../api/axios";
// // import io from "socket.io-client";
// // import { ArrowLeft, Send, Paperclip, Smile, MoreVertical } from "lucide-react";

// // const SOCKET_URL = "http://localhost:5000";

// // const ChatWindow = ({ chatId, currentUser, onClose, onBack, otherParticipant }) => {
// //     const [messages, setMessages] = useState([]);
// //     const [newMessage, setNewMessage] = useState("");
// //     const [isConnected, setIsConnected] = useState(false);
// //     const [isLoading, setIsLoading] = useState(true);
// //     const [chatInfo, setChatInfo] = useState(null); // Store chat/participant info

// //     const messagesEndRef = useRef(null);
// //     const socketRef = useRef(null);
// //     const lastMessageIdRef = useRef(null);

// //     // Check if mobile
// //     const [isMobile, setIsMobile] = useState(false);

// //     useEffect(() => {
// //         const checkMobile = () => {
// //             setIsMobile(window.innerWidth < 768);
// //         };
// //         checkMobile();
// //         window.addEventListener('resize', checkMobile);
// //         return () => window.removeEventListener('resize', checkMobile);
// //     }, []);

// //     // Fetch chat info including other participant details
// //     const fetchChatInfo = useCallback(async () => {
// //         if (!chatId) return;

// //         try {
// //             // Option 1: If you have an endpoint that returns chat details with participants
// //             const res = await api.get(`/chat/${chatId}/info`);
// //             setChatInfo(res.data);

// //             // OR Option 2: If you need to fetch participants separately
// //             // const participantsRes = await api.get(`/chat/${chatId}/participants`);
// //             // const otherUser = participantsRes.data.find(p => p.user_id !== currentUser.user_id);
// //             // setOtherParticipant(otherUser);

// //         } catch (err) {
// //             console.error("Failed to load chat info:", err);
// //         }
// //     }, [chatId]);

// //     const fetchMessages = useCallback(async () => {
// //         if (!chatId) return;

// //         try {
// //             setIsLoading(true);
// //             const res = await api.get(`/chat/${chatId}/messages`);
// //             setMessages(res.data || []);

// //             if (res.data && res.data.length > 0) {
// //                 lastMessageIdRef.current = res.data[res.data.length - 1].message_id;
// //             }

// //         } catch (err) {
// //             console.error("Failed to load messages:", err);
// //         } finally {
// //             setIsLoading(false);
// //         }
// //     }, [chatId]);

// //     useEffect(() => {
// //         if (!chatId || !currentUser?.user_id) return;

// //         // Fetch both messages and chat info
// //         fetchChatInfo();
// //         fetchMessages();

// //         socketRef.current = io(SOCKET_URL, {
// //             transports: ["websocket", "polling"],
// //             reconnection: true,
// //         });

// //         socketRef.current.on("connect", () => {
// //             setIsConnected(true);
// //             socketRef.current.emit("joinChat", chatId);
// //         });

// //         socketRef.current.on("disconnect", () => {
// //             setIsConnected(false);
// //         });

// //         socketRef.current.on("receiveMessage", (incomingMessage) => {
// //             if (!incomingMessage) return;

// //             setMessages(prev => {
// //                 const exists = prev.some(msg =>
// //                     msg.message_id === incomingMessage.message_id
// //                 );

// //                 if (exists) return prev;

// //                 if (lastMessageIdRef.current &&
// //                     incomingMessage.message_id <= lastMessageIdRef.current) {
// //                     return prev;
// //                 }

// //                 lastMessageIdRef.current = incomingMessage.message_id;
// //                 return [...prev, incomingMessage];
// //             });
// //         });

// //         return () => {
// //             if (socketRef.current) {
// //                 socketRef.current.disconnect();
// //                 socketRef.current = null;
// //             }
// //         };
// //     }, [chatId, currentUser?.user_id, fetchMessages, fetchChatInfo]);

// //     useEffect(() => {
// //         if (messages.length > 0) {
// //             messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
// //         }
// //     }, [messages]);

// //     // Determine the display name
// //     const getDisplayName = () => {
// //         // Priority order:
// //         // 1. If otherParticipant prop is passed directly
// //         if (otherParticipant) {
// //             return otherParticipant.name || 'User';
// //         }

// //         // 2. If chatInfo has participants data
// //         if (chatInfo?.participants) {
// //             const otherUser = chatInfo.participants.find(
// //                 p => p.user_id !== currentUser.user_id
// //             );
// //             return otherUser?.name || 'User';
// //         }

// //         // 3. Check the last message sender (fallback)
// //         if (messages.length > 0) {
// //             const lastMessage = messages[messages.length - 1];
// //             if (lastMessage.sender_id !== currentUser.user_id) {
// //                 return lastMessage.User?.name || 'User';
// //             }
// //         }

// //         // 4. Default
// //         return 'User';
// //     };

// //     // Get the other user's avatar
// //     const getDisplayAvatar = () => {
// //         if (otherParticipant) {
// //             return otherParticipant.profilePic || otherParticipant.name?.charAt(0) || 'U';
// //         }

// //         if (chatInfo?.participants) {
// //             const otherUser = chatInfo.participants.find(
// //                 p => p.user_id !== currentUser.user_id
// //             );
// //             return otherUser?.profilePic || otherUser?.name?.charAt(0) || 'U';
// //         }

// //         return 'U';
// //     };

// //     const sendMessage = async () => {
// //         const trimmed = newMessage.trim();
// //         if (!trimmed || !isConnected) return;

// //         setNewMessage("");

// //         try {
// //             await api.post(`/chat/${chatId}/message`, {
// //                 content: trimmed,
// //             });
// //         } catch (err) {
// //             console.error("Send failed:", err);
// //             alert("Failed to send message");
// //         }
// //     };

// //     const handleKeyDown = (e) => {
// //         if (e.key === "Enter" && !e.shiftKey) {
// //             e.preventDefault();
// //             sendMessage();
// //         }
// //     };

// //     const handleBack = () => {
// //         if (onBack) {
// //             onBack();
// //         } else if (onClose) {
// //             onClose();
// //         }
// //     };

// //     // Get the display name
// //     const displayName = getDisplayName();
// //     const displayAvatar = getDisplayAvatar();

// //     return (
// //         <div className="
// //             fixed inset-0 
// //             md:inset-auto md:bottom-8 md:right-8 
// //             w-full h-full 
// //             md:w-80 lg:w-96 md:h-[500px] 
// //             bg-white
// //             md:border md:rounded-lg
// //             flex flex-col 
// //             z-50
// //         ">
// //             {/* Header with Other User's Info */}
// //             <div className="
// //                 flex items-center justify-between
// //                 p-3 border-b
// //                 bg-white
// //                 sticky top-0 z-10
// //                 md:rounded-t-lg
// //             ">
// //                 {/* Left: Back button and OTHER user info */}
// //                 <div className="flex items-center gap-3">
// //                     {isMobile ? (
// //                         <button
// //                             onClick={handleBack}
// //                             className="p-2 -ml-2"
// //                         >
// //                             <ArrowLeft className="w-5 h-5" />
// //                         </button>
// //                     ) : (
// //                         <button
// //                             onClick={onClose}
// //                             className="p-2 -ml-2"
// //                         >
// //                             <span className="text-2xl">×</span>
// //                         </button>
// //                     )}

// //                     <div className="flex items-center gap-3">
// //                         {/* Other user's Avatar */}
// //                         <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
// //                             {typeof displayAvatar === 'string' && displayAvatar.length === 1
// //                                 ? displayAvatar
// //                                 : 'U'}
// //                         </div>

// //                         <div>
// //                             <h3 className="font-semibold text-sm">
// //                                 {displayName}
// //                             </h3>
// //                             <div className="flex items-center gap-1">
// //                                 <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
// //                                 <span className="text-xs text-gray-500">
// //                                     {isConnected ? 'Active now' : 'Offline'}
// //                                 </span>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>

// //                 {/* Right: More options */}
// //                 <button className="p-2">
// //                     <MoreVertical className="w-5 h-5" />
// //                 </button>
// //             </div>

// //             {/* Messages Container */}
// //             <div className="
// //                 flex-1 overflow-y-auto 
// //                 p-4
// //                 bg-gradient-to-b from-white to-gray-50
// //                 pb-24 md:pb-4
// //             ">
// //                 {isLoading ? (
// //                     <div className="flex items-center justify-center h-full">
// //                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
// //                     </div>
// //                 ) : messages.length === 0 ? (
// //                     <div className="text-center text-gray-500 py-10">
// //                         <div className="text-4xl mb-4 opacity-20">💬</div>
// //                         <p className="text-gray-400">No messages yet</p>
// //                         <p className="text-sm text-gray-300 mt-1">Start a conversation with {displayName}</p>
// //                     </div>
// //                 ) : (
// //                     <div className="space-y-4">
// //                         {messages.map((msg) => {
// //                             const isMe = msg.sender_id === currentUser.user_id;

// //                             return (
// //                                 <div
// //                                     key={`msg_${msg.message_id}_${msg.createdAt}`}
// //                                     className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
// //                                 >
// //                                     <div className={`max-w-[80%] ${isMe ? 'text-right' : ''}`}>
// //                                         {/* Show sender name for other users' messages */}
// //                                         {!isMe && msg.User?.name && (
// //                                             <div className="text-xs text-gray-600 mb-1 ml-1">
// //                                                 {msg.User.name}
// //                                             </div>
// //                                         )}
// //                                         <div className={`
// //                                             px-4 py-3 
// //                                             ${isMe
// //                                                 ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-2xl rounded-tr-none'
// //                                                 : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-none'
// //                                             }
// //                                             shadow-sm
// //                                         `}>
// //                                             <div className="text-sm">
// //                                                 {msg.content}
// //                                             </div>
// //                                             <div className={`
// //                                                 text-xs mt-1
// //                                                 ${isMe ? 'text-blue-100' : 'text-gray-500'}
// //                                             `}>
// //                                                 {new Date(msg.createdAt).toLocaleTimeString([], {
// //                                                     hour: '2-digit',
// //                                                     minute: '2-digit'
// //                                                 })}
// //                                             </div>
// //                                         </div>
// //                                     </div>
// //                                 </div>
// //                             );
// //                         })}
// //                         <div ref={messagesEndRef} />
// //                     </div>
// //                 )}
// //             </div>

// //             {/* Input Section */}
// //             <div className="
// //                 absolute bottom-0 left-0 right-0
// //                 md:static
// //                 p-3
// //                 bg-white
// //                 border-t
// //             ">
// //                 <div className="flex items-center gap-2">
// //                     <button className="
// //                         p-2
// //                         text-gray-500
// //                         hover:text-gray-700
// //                     ">
// //                         <Paperclip className="w-5 h-5" />
// //                     </button>

// //                     <button className="
// //                         p-2
// //                         text-gray-500
// //                         hover:text-gray-700
// //                     ">
// //                         <Smile className="w-5 h-5" />
// //                     </button>

// //                     <input
// //                         type="text"
// //                         value={newMessage}
// //                         onChange={(e) => setNewMessage(e.value)}
// //                         onKeyDown={handleKeyDown}
// //                         placeholder={`Message ${displayName}...`}
// //                         className="
// //                             flex-1 px-4 py-3
// //                             bg-gray-100
// //                             rounded-full
// //                             focus:outline-none focus:ring-2 focus:ring-blue-500
// //                             text-sm
// //                             placeholder-gray-500
// //                         "
// //                         disabled={!isConnected}
// //                     />

// //                     <button
// //                         onClick={sendMessage}
// //                         disabled={!newMessage.trim() || !isConnected}
// //                         className={`
// //                             p-2
// //                             rounded-full
// //                             ${newMessage.trim()
// //                                 ? 'bg-blue-500 text-white hover:bg-blue-600'
// //                                 : 'text-gray-400'
// //                             }
// //                             transition-colors
// //                             disabled:opacity-50 disabled:cursor-not-allowed
// //                         `}
// //                     >
// //                         <Send className="w-5 h-5" />
// //                     </button>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default ChatWindow;
// // import { useEffect, useState, useRef, useCallback } from "react";
// // import api from "../api/axios";
// // import io from "socket.io-client";
// // import {
// //     ArrowLeft,
// //     Send,
// //     Paperclip,
// //     Smile,
// //     MoreVertical,
// //     Check,
// //     CheckCheck,
// //     Clock,
// //     AlertCircle
// // } from "lucide-react";

// // const SOCKET_URL = "http://localhost:5000";

// // const ChatWindow = ({ chatId, currentUser, onClose, onBack, otherParticipant }) => {
// //     const [messages, setMessages] = useState([]);
// //     const [newMessage, setNewMessage] = useState("");
// //     const [isConnected, setIsConnected] = useState(false);
// //     const [isLoading, setIsLoading] = useState(true);
// //     const [chatInfo, setChatInfo] = useState(null);
// //     const [isTyping, setIsTyping] = useState(false);
// //     const [typingUser, setTypingUser] = useState(null);
// //     const [error, setError] = useState(null);

// //     const messagesEndRef = useRef(null);
// //     const socketRef = useRef(null);
// //     const typingTimeoutRef = useRef(null);
// //     const typingDebounceRef = useRef(null);
// //     const isMountedRef = useRef(true);

// //     // Check if mobile
// //     const [isMobile, setIsMobile] = useState(false);

// //     useEffect(() => {
// //         const checkMobile = () => {
// //             setIsMobile(window.innerWidth < 768);
// //         };
// //         checkMobile();
// //         window.addEventListener('resize', checkMobile);
// //         return () => window.removeEventListener('resize', checkMobile);
// //     }, []);

// //     // Fetch chat info including other participant details
// //     const fetchChatInfo = useCallback(async () => {
// //         if (!chatId) return;

// //         try {
// //             // Try different endpoints
// //             try {
// //                 const res = await api.get(`/chat/${chatId}/info`);
// //                 setChatInfo(res.data);
// //             } catch {
// //                 // If that fails, try participants endpoint
// //                 const participantsRes = await api.get(`/chat/${chatId}/participants`);
// //                 setChatInfo({ participants: participantsRes.data });
// //             }
// //         } catch (err) {
// //             console.error("Failed to load chat info:", err);
// //         }
// //     }, [chatId]);

// //     const fetchMessages = useCallback(async () => {
// //         if (!chatId) return;

// //         try {
// //             setIsLoading(true);
// //             setError(null);
// //             const res = await api.get(`/chat/${chatId}/messages`);
// //             console.log("Fetched messages:", res.data);

// //             // Add status to messages if not present
// //             const messagesWithStatus = (res.data || []).map(msg => ({
// //                 ...msg,
// //                 status: msg.status || 'delivered' // Default status
// //             }));

// //             setMessages(messagesWithStatus);

// //         } catch (err) {
// //             console.error("Failed to load messages:", err);
// //             setError("Failed to load messages. Please try again.");
// //         } finally {
// //             setIsLoading(false);
// //         }
// //     }, [chatId]);

// //     useEffect(() => {
// //         if (!chatId || !currentUser?.user_id) return;

// //         console.log("Initializing chat window for chatId:", chatId);

// //         fetchChatInfo();
// //         fetchMessages();

// //         // Initialize socket
// //         socketRef.current = io(SOCKET_URL, {
// //             transports: ["websocket", "polling"],
// //             reconnection: true,
// //             reconnectionAttempts: 5,
// //             reconnectionDelay: 1000,
// //         });

// //         // Socket event handlers
// //         socketRef.current.on("connect", () => {
// //             console.log("✅ Socket connected:", socketRef.current.id);
// //             setIsConnected(true);
// //             socketRef.current.emit("joinChat", chatId);

// //             // Send user info
// //             socketRef.current.emit("userInfo", {
// //                 userId: currentUser.user_id,
// //                 userName: currentUser.name || currentUser.username || "User"
// //             });
// //         });

// //         socketRef.current.on("disconnect", () => {
// //             console.log("❌ Socket disconnected");
// //             setIsConnected(false);
// //         });

// //         socketRef.current.on("connect_error", (error) => {
// //             console.error("Socket connection error:", error);
// //             setIsConnected(false);
// //         });

// //         // Handle incoming messages
// //         socketRef.current.on("receiveMessage", (incomingMessage) => {
// //             console.log("📩 Socket received message:", incomingMessage);

// //             if (!incomingMessage) return;

// //             setMessages(prev => {
// //                 // Check for duplicates by message_id or temp_id
// //                 const exists = prev.some(msg =>
// //                     msg.message_id === incomingMessage.message_id ||
// //                     (msg.temp_id && msg.temp_id === incomingMessage.temp_id)
// //                 );

// //                 if (exists) {
// //                     // Update existing message
// //                     return prev.map(msg =>
// //                         (msg.temp_id && msg.temp_id === incomingMessage.temp_id) ||
// //                             msg.message_id === incomingMessage.message_id
// //                             ? {
// //                                 ...incomingMessage,
// //                                 status: incomingMessage.status || 'delivered'
// //                             }
// //                             : msg
// //                     );
// //                 }

// //                 return [...prev, {
// //                     ...incomingMessage,
// //                     status: incomingMessage.status || 'delivered'
// //                 }];
// //             });
// //         });

// //         // Handle typing indicators
// //         socketRef.current.on("userTyping", (data) => {
// //             console.log("⌨️ User typing:", data);

// //             if (data.userId !== currentUser.user_id) {
// //                 setTypingUser(data.userName || "Someone");
// //                 setIsTyping(true);

// //                 // Clear existing timeout
// //                 if (typingTimeoutRef.current) {
// //                     clearTimeout(typingTimeoutRef.current);
// //                 }

// //                 // Set timeout to hide typing indicator after 2 seconds
// //                 typingTimeoutRef.current = setTimeout(() => {
// //                     setIsTyping(false);
// //                     setTypingUser(null);
// //                 }, 2000);
// //             }
// //         });

// //         socketRef.current.on("userStopTyping", (data) => {
// //             console.log("⏹️ User stopped typing:", data);

// //             if (data.userId !== currentUser.user_id) {
// //                 setIsTyping(false);
// //                 setTypingUser(null);

// //                 if (typingTimeoutRef.current) {
// //                     clearTimeout(typingTimeoutRef.current);
// //                 }
// //             }
// //         });

// //         // Handle message status updates
// //         socketRef.current.on("messageDelivered", (data) => {
// //             console.log("✓✓ Message delivered:", data);
// //             setMessages(prev => prev.map(msg =>
// //                 msg.message_id === data.messageId
// //                     ? { ...msg, status: 'delivered' }
// //                     : msg
// //             ));
// //         });

// //         socketRef.current.on("messageRead", (data) => {
// //             console.log("✓✓✓ Message read:", data);
// //             setMessages(prev => prev.map(msg =>
// //                 data.messageIds?.includes(msg.message_id)
// //                     ? { ...msg, status: 'read' }
// //                     : msg
// //             ));
// //         });

// //         // Cleanup on unmount
// //         return () => {
// //             console.log("🧹 Cleaning up chat window");
// //             isMountedRef.current = false;

// //             if (socketRef.current) {
// //                 socketRef.current.disconnect();
// //                 socketRef.current = null;
// //             }

// //             if (typingTimeoutRef.current) {
// //                 clearTimeout(typingTimeoutRef.current);
// //             }

// //             if (typingDebounceRef.current) {
// //                 clearTimeout(typingDebounceRef.current);
// //             }
// //         };
// //     }, [chatId, currentUser, fetchMessages, fetchChatInfo]);

// //     // Auto-scroll to bottom
// //     useEffect(() => {
// //         if (messages.length > 0) {
// //             setTimeout(() => {
// //                 messagesEndRef.current?.scrollIntoView({
// //                     behavior: "smooth",
// //                     block: "end"
// //                 });
// //             }, 100);
// //         }
// //     }, [messages]);

// //     // Handle typing events with debouncing
// //     const handleTyping = () => {
// //         if (!socketRef.current || !isConnected) return;

// //         // Clear previous debounce timer
// //         if (typingDebounceRef.current) {
// //             clearTimeout(typingDebounceRef.current);
// //         }

// //         // Emit typing event
// //         socketRef.current.emit("typing", {
// //             chatId,
// //             userId: currentUser.user_id,
// //             userName: currentUser.name || currentUser.username || "User"
// //         });

// //         // Set debounce to emit stop typing after 1 second of inactivity
// //         typingDebounceRef.current = setTimeout(() => {
// //             socketRef.current.emit("stopTyping", {
// //                 chatId,
// //                 userId: currentUser.user_id
// //             });
// //         }, 1000);
// //     };

// //     // Determine the display name
// //     const getDisplayName = () => {
// //         // Priority 1: Passed as prop
// //         if (otherParticipant?.name) {
// //             return otherParticipant.name;
// //         }

// //         // Priority 2: From chat info
// //         if (chatInfo?.participants) {
// //             const otherUser = chatInfo.participants.find(
// //                 p => p.user_id !== currentUser.user_id
// //             );
// //             if (otherUser?.name) return otherUser.name;
// //         }

// //         // Priority 3: From messages
// //         if (messages.length > 0) {
// //             const otherUserMessage = messages.find(msg =>
// //                 msg.sender_id !== currentUser.user_id && msg.User?.name
// //             );
// //             if (otherUserMessage?.User?.name) return otherUserMessage.User.name;
// //         }

// //         // Default
// //         return 'User';
// //     };

// //     // Get the other user's avatar
// //     const getDisplayAvatar = () => {
// //         if (otherParticipant) {
// //             return otherParticipant.name?.charAt(0) || 'U';
// //         }

// //         if (chatInfo?.participants) {
// //             const otherUser = chatInfo.participants.find(
// //                 p => p.user_id !== currentUser.user_id
// //             );
// //             return otherUser?.name?.charAt(0) || 'U';
// //         }

// //         return 'U';
// //     };

// //     const sendMessage = async () => {
// //         const trimmed = newMessage.trim();
// //         if (!trimmed || !isConnected) {
// //             alert("Please wait for connection...");
// //             return;
// //         }

// //         // Create temporary message for optimistic UI
// //         const temp_id = `temp_${Date.now()}`;
// //         const tempMessage = {
// //             temp_id,
// //             content: trimmed,
// //             sender_id: currentUser.user_id,
// //             User: {
// //                 user_id: currentUser.user_id,
// //                 name: currentUser.name || currentUser.username || "You",
// //             },
// //             createdAt: new Date().toISOString(),
// //             status: 'sending'
// //         };

// //         // Add to messages immediately
// //         setMessages(prev => [...prev, tempMessage]);

// //         // Clear input
// //         setNewMessage("");

// //         try {
// //             console.log("📤 Sending message...");
// //             const response = await api.post(`/chat/${chatId}/message`, {
// //                 content: trimmed,
// //                 temp_id // Send temp_id to match on server
// //             });

// //             console.log("✅ Message sent response:", response.data);

// //             // Stop typing indicator
// //             if (typingDebounceRef.current) {
// //                 clearTimeout(typingDebounceRef.current);
// //             }
// //             socketRef.current.emit("stopTyping", {
// //                 chatId,
// //                 userId: currentUser.user_id
// //             });

// //         } catch (err) {
// //             console.error("❌ Send failed:", err);

// //             // Update message to show error
// //             setMessages(prev => prev.map(msg =>
// //                 msg.temp_id === temp_id
// //                     ? { ...msg, status: 'error', error: true }
// //                     : msg
// //             ));

// //             alert("Failed to send message");
// //         }
// //     };

// //     const handleKeyDown = (e) => {
// //         if (e.key === "Enter" && !e.shiftKey) {
// //             e.preventDefault();
// //             sendMessage();
// //         }
// //     };

// //     const handleInputChange = (e) => {
// //         const value = e.target.value;
// //         setNewMessage(value);

// //         // Only trigger typing if user is actually typing (not just backspacing everything)
// //         if (value.length > 0) {
// //             handleTyping();
// //         } else {
// //             // If input is empty, emit stop typing immediately
// //             if (typingDebounceRef.current) {
// //                 clearTimeout(typingDebounceRef.current);
// //             }
// //             if (socketRef.current) {
// //                 socketRef.current.emit("stopTyping", {
// //                     chatId,
// //                     userId: currentUser.user_id
// //                 });
// //             }
// //         }
// //     };

// //     const handleBack = () => {
// //         if (onBack) {
// //             onBack();
// //         } else if (onClose) {
// //             onClose();
// //         }
// //     };

// //     // Message status icon component
// //     const MessageStatus = ({ status, time, isMe }) => {
// //         if (!isMe) return null;

// //         const getIcon = () => {
// //             switch (status) {
// //                 case 'sending':
// //                     return <Clock className="w-3 h-3 ml-1 animate-pulse" />;
// //                 case 'sent':
// //                     return <Check className="w-3 h-3 ml-1" />;
// //                 case 'delivered':
// //                     return <CheckCheck className="w-3 h-3 ml-1" />;
// //                 case 'read':
// //                     return <CheckCheck className="w-3 h-3 ml-1 text-blue-400" />;
// //                 case 'error':
// //                     return <AlertCircle className="w-3 h-3 ml-1 text-red-500" />;
// //                 default:
// //                     return <Check className="w-3 h-3 ml-1" />;
// //             }
// //         };

// //         return (
// //             <span className="flex items-center ml-2">
// //                 <span className="text-xs opacity-75">
// //                     {time ? new Date(time).toLocaleTimeString([], {
// //                         hour: '2-digit',
// //                         minute: '2-digit'
// //                     }) : ''}
// //                 </span>
// //                 {getIcon()}
// //             </span>
// //         );
// //     };

// //     // Get the display name and avatar
// //     const displayName = getDisplayName();
// //     const displayAvatar = getDisplayAvatar();

// //     const retryLoad = () => {
// //         fetchMessages();
// //     };

// //     return (
// //         <div className="
// //             fixed inset-0 
// //             md:inset-auto md:bottom-8 md:right-8 
// //             w-full h-full 
// //             md:w-80 lg:w-96 md:h-[500px] 
// //             bg-white
// //             md:border md:rounded-lg md:shadow-xl
// //             flex flex-col 
// //             z-50
// //         ">
// //             {/* Header */}
// //             <div className="
// //                 flex items-center justify-between
// //                 p-3 border-b
// //                 bg-white
// //                 sticky top-0 z-10
// //                 md:rounded-t-lg
// //             ">
// //                 <div className="flex items-center gap-3">
// //                     {isMobile ? (
// //                         <button
// //                             onClick={handleBack}
// //                             className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
// //                             aria-label="Back"
// //                         >
// //                             <ArrowLeft className="w-5 h-5" />
// //                         </button>
// //                     ) : (
// //                         <button
// //                             onClick={onClose}
// //                             className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
// //                             aria-label="Close"
// //                         >
// //                             <span className="text-2xl">×</span>
// //                         </button>
// //                     )}

// //                     <div className="flex items-center gap-3">
// //                         {/* Avatar */}
// //                         <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
// //                             {displayAvatar}
// //                         </div>

// //                         <div className="flex-1 min-w-0">
// //                             <h3 className="font-semibold text-sm truncate">
// //                                 {displayName}
// //                             </h3>
// //                             <div className="flex items-center gap-1">
// //                                 <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
// //                                 <span className="text-xs text-gray-500 truncate">
// //                                     {isTyping ? (
// //                                         <span className="text-green-600 font-medium">
// //                                             {typingUser} is typing...
// //                                         </span>
// //                                     ) : isConnected ? 'Online' : 'Offline'}
// //                                 </span>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>

// //                 <div className="flex items-center gap-1">
// //                     {error && (
// //                         <button
// //                             onClick={retryLoad}
// //                             className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
// //                         >
// //                             Retry
// //                         </button>
// //                     )}
// //                     <button
// //                         className="p-2 hover:bg-gray-100 rounded-full transition"
// //                         aria-label="More options"
// //                     >
// //                         <MoreVertical className="w-5 h-5" />
// //                     </button>
// //                 </div>
// //             </div>

// //             {/* Error display */}
// //             {error && (
// //                 <div className="px-4 py-2 bg-red-50 border-b">
// //                     <div className="flex justify-between items-center">
// //                         <span className="text-red-700 text-sm">{error}</span>
// //                         <button
// //                             onClick={retryLoad}
// //                             className="text-red-700 hover:text-red-900 text-sm font-medium"
// //                         >
// //                             Retry
// //                         </button>
// //                     </div>
// //                 </div>
// //             )}

// //             {/* Messages Container */}
// //             <div className="
// //                 flex-1 overflow-y-auto 
// //                 p-4
// //                 bg-gradient-to-b from-white via-gray-50 to-gray-50
// //                 pb-24 md:pb-4
// //             ">
// //                 {isLoading ? (
// //                     <div className="flex flex-col items-center justify-center h-full space-y-4">
// //                         <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
// //                         <p className="text-gray-600">Loading messages...</p>
// //                     </div>
// //                 ) : messages.length === 0 ? (
// //                     <div className="text-center text-gray-500 py-10">
// //                         <div className="text-4xl mb-4 opacity-20">💬</div>
// //                         <p className="text-gray-600 font-medium">No messages yet</p>
// //                         <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
// //                     </div>
// //                 ) : (
// //                     <div className="space-y-3">
// //                         {messages.map((msg) => {
// //                             const isMe = msg.sender_id === currentUser.user_id;
// //                             const messageStatus = msg.status || 'sent';

// //                             return (
// //                                 <div
// //                                     key={msg.message_id || msg.temp_id}
// //                                     className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
// //                                 >
// //                                     <div className={`max-w-[80%] ${isMe ? '' : ''}`}>
// //                                         {/* Show sender name for other users' messages */}
// //                                         {!isMe && msg.User?.name && (
// //                                             <div className="text-xs text-gray-600 mb-1 ml-1 font-medium">
// //                                                 {msg.User.name}
// //                                             </div>
// //                                         )}

// //                                         <div className={`
// //                                             px-4 py-3 
// //                                             rounded-2xl
// //                                             ${isMe
// //                                                 ? 'bg-blue-500 text-white rounded-tr-none'
// //                                                 : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'
// //                                             }
// //                                             ${msg.error ? 'bg-red-100 border-red-300' : ''}
// //                                             shadow-sm
// //                                         `}>
// //                                             <div className="text-sm break-words">
// //                                                 {msg.content}
// //                                             </div>
// //                                             <div className={`
// //                                                 flex items-center justify-end mt-2
// //                                                 ${isMe ? 'text-blue-200' : 'text-gray-500'}
// //                                             `}>
// //                                                 <MessageStatus
// //                                                     status={messageStatus}
// //                                                     time={msg.createdAt}
// //                                                     isMe={isMe}
// //                                                 />
// //                                             </div>
// //                                         </div>
// //                                     </div>
// //                                 </div>
// //                             );
// //                         })}

// //                         {/* Typing Indicator */}
// //                         {isTyping && (
// //                             <div className="flex justify-start">
// //                                 <div className="max-w-[80%]">
// //                                     <div className="text-xs text-gray-600 mb-1 ml-1 font-medium">
// //                                         {typingUser}
// //                                     </div>
// //                                     <div className="bg-white text-gray-900 rounded-2xl rounded-tl-none border border-gray-200 px-4 py-3 shadow-sm">
// //                                         <div className="flex items-center space-x-1">
// //                                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
// //                                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
// //                                             <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
// //                                         </div>
// //                                     </div>
// //                                 </div>
// //                             </div>
// //                         )}

// //                         <div ref={messagesEndRef} className="h-4" />
// //                     </div>
// //                 )}
// //             </div>

// //             {/* Input Section */}
// //             <div className="
// //                 absolute bottom-0 left-0 right-0
// //                 md:static
// //                 p-3
// //                 bg-white
// //                 border-t
// //             ">
// //                 <div className="flex items-center gap-2">
// //                     <button
// //                         className="
// //                             p-2
// //                             text-gray-500
// //                             hover:text-gray-700
// //                             hover:bg-gray-100
// //                             rounded-full
// //                             transition
// //                         "
// //                         aria-label="Attach file"
// //                     >
// //                         <Paperclip className="w-5 h-5" />
// //                     </button>

// //                     <button
// //                         className="
// //                             p-2
// //                             text-gray-500
// //                             hover:text-gray-700
// //                             hover:bg-gray-100
// //                             rounded-full
// //                             transition
// //                         "
// //                         aria-label="Emoji"
// //                     >
// //                         <Smile className="w-5 h-5" />
// //                     </button>

// //                     <input
// //                         type="text"
// //                         value={newMessage}
// //                         onChange={handleInputChange}
// //                         onKeyDown={handleKeyDown}
// //                         placeholder={isConnected ? `Message ${displayName}...` : "Connecting..."}
// //                         className="
// //                             flex-1 px-4 py-3
// //                             bg-gray-100
// //                             rounded-full
// //                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
// //                             text-sm
// //                             placeholder-gray-500
// //                             transition
// //                             disabled:opacity-50
// //                         "
// //                         disabled={!isConnected}
// //                     />

// //                     <button
// //                         onClick={sendMessage}
// //                         disabled={!newMessage.trim() || !isConnected}
// //                         className={`
// //                             p-3
// //                             rounded-full
// //                             transition-all
// //                             ${newMessage.trim()
// //                                 ? 'bg-blue-500 text-white hover:bg-blue-600'
// //                                 : 'text-gray-400 hover:text-gray-600 bg-gray-100'
// //                             }
// //                             disabled:opacity-50 disabled:cursor-not-allowed
// //                         `}
// //                         aria-label="Send message"
// //                     >
// //                         <Send className="w-5 h-5" />
// //                     </button>
// //                 </div>
// //                 <div className="text-xs text-gray-400 mt-2 text-center">
// //                     {isConnected ? 'Connected to chat' : 'Connecting...'}
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default ChatWindow;

// import { useEffect, useState, useRef, useCallback } from "react";
// import api from "../api/axios";
// import io from "socket.io-client";
// import {
//     ArrowLeft, Send, Paperclip, Smile, MoreVertical, Check, CheckCheck, Clock, AlertCircle, Trash2, ChevronDown, User, Users
// } from "lucide-react";
// import toast, { Toaster } from 'react-hot-toast';

// const SOCKET_URL = "http://localhost:5000";

// const ChatWindow = ({ chatId, currentUser, onClose, onBack, otherParticipant }) => {
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState("");
//     const [isConnected, setIsConnected] = useState(false);
//     const [isLoading, setIsLoading] = useState(true);
//     const [chatInfo, setChatInfo] = useState(null);
//     const [isTyping, setIsTyping] = useState(false);
//     const [typingUser, setTypingUser] = useState(null);
//     const [error, setError] = useState(null);
//     const [selectedMessage, setSelectedMessage] = useState(null);
//     const [showDeleteMenu, setShowDeleteMenu] = useState(false);
//     const [deleteMenuPosition, setDeleteMenuPosition] = useState({ x: 0, y: 0 });
//     const [showChatMenu, setShowChatMenu] = useState(false);
//     const [isDeletingChat, setIsDeletingChat] = useState(false);

//     const [deletingMessage, setDeletingMessage] = useState(false);
//     const [deletingChat, setDeletingChat] = useState(false);

//     const messagesEndRef = useRef(null);
//     const socketRef = useRef(null);
//     const typingTimeoutRef = useRef(null);
//     const typingDebounceRef = useRef(null);
//     const isMountedRef = useRef(true);
//     const messageContextMenuRef = useRef(null);

//     // Check if mobile
//     const [isMobile, setIsMobile] = useState(false);

//     useEffect(() => {
//         const checkMobile = () => {
//             setIsMobile(window.innerWidth < 768);
//         };
//         checkMobile();
//         window.addEventListener('resize', checkMobile);
//         return () => window.removeEventListener('resize', checkMobile);
//     }, []);

//     // Close context menus when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (messageContextMenuRef.current &&
//                 !messageContextMenuRef.current.contains(event.target)) {
//                 setShowDeleteMenu(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     // Fetch chat info including other participant details
//     const fetchChatInfo = useCallback(async () => {
//         if (!chatId) return;

//         try {
//             const res = await api.get(`/chat/${chatId}/info`);
//             setChatInfo(res.data);
//         } catch (err) {
//             console.error("Failed to load chat info:", err);
//         }
//     }, [chatId]);

//     const fetchMessages = useCallback(async () => {
//         if (!chatId) return;

//         try {
//             setIsLoading(true);
//             setError(null);
//             const res = await api.get(`/chat/${chatId}/messages`);
//             console.log("Fetched messages:", res.data);

//             // Add status to messages if not present
//             const messagesWithStatus = (res.data || []).map(msg => ({
//                 ...msg,
//                 status: msg.status || 'delivered'
//             }));

//             setMessages(messagesWithStatus);

//         } catch (err) {
//             console.error("Failed to load messages:", err);
//             setError("Failed to load messages. Please try again.");
//         } finally {
//             setIsLoading(false);
//         }
//     }, [chatId]);

//     useEffect(() => {
//         if (!chatId || !currentUser?.user_id) return;

//         console.log("Initializing chat window for chatId:", chatId);

//         fetchChatInfo();
//         fetchMessages();

//         // Initialize socket
//         socketRef.current = io(SOCKET_URL, {
//             transports: ["websocket", "polling"],
//             reconnection: true,
//             reconnectionAttempts: 5,
//             reconnectionDelay: 1000,
//         });

//         // Socket event handlers
//         socketRef.current.on("connect", () => {
//             console.log("✅ Socket connected:", socketRef.current.id);
//             setIsConnected(true);
//             socketRef.current.emit("joinChat", chatId);

//             // Send user info
//             socketRef.current.emit("userInfo", {
//                 userId: currentUser.user_id,
//                 userName: currentUser.name || currentUser.username || "User"
//             });
//         });

//         socketRef.current.on("disconnect", () => {
//             console.log("❌ Socket disconnected");
//             setIsConnected(false);
//         });

//         socketRef.current.on("connect_error", (error) => {
//             console.error("Socket connection error:", error);
//             setIsConnected(false);
//         });

//         // Handle incoming messages
//         socketRef.current.on("receiveMessage", (incomingMessage) => {
//             console.log("📩 Socket received message:", incomingMessage);

//             if (!incomingMessage) return;

//             setMessages(prev => {
//                 // Check for duplicates by message_id or temp_id
//                 const exists = prev.some(msg =>
//                     msg.message_id === incomingMessage.message_id ||
//                     (msg.temp_id && msg.temp_id === incomingMessage.temp_id)
//                 );

//                 if (exists) {
//                     // Update existing message
//                     return prev.map(msg =>
//                         (msg.temp_id && msg.temp_id === incomingMessage.temp_id) ||
//                             msg.message_id === incomingMessage.message_id
//                             ? {
//                                 ...incomingMessage,
//                                 status: incomingMessage.status || 'delivered'
//                             }
//                             : msg
//                     );
//                 }

//                 return [...prev, {
//                     ...incomingMessage,
//                     status: incomingMessage.status || 'delivered'
//                 }];
//             });
//         });

//         // Handle typing indicators
//         socketRef.current.on("userTyping", (data) => {
//             console.log("⌨️ User typing:", data);

//             if (data.userId !== currentUser.user_id) {
//                 setTypingUser(data.userName || "Someone");
//                 setIsTyping(true);

//                 // Clear existing timeout
//                 if (typingTimeoutRef.current) {
//                     clearTimeout(typingTimeoutRef.current);
//                 }

//                 // Set timeout to hide typing indicator after 2 seconds
//                 typingTimeoutRef.current = setTimeout(() => {
//                     setIsTyping(false);
//                     setTypingUser(null);
//                 }, 2000);
//             }
//         });

//         socketRef.current.on("userStopTyping", (data) => {
//             console.log("⏹️ User stopped typing:", data);

//             if (data.userId !== currentUser.user_id) {
//                 setIsTyping(false);
//                 setTypingUser(null);

//                 if (typingTimeoutRef.current) {
//                     clearTimeout(typingTimeoutRef.current);
//                 }
//             }
//         });

//         // Handle message status updates
//         socketRef.current.on("messageDelivered", (data) => {
//             console.log("✓✓ Message delivered:", data);
//             setMessages(prev => prev.map(msg =>
//                 msg.message_id === data.messageId
//                     ? { ...msg, status: 'delivered' }
//                     : msg
//             ));
//         });

//         socketRef.current.on("messageRead", (data) => {
//             console.log("✓✓✓ Message read:", data);
//             setMessages(prev => prev.map(msg =>
//                 data.messageIds?.includes(msg.message_id)
//                     ? { ...msg, status: 'read' }
//                     : msg
//             ));
//         });

//         // Handle message deletion
//         socketRef.current.on("messageDeleted", (data) => {
//             console.log("🗑️ Message deleted:", data);

//             if (data.deleteForEveryone) {
//                 // Remove message from everyone
//                 setMessages(prev => prev.filter(msg =>
//                     msg.message_id !== data.messageId
//                 ));
//             } else {
//                 // Only delete for current user
//                 if (data.userId === currentUser.user_id) {
//                     setMessages(prev => prev.filter(msg =>
//                         msg.message_id !== data.messageId
//                     ));
//                 }
//             }
//         });

//         // Handle chat deletion
//         socketRef.current.on("chatDeleted", (data) => {
//             console.log("🗑️ Chat deleted:", data);

//             if (data.deleteForEveryone) {
//                 // Chat deleted for everyone
//                 if (onClose) onClose();
//                 alert("This chat has been deleted");
//             } else {
//                 // Chat deleted only for current user
//                 if (data.userId === currentUser.user_id) {
//                     if (onClose) onClose();
//                     alert("You have deleted this chat");
//                 }
//             }
//         });

//         // Cleanup on unmount
//         return () => {
//             console.log("🧹 Cleaning up chat window");
//             isMountedRef.current = false;

//             if (socketRef.current) {
//                 socketRef.current.disconnect();
//                 socketRef.current = null;
//             }

//             if (typingTimeoutRef.current) {
//                 clearTimeout(typingTimeoutRef.current);
//             }

//             if (typingDebounceRef.current) {
//                 clearTimeout(typingDebounceRef.current);
//             }
//         };
//     }, [chatId, currentUser, fetchMessages, fetchChatInfo]);

//     // Auto-scroll to bottom
//     useEffect(() => {
//         if (messages.length > 0) {
//             setTimeout(() => {
//                 messagesEndRef.current?.scrollIntoView({
//                     behavior: "smooth",
//                     block: "end"
//                 });
//             }, 100);
//         }
//     }, [messages]);

//     // Handle typing events with debouncing
//     const handleTyping = () => {
//         if (!socketRef.current || !isConnected) return;

//         // Clear previous debounce timer
//         if (typingDebounceRef.current) {
//             clearTimeout(typingDebounceRef.current);
//         }

//         // Emit typing event
//         socketRef.current.emit("typing", {
//             chatId,
//             userId: currentUser.user_id,
//             userName: currentUser.name || currentUser.username || "User"
//         });

//         // Set debounce to emit stop typing after 1 second of inactivity
//         typingDebounceRef.current = setTimeout(() => {
//             socketRef.current.emit("stopTyping", {
//                 chatId,
//                 userId: currentUser.user_id
//             });
//         }, 1000);
//     };

//     // Determine the display name
//     const getDisplayName = () => {
//         // Priority 1: Passed as prop
//         if (otherParticipant?.name) {
//             return otherParticipant.name;
//         }

//         // Priority 2: From chat info
//         if (chatInfo?.participants) {
//             const otherUser = chatInfo.participants.find(
//                 p => p.user_id !== currentUser.user_id
//             );
//             if (otherUser?.name) return otherUser.name;
//         }

//         // Priority 3: From messages
//         if (messages.length > 0) {
//             const otherUserMessage = messages.find(msg =>
//                 msg.sender_id !== currentUser.user_id && msg.User?.name
//             );
//             if (otherUserMessage?.User?.name) return otherUserMessage.User.name;
//         }

//         // Default
//         return 'User';
//     };

//     // Get the other user's avatar
//     const getDisplayAvatar = () => {
//         if (otherParticipant) {
//             return otherParticipant.name?.charAt(0) || 'U';
//         }

//         if (chatInfo?.participants) {
//             const otherUser = chatInfo.participants.find(
//                 p => p.user_id !== currentUser.user_id
//             );
//             return otherUser?.name?.charAt(0) || 'U';
//         }

//         return 'U';
//     };

//     // Message context menu handler
//     const handleMessageRightClick = (e, message) => {
//         e.preventDefault();
//         setSelectedMessage(message);
//         setDeleteMenuPosition({
//             x: e.clientX,
//             y: e.clientY
//         });
//         setShowDeleteMenu(true);
//     };

//     // Message click handler for mobile
//     const handleMessageClick = (e, message) => {
//         if (isMobile) {
//             setSelectedMessage(message);
//             const rect = e.currentTarget.getBoundingClientRect();
//             setDeleteMenuPosition({
//                 x: rect.right - 150,
//                 y: rect.top
//             });
//             setShowDeleteMenu(true);
//         }
//     };

//     // Delete message functions
//     const deleteMessageForMe = async () => {
//         if (!selectedMessage) return;

//         setDeletingMessage(true);

//         try {
//             const response = await api.delete(`/message/${selectedMessage.message_id}/delete-for-me`);
//             console.log("Deleted for me:", response.data);

//             // Remove message locally
//             setMessages(prev => prev.filter(msg =>
//                 msg.message_id !== selectedMessage.message_id
//             ));

//             // Close menu
//             setShowDeleteMenu(false);

//             // Show success toast
//             toast.success("Message deleted for you");

//         } catch (err) {
//             console.error("Failed to delete message for me:", err);
//             toast.error(err.response?.data?.message || "Failed to delete message");
//         } finally {
//             setDeletingMessage(false)
//         }
//     };

//     const deleteMessageForEveryone = async () => {
//         if (!selectedMessage) return;

//         // Check if message is older than 48 hours (Telegram rule)
//         const messageAge = Date.now() - new Date(selectedMessage.createdAt).getTime();
//         const hoursOld = messageAge / (1000 * 60 * 60);

//         if (hoursOld > 48 && selectedMessage.sender_id === currentUser.user_id) {
//             if (!window.confirm("This message is older than 48 hours. You can only delete it for yourself. Continue?")) {
//                 return;
//             }
//             // If older than 48 hours, only allow delete for me
//             return deleteMessageForMe();
//         }

//         try {
//             const response = await api.delete(`/message/${selectedMessage.message_id}/delete-for-everyone`);
//             console.log("Deleted for everyone:", response.data);

//             // Remove message locally
//             setMessages(prev => prev.filter(msg =>
//                 msg.message_id !== selectedMessage.message_id
//             ));

//             // Close menu
//             setShowDeleteMenu(false);

//             toast.success("Message deleted for everyone");

//         } catch (err) {
//             console.error("Failed to delete message for everyone:", err);
//             toast.error(err.response?.data?.message || "Failed to delete message");

//             // If permission denied (not the sender), fall back to delete for me
//             if (err.response?.status === 403) {
//                 deleteMessageForMe();
//             }
//         }
//     };

//     // Delete chat functions
//     const deleteChatForMe = async () => {
//         if (!chatId) return;

//         if (!window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
//             return;
//         }

//         setIsDeletingChat(true);
//         try {
//             const response = await api.delete(`/chat/${chatId}/delete-for-me`);
//             console.log("Chat deleted for me:", response.data);

//             // Close chat window
//             if (onClose) onClose();

//             // Show success message
//             alert("Chat deleted successfully");
//         } catch (err) {
//             console.error("Failed to delete chat:", err);
//             alert("Failed to delete chat");
//         } finally {
//             setIsDeletingChat(false);
//             setShowChatMenu(false);
//         }
//     };

//     const deleteChatForEveryone = async () => {
//         if (!chatId) return;

//         if (!window.confirm("Are you sure you want to delete this chat for everyone? This action cannot be undone.")) {
//             return;
//         }

//         setIsDeletingChat(true);
//         try {
//             const response = await api.delete(`/chat/${chatId}/delete-for-everyone`);
//             console.log("Chat deleted for everyone:", response.data);

//             // Close chat window
//             if (onClose) onClose();

//             // Show success message
//             alert("Chat deleted for everyone");
//         } catch (err) {
//             console.error("Failed to delete chat for everyone:", err);
//             alert("Failed to delete chat");
//         } finally {
//             setIsDeletingChat(false);
//             setShowChatMenu(false);
//         }
//     };

//     const sendMessage = async () => {
//         const trimmed = newMessage.trim();
//         if (!trimmed || !isConnected) {
//             alert("Please wait for connection...");
//             return;
//         }

//         // Create temporary message for optimistic UI
//         const temp_id = `temp_${Date.now()}`;
//         const tempMessage = {
//             temp_id,
//             content: trimmed,
//             sender_id: currentUser.user_id,
//             User: {
//                 user_id: currentUser.user_id,
//                 name: currentUser.name || currentUser.username || "You",
//             },
//             createdAt: new Date().toISOString(),
//             status: 'sending'
//         };

//         // Add to messages immediately
//         setMessages(prev => [...prev, tempMessage]);

//         // Clear input
//         setNewMessage("");

//         try {
//             console.log("📤 Sending message...");
//             const response = await api.post(`/chat/${chatId}/message`, {
//                 content: trimmed,
//                 temp_id
//             });

//             console.log("✅ Message sent response:", response.data);

//             // Stop typing indicator
//             if (typingDebounceRef.current) {
//                 clearTimeout(typingDebounceRef.current);
//             }
//             socketRef.current.emit("stopTyping", {
//                 chatId,
//                 userId: currentUser.user_id
//             });

//         } catch (err) {
//             console.error("❌ Send failed:", err);

//             // Update message to show error
//             setMessages(prev => prev.map(msg =>
//                 msg.temp_id === temp_id
//                     ? { ...msg, status: 'error', error: true }
//                     : msg
//             ));

//             alert("Failed to send message");
//         }
//     };

//     const handleKeyDown = (e) => {
//         if (e.key === "Enter" && !e.shiftKey) {
//             e.preventDefault();
//             sendMessage();
//         }
//     };

//     const handleInputChange = (e) => {
//         const value = e.target.value;
//         setNewMessage(value);

//         // Only trigger typing if user is actually typing (not just backspacing everything)
//         if (value.length > 0) {
//             handleTyping();
//         } else {
//             // If input is empty, emit stop typing immediately
//             if (typingDebounceRef.current) {
//                 clearTimeout(typingDebounceRef.current);
//             }
//             if (socketRef.current) {
//                 socketRef.current.emit("stopTyping", {
//                     chatId,
//                     userId: currentUser.user_id
//                 });
//             }
//         }
//     };

//     const handleBack = () => {
//         if (onBack) {
//             onBack();
//         } else if (onClose) {
//             onClose();
//         }
//     };

//     // Message status icon component
//     const MessageStatus = ({ status, time, isMe }) => {
//         if (!isMe) return null;

//         const getIcon = () => {
//             switch (status) {
//                 case 'sending':
//                     return <Clock className="w-3 h-3 ml-1 animate-pulse" />;
//                 case 'sent':
//                     return <Check className="w-3 h-3 ml-1" />;
//                 case 'delivered':
//                     return <CheckCheck className="w-3 h-3 ml-1" />;
//                 case 'read':
//                     return <CheckCheck className="w-3 h-3 ml-1 text-blue-400" />;
//                 case 'error':
//                     return <AlertCircle className="w-3 h-3 ml-1 text-red-500" />;
//                 default:
//                     return <Check className="w-3 h-3 ml-1" />;
//             }
//         };

//         return (
//             <span className="flex items-center ml-2">
//                 <span className="text-xs opacity-75">
//                     {time ? new Date(time).toLocaleTimeString([], {
//                         hour: '2-digit',
//                         minute: '2-digit'
//                     }) : ''}
//                 </span>
//                 {getIcon()}
//             </span>
//         );
//     };

//     // Get the display name and avatar
//     const displayName = getDisplayName();
//     const displayAvatar = getDisplayAvatar();

//     const retryLoad = () => {
//         fetchMessages();
//     };

//     return (
//         <>
//             <Toaster
//                 position={isMobile ? "top-center" : "bottom-right"}
//                 toastOptions={{
//                     duration: 3000,
//                     style: {
//                         background: '#363636',
//                         color: '#fff',
//                     },
//                     success: {
//                         duration: 2000,
//                     },
//                     error: {
//                         duration: 3000,
//                     },
//                 }}
//             />
//             <div className="chat-window-container">

//                 <div className="
//             fixed inset-0 
//             md:inset-auto md:bottom-8 md:right-8 
//             w-full h-full 
//             md:w-80 lg:w-96 md:h-[500px] 
//             bg-white
//             md:border md:rounded-lg md:shadow-xl
//             flex flex-col 
//             z-50
//         ">
//                     {/* Header */}
//                     <div className="
//                 flex items-center justify-between
//                 p-3 border-b
//                 bg-white
//                 sticky top-0 z-20
//                 md:rounded-t-lg
//             ">
//                         <div className="flex items-center gap-3">
//                             {isMobile ? (
//                                 <button
//                                     onClick={handleBack}
//                                     className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
//                                     aria-label="Back"
//                                 >
//                                     <ArrowLeft className="w-5 h-5" />
//                                 </button>
//                             ) : (
//                                 <button
//                                     onClick={onClose}
//                                     className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
//                                     aria-label="Close"
//                                 >
//                                     <span className="text-2xl">×</span>
//                                 </button>
//                             )}

//                             <div className="flex items-center gap-3">
//                                 {/* Avatar */}
//                                 <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                                     {displayAvatar}
//                                 </div>

//                                 <div className="flex-1 min-w-0">
//                                     <h3 className="font-semibold text-sm truncate">
//                                         {displayName}
//                                     </h3>
//                                     <div className="flex items-center gap-1">
//                                         <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
//                                         <span className="text-xs text-gray-500 truncate">
//                                             {isTyping ? (
//                                                 <span className="text-green-600 font-medium">
//                                                     {typingUser} is typing...
//                                                 </span>
//                                             ) : isConnected ? 'Online' : 'Offline'}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-1 relative">
//                             {error && (
//                                 <button
//                                     onClick={retryLoad}
//                                     className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
//                                 >
//                                     Retry
//                                 </button>
//                             )}

//                             {/* Chat Menu Button */}
//                             <button
//                                 onClick={() => setShowChatMenu(!showChatMenu)}
//                                 className="p-2 hover:bg-gray-100 rounded-full transition relative"
//                                 aria-label="Chat options"
//                             >
//                                 <MoreVertical className="w-5 h-5" />
//                             </button>

//                             {/* Chat Menu Dropdown */}
//                             {showChatMenu && (
//                                 <div className="
//                             absolute right-0 top-full mt-1
//                             bg-white border rounded-lg shadow-lg
//                             w-48 py-2 z-30
//                         ">
//                                     <button
//                                         onClick={deleteChatForMe}
//                                         disabled={isDeletingChat}
//                                         className="
//                                     w-full px-4 py-2 text-left
//                                     hover:bg-red-50 hover:text-red-600
//                                     flex items-center gap-2
//                                     text-sm
//                                     disabled:opacity-50
//                                 "
//                                     >
//                                         <User className="w-4 h-4" />
//                                         Delete Chat for Me
//                                     </button>
//                                     <button
//                                         onClick={deleteChatForEveryone}
//                                         disabled={isDeletingChat}
//                                         className="
//                                     w-full px-4 py-2 text-left
//                                     hover:bg-red-50 hover:text-red-600
//                                     flex items-center gap-2
//                                     text-sm
//                                     disabled:opacity-50
//                                 "
//                                     >
//                                         <Users className="w-4 h-4" />
//                                         Delete Chat for Everyone
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Error display */}
//                     {error && (
//                         <div className="px-4 py-2 bg-red-50 border-b">
//                             <div className="flex justify-between items-center">
//                                 <span className="text-red-700 text-sm">{error}</span>
//                                 <button
//                                     onClick={retryLoad}
//                                     className="text-red-700 hover:text-red-900 text-sm font-medium"
//                                 >
//                                     Retry
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {/* Messages Container */}
//                     <div className="
//                 flex-1 overflow-y-auto 
//                 p-4
//                 bg-gradient-to-b from-white via-gray-50 to-gray-50
//                 pb-24 md:pb-4
//             ">
//                         {isLoading ? (
//                             <div className="flex flex-col items-center justify-center h-full space-y-4">
//                                 <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
//                                 <p className="text-gray-600">Loading messages...</p>
//                             </div>
//                         ) : messages.length === 0 ? (
//                             <div className="text-center text-gray-500 py-10">
//                                 <div className="text-4xl mb-4 opacity-20">💬</div>
//                                 <p className="text-gray-600 font-medium">No messages yet</p>
//                                 <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
//                             </div>
//                         ) : (
//                             <div className="space-y-3">
//                                 {messages.map((msg) => {
//                                     const isMe = msg.sender_id === currentUser.user_id;
//                                     const messageStatus = msg.status || 'sent';

//                                     return (
//                                         <div
//                                             key={msg.message_id || msg.temp_id}
//                                             className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
//                                             onContextMenu={(e) => handleMessageRightClick(e, msg)}
//                                             onClick={(e) => handleMessageClick(e, msg)}
//                                         >
//                                             <div className={`max-w-[80%] ${isMe ? '' : ''}`}>
//                                                 {/* Show sender name for other users' messages */}
//                                                 {!isMe && msg.User?.name && (
//                                                     <div className="text-xs text-gray-600 mb-1 ml-1 font-medium">
//                                                         {msg.User.name}
//                                                     </div>
//                                                 )}

//                                                 <div className={`
//                                             px-4 py-3 
//                                             rounded-2xl
//                                             ${isMe
//                                                         ? 'bg-blue-500 text-white rounded-tr-none cursor-pointer hover:bg-blue-600 transition'
//                                                         : 'bg-white text-gray-900 rounded-tl-none border border-gray-200 cursor-pointer hover:bg-gray-50 transition'
//                                                     }
//                                             ${msg.error ? 'bg-red-100 border-red-300' : ''}
//                                             shadow-sm
//                                             relative
//                                         `}>
//                                                     <div className="text-sm break-words">
//                                                         {msg.content}
//                                                     </div>
//                                                     <div className={`
//                                                 flex items-center justify-end mt-2
//                                                 ${isMe ? 'text-blue-200' : 'text-gray-500'}
//                                             `}>
//                                                         <MessageStatus
//                                                             status={messageStatus}
//                                                             time={msg.createdAt}
//                                                             isMe={isMe}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}

//                                 {/* Typing Indicator */}
//                                 {isTyping && (
//                                     <div className="flex justify-start">
//                                         <div className="max-w-[80%]">
//                                             <div className="text-xs text-gray-600 mb-1 ml-1 font-medium">
//                                                 {typingUser}
//                                             </div>
//                                             <div className="bg-white text-gray-900 rounded-2xl rounded-tl-none border border-gray-200 px-4 py-3 shadow-sm">
//                                                 <div className="flex items-center space-x-1">
//                                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
//                                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
//                                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}

//                                 <div ref={messagesEndRef} className="h-4" />
//                             </div>
//                         )}
//                     </div>

//                     {/* Message Delete Context Menu */}
//                     {showDeleteMenu && selectedMessage && (
//                         <div
//                             ref={messageContextMenuRef}
//                             className="
//                         fixed bg-white border rounded-lg shadow-xl
//                         w-48 py-2 z-40
//                     "
//                             style={{
//                                 left: `${Math.min(deleteMenuPosition.x, window.innerWidth - 200)}px`,
//                                 top: `${deleteMenuPosition.y}px`
//                             }}
//                         >
//                             <div className="px-4 py-2 border-b text-xs text-gray-500">
//                                 Delete message?
//                             </div>

//                             {/* Delete for me option - always available */}
//                             <button
//                                 onClick={deleteMessageForMe}
//                                 disabled={deletingMessage}
//                                 className="
//                             w-full px-4 py-3 text-left
//                             hover:bg-gray-100
//                             flex items-center gap-2
//                             text-sm
//                         "
//                             >
//                                 <User className="w-4 h-4" />
//                                 <div>
//                                     <div className="font-medium"> {deletingMessage ? "Deleting..." : "Delete for me"}</div>
//                                     <div className="text-xs text-gray-500">Remove from your view</div>
//                                 </div>
//                             </button>

//                             {/* Delete for everyone option - only for my messages */}
//                             {selectedMessage.sender_id === currentUser.user_id && (
//                                 <button
//                                     onClick={deleteMessageForEveryone}
//                                     className="
//                                 w-full px-4 py-3 text-left
//                                 hover:bg-red-50 hover:text-red-600
//                                 flex items-center gap-2
//                                 text-sm border-t
//                             "
//                                 >
//                                     <Users className="w-4 h-4" />
//                                     <div>
//                                         <div className="font-medium">Delete for everyone</div>
//                                         <div className="text-xs text-gray-500">Remove from chat</div>
//                                     </div>
//                                 </button>
//                             )}

//                             <button
//                                 onClick={() => setShowDeleteMenu(false)}
//                                 className="
//                             w-full px-4 py-2 text-center
//                             hover:bg-gray-100
//                             text-sm border-t
//                         "
//                             >
//                                 Cancel
//                             </button>
//                         </div>
//                     )}

//                     {/* Input Section */}
//                     <div className="
//                 absolute bottom-0 left-0 right-0
//                 md:static
//                 p-3
//                 bg-white
//                 border-t
//                 z-10
//             ">
//                         <div className="flex items-center gap-2">
//                             <button
//                                 className="
//                             p-2
//                             text-gray-500
//                             hover:text-gray-700
//                             hover:bg-gray-100
//                             rounded-full
//                             transition
//                         "
//                                 aria-label="Attach file"
//                             >
//                                 <Paperclip className="w-5 h-5" />
//                             </button>

//                             <button
//                                 className="
//                             p-2
//                             text-gray-500
//                             hover:text-gray-700
//                             hover:bg-gray-100
//                             rounded-full
//                             transition
//                         "
//                                 aria-label="Emoji"
//                             >
//                                 <Smile className="w-5 h-5" />
//                             </button>

//                             <input
//                                 type="text"
//                                 value={newMessage}
//                                 onChange={handleInputChange}
//                                 onKeyDown={handleKeyDown}
//                                 placeholder={isConnected ? `Message ${displayName}...` : "Connecting..."}
//                                 className="
//                             flex-1 px-4 py-3
//                             bg-gray-100
//                             rounded-full
//                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
//                             text-sm
//                             placeholder-gray-500
//                             transition
//                             disabled:opacity-50
//                         "
//                                 disabled={!isConnected}
//                             />

//                             <button
//                                 onClick={sendMessage}
//                                 disabled={!newMessage.trim() || !isConnected}
//                                 className={`
//                             p-3
//                             rounded-full
//                             transition-all
//                             ${newMessage.trim()
//                                         ? 'bg-blue-500 text-white hover:bg-blue-600'
//                                         : 'text-gray-400 hover:text-gray-600 bg-gray-100'
//                                     }
//                             disabled:opacity-50 disabled:cursor-not-allowed
//                         `}
//                                 aria-label="Send message"
//                             >
//                                 <Send className="w-5 h-5" />
//                             </button>
//                         </div>
//                         <div className="text-xs text-gray-400 mt-2 text-center">
//                             {isConnected ? 'Connected to chat' : 'Connecting...'}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default ChatWindow;

import { useEffect, useState, useRef, useCallback } from "react";
import api from "../api/axios";
import io from "socket.io-client";
import {
    ArrowLeft, Send, Paperclip, Smile, MoreVertical,
    Check, CheckCheck, Clock, AlertCircle, Trash2,
    ChevronDown, User, Users
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

const SOCKET_URL = "http://localhost:5000";

const ChatWindow = ({ chatId, currentUser, onClose, onBack, otherParticipant }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [chatInfo, setChatInfo] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const [error, setError] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);
    const [deleteMenuPosition, setDeleteMenuPosition] = useState({ x: 0, y: 0 });
    const [showChatMenu, setShowChatMenu] = useState(false);
    const [isDeletingChat, setIsDeletingChat] = useState(false);
    const [deletingMessage, setDeletingMessage] = useState(false);
    const [deletingForEveryone, setDeletingForEveryone] = useState(false);

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const typingDebounceRef = useRef(null);
    const isMountedRef = useRef(true);
    const messageContextMenuRef = useRef(null);

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

    // Close context menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (messageContextMenuRef.current &&
                !messageContextMenuRef.current.contains(event.target)) {
                setShowDeleteMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch chat info including other participant details
    const fetchChatInfo = useCallback(async () => {
        if (!chatId) return;

        try {
            const res = await api.get(`/chat/${chatId}/info`);
            setChatInfo(res.data);
        } catch (err) {
            console.error("Failed to load chat info:", err);
        }
    }, [chatId]);

    const fetchMessages = useCallback(async () => {
        if (!chatId) return;

        try {
            setIsLoading(true);
            setError(null);
            const res = await api.get(`/chat/${chatId}/messages`);
            console.log("Fetched messages:", res.data);

            // Add status to messages if not present
            const messagesWithStatus = (res.data || []).map(msg => ({
                ...msg,
                status: msg.status || 'delivered'
            }));

            setMessages(messagesWithStatus);

        } catch (err) {
            console.error("Failed to load messages:", err);
            setError("Failed to load messages. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [chatId]);

    useEffect(() => {
        if (!chatId || !currentUser?.user_id) return;

        console.log("Initializing chat window for chatId:", chatId);

        fetchChatInfo();
        fetchMessages();

        // Initialize socket
        socketRef.current = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Socket event handlers
        socketRef.current.on("connect", () => {
            console.log("✅ Socket connected:", socketRef.current.id);
            setIsConnected(true);
            socketRef.current.emit("joinChat", chatId);

            // Send user info
            socketRef.current.emit("userInfo", {
                userId: currentUser.user_id,
                userName: currentUser.name || currentUser.username || "User"
            });
        });

        socketRef.current.on("disconnect", () => {
            console.log("❌ Socket disconnected");
            setIsConnected(false);
        });

        socketRef.current.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            setIsConnected(false);
        });

        // Handle incoming messages
        socketRef.current.on("receiveMessage", (incomingMessage) => {
            console.log("📩 Socket received message:", incomingMessage);

            if (!incomingMessage) return;

            setMessages(prev => {
                // Check for duplicates by message_id or temp_id
                const exists = prev.some(msg =>
                    msg.message_id === incomingMessage.message_id ||
                    (msg.temp_id && msg.temp_id === incomingMessage.temp_id)
                );

                if (exists) {
                    // Update existing message
                    return prev.map(msg =>
                        (msg.temp_id && msg.temp_id === incomingMessage.temp_id) ||
                            msg.message_id === incomingMessage.message_id
                            ? {
                                ...incomingMessage,
                                status: incomingMessage.status || 'delivered'
                            }
                            : msg
                    );
                }

                return [...prev, {
                    ...incomingMessage,
                    status: incomingMessage.status || 'delivered'
                }];
            });
        });

        // Handle typing indicators
        socketRef.current.on("userTyping", (data) => {
            console.log("⌨️ User typing:", data);

            if (data.userId !== currentUser.user_id) {
                setTypingUser(data.userName || "Someone");
                setIsTyping(true);

                // Clear existing timeout
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                // Set timeout to hide typing indicator after 2 seconds
                typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                    setTypingUser(null);
                }, 2000);
            }
        });

        socketRef.current.on("userStopTyping", (data) => {
            console.log("⏹️ User stopped typing:", data);

            if (data.userId !== currentUser.user_id) {
                setIsTyping(false);
                setTypingUser(null);

                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
            }
        });

        // Handle message status updates
        socketRef.current.on("messageDelivered", (data) => {
            console.log("✓✓ Message delivered:", data);
            setMessages(prev => prev.map(msg =>
                msg.message_id === data.messageId
                    ? { ...msg, status: 'delivered' }
                    : msg
            ));
        });

        socketRef.current.on("messageRead", (data) => {
            console.log("✓✓✓ Message read:", data);
            setMessages(prev => prev.map(msg =>
                data.messageIds?.includes(msg.message_id)
                    ? { ...msg, status: 'read' }
                    : msg
            ));
        });

        // Handle message deletion
        socketRef.current.on("messageDeleted", (data) => {
            console.log("🗑️ Message deleted:", data);

            if (data.deleteForEveryone) {
                // Remove message from everyone
                setMessages(prev => prev.filter(msg =>
                    msg.message_id !== data.messageId
                ));
            } else {
                // Only delete for current user
                if (data.userId === currentUser.user_id) {
                    setMessages(prev => prev.filter(msg =>
                        msg.message_id !== data.messageId
                    ));
                }
            }
        });

        // Handle chat deletion
        socketRef.current.on("chatDeleted", (data) => {
            console.log("🗑️ Chat deleted:", data);

            if (data.deleteForEveryone) {
                // Chat deleted for everyone
                if (onClose) {
                    toast("Chat deleted for everyone");
                    onClose();
                }
            } else {
                // Chat deleted only for current user
                if (data.userId === currentUser.user_id) {
                    if (onClose) {
                        toast("You deleted this chat");
                        onClose();
                    }
                }
            }
        });

        // Cleanup on unmount
        return () => {
            console.log("🧹 Cleaning up chat window");
            isMountedRef.current = false;

            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            if (typingDebounceRef.current) {
                clearTimeout(typingDebounceRef.current);
            }
        };
    }, [chatId, currentUser, fetchMessages, fetchChatInfo]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "end"
                });
            }, 100);
        }
    }, [messages]);

    // Handle typing events with debouncing
    const handleTyping = () => {
        if (!socketRef.current || !isConnected) return;

        // Clear previous debounce timer
        if (typingDebounceRef.current) {
            clearTimeout(typingDebounceRef.current);
        }

        // Emit typing event
        socketRef.current.emit("typing", {
            chatId,
            userId: currentUser.user_id,
            userName: currentUser.name || currentUser.username || "User"
        });

        // Set debounce to emit stop typing after 1 second of inactivity
        typingDebounceRef.current = setTimeout(() => {
            socketRef.current.emit("stopTyping", {
                chatId,
                userId: currentUser.user_id
            });
        }, 1000);
    };

    // Mobile haptic feedback
    const triggerHaptic = () => {
        if (isMobile && window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }
    };

    // Determine the display name
    const getDisplayName = () => {
        // Priority 1: Passed as prop
        if (otherParticipant?.name) {
            return otherParticipant.name;
        }

        // Priority 2: From chat info
        if (chatInfo?.participants) {
            const otherUser = chatInfo.participants.find(
                p => p.user_id !== currentUser.user_id
            );
            if (otherUser?.name) return otherUser.name;
        }

        // Priority 3: From messages
        if (messages.length > 0) {
            const otherUserMessage = messages.find(msg =>
                msg.sender_id !== currentUser.user_id && msg.User?.name
            );
            if (otherUserMessage?.User?.name) return otherUserMessage.User.name;
        }

        // Default
        return 'User';
    };

    // Get the other user's avatar
    const getDisplayAvatar = () => {
        if (otherParticipant) {
            return otherParticipant.name?.charAt(0) || 'U';
        }

        if (chatInfo?.participants) {
            const otherUser = chatInfo.participants.find(
                p => p.user_id !== currentUser.user_id
            );
            return otherUser?.name?.charAt(0) || 'U';
        }

        return 'U';
    };

    // Message context menu handler
    const handleMessageRightClick = (e, message) => {
        e.preventDefault();
        if (message.isDeleted) return; // Don't show menu for deleted messages

        setSelectedMessage(message);
        setDeleteMenuPosition({
            x: e.clientX,
            y: e.clientY
        });
        setShowDeleteMenu(true);
    };

    // Message click handler for mobile
    const handleMessageClick = (e, message) => {
        if (message.isDeleted) return; // Don't show menu for deleted messages

        if (isMobile) {
            triggerHaptic();
            setSelectedMessage(message);
            const rect = e.currentTarget.getBoundingClientRect();
            setDeleteMenuPosition({
                x: rect.right - 150,
                y: rect.top
            });
            setShowDeleteMenu(true);
        }
    };

    // Delete message functions
    const deleteMessageForMe = async () => {
        if (!selectedMessage) return;

        setDeletingMessage(true);

        try {
            const response = await api.delete(`/chat/message/${selectedMessage.message_id}/delete-for-me`);
            console.log("Deleted for me:", response.data);

            // Remove message locally
            setMessages(prev => prev.filter(msg =>
                msg.message_id !== selectedMessage.message_id
            ));

            // Close menu
            setShowDeleteMenu(false);

            // Show success toast
            toast.success("Message deleted for you");

        } catch (err) {
            console.error("Failed to delete message for me:", err);
            toast.error(err.response?.data?.message || "Failed to delete message");
        } finally {
            setDeletingMessage(false);
        }
    };

    const deleteMessageForEveryone = async () => {
        if (!selectedMessage) return;

        // Check if message is older than 48 hours (Telegram rule)
        const messageAge = Date.now() - new Date(selectedMessage.createdAt).getTime();
        const hoursOld = messageAge / (1000 * 60 * 60);

        if (hoursOld > 48 && selectedMessage.sender_id === currentUser.user_id) {
            if (!window.confirm("This message is older than 48 hours. You can only delete it for yourself. Continue?")) {
                return;
            }
            // If older than 48 hours, only allow delete for me
            return deleteMessageForMe();
        }

        setDeletingForEveryone(true);

        try {
            const response = await api.delete(`/chat/message/${selectedMessage.message_id}/delete-for-everyone`);
            console.log("Deleted for everyone:", response.data);

            // Remove message locally
            setMessages(prev => prev.filter(msg =>
                msg.message_id !== selectedMessage.message_id
            ));

            // Close menu
            setShowDeleteMenu(false);

            toast.success("Message deleted for everyone");

        } catch (err) {
            console.error("Failed to delete message for everyone:", err);
            toast.error(err.response?.data?.message || "Failed to delete message");

            // If permission denied (not the sender), fall back to delete for me
            if (err.response?.status === 403) {
                deleteMessageForMe();
            }
        } finally {
            setDeletingForEveryone(false);
        }
    };

    // Delete chat functions
    const deleteChatForMe = async () => {
        if (!chatId) return;

        if (!window.confirm("Are you sure you want to delete this chat?\n\nThis will only delete the chat from your inbox. The other person will still be able to see the chat.")) {
            return;
        }

        setIsDeletingChat(true);
        try {
            const response = await api.delete(`/chat/${chatId}/delete-for-me`);
            console.log("Chat deleted for me:", response.data);

            // Close chat window
            if (onClose) onClose();

            // Show success message
            toast.success("Chat deleted successfully");
        } catch (err) {
            console.error("Failed to delete chat:", err);
            toast.error(err.response?.data?.message || "Failed to delete chat");
        } finally {
            setIsDeletingChat(false);
            setShowChatMenu(false);
        }
    };

    const deleteChatForEveryone = async () => {
        if (!chatId) return;

        if (!window.confirm("Are you sure you want to delete this chat for everyone?\n\nThis will permanently delete the chat and all messages for all participants. This action cannot be undone.")) {
            return;
        }

        setIsDeletingChat(true);
        try {
            const response = await api.delete(`/chat/${chatId}/delete-for-everyone`);
            console.log("Chat deleted for everyone:", response.data);

            // Close chat window
            if (onClose) onClose();

            // Show success message
            toast.success("Chat deleted for everyone");
        } catch (err) {
            console.error("Failed to delete chat for everyone:", err);
            toast.error(err.response?.data?.message || "Failed to delete chat");
        } finally {
            setIsDeletingChat(false);
            setShowChatMenu(false);
        }
    };

    const sendMessage = async () => {
        const trimmed = newMessage.trim();
        if (!trimmed || !isConnected) {
            toast.error("Please wait for connection...");
            return;
        }

        // Create temporary message for optimistic UI
        const temp_id = `temp_${Date.now()}`;
        const tempMessage = {
            temp_id,
            content: trimmed,
            sender_id: currentUser.user_id,
            User: {
                user_id: currentUser.user_id,
                name: currentUser.name || currentUser.username || "You",
            },
            createdAt: new Date().toISOString(),
            status: 'sending'
        };

        // Add to messages immediately
        setMessages(prev => [...prev, tempMessage]);

        // Clear input
        setNewMessage("");

        try {
            console.log("📤 Sending message...");
            const response = await api.post(`/chat/${chatId}/message`, {
                content: trimmed,
                temp_id
            });

            console.log("✅ Message sent response:", response.data);

            // Stop typing indicator
            if (typingDebounceRef.current) {
                clearTimeout(typingDebounceRef.current);
            }
            socketRef.current.emit("stopTyping", {
                chatId,
                userId: currentUser.user_id
            });

        } catch (err) {
            console.error("❌ Send failed:", err);

            // Update message to show error
            setMessages(prev => prev.map(msg =>
                msg.temp_id === temp_id
                    ? { ...msg, status: 'error', error: true }
                    : msg
            ));

            toast.error("Failed to send message");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setNewMessage(value);

        // Only trigger typing if user is actually typing (not just backspacing everything)
        if (value.length > 0) {
            handleTyping();
        } else {
            // If input is empty, emit stop typing immediately
            if (typingDebounceRef.current) {
                clearTimeout(typingDebounceRef.current);
            }
            if (socketRef.current) {
                socketRef.current.emit("stopTyping", {
                    chatId,
                    userId: currentUser.user_id
                });
            }
        }
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (onClose) {
            onClose();
        }
    };

    // Message status icon component
    const MessageStatus = ({ status, time, isMe }) => {
        if (!isMe) return null;

        const getIcon = () => {
            switch (status) {
                case 'sending':
                    return <Clock className="w-3 h-3 ml-1 animate-pulse" />;
                case 'sent':
                    return <Check className="w-3 h-3 ml-1" />;
                case 'delivered':
                    return <CheckCheck className="w-3 h-3 ml-1" />;
                case 'read':
                    return <CheckCheck className="w-3 h-3 ml-1 text-blue-400" />;
                case 'error':
                    return <AlertCircle className="w-3 h-3 ml-1 text-red-500" />;
                default:
                    return <Check className="w-3 h-3 ml-1" />;
            }
        };

        return (
            <span className="flex items-center ml-2">
                <span className="text-xs opacity-75">
                    {time ? new Date(time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : ''}
                </span>
                {getIcon()}
            </span>
        );
    };

    // Get the display name and avatar
    const displayName = getDisplayName();
    const displayAvatar = getDisplayAvatar();

    const retryLoad = () => {
        fetchMessages();
    };

    return (
        <>
            <Toaster
                position={isMobile ? "top-center" : "bottom-right"}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        borderRadius: '10px',
                        padding: '12px 16px',
                    },
                }}
            />

            <div className="
                fixed inset-0 
                md:inset-auto md:bottom-8 md:right-8 
                w-full h-full 
                md:w-80 lg:w-96 md:h-[500px] 
                bg-white
                md:border md:rounded-lg md:shadow-xl
                flex flex-col 
                z-50
            ">
                {/* Header */}
                <div className="
                    flex items-center justify-between
                    p-3 border-b
                    bg-white
                    sticky top-0 z-20
                    md:rounded-t-lg
                ">
                    <div className="flex items-center gap-3">
                        {isMobile ? (
                            <button
                                onClick={handleBack}
                                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
                                aria-label="Back"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
                                aria-label="Close"
                            >
                                <span className="text-2xl">×</span>
                            </button>
                        )}

                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {displayAvatar}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm truncate">
                                    {displayName}
                                </h3>
                                <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                    <span className="text-xs text-gray-500 truncate">
                                        {isTyping ? (
                                            <span className="text-green-600 font-medium">
                                                {typingUser} is typing...
                                            </span>
                                        ) : isConnected ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 relative">
                        {error && (
                            <button
                                onClick={retryLoad}
                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                                Retry
                            </button>
                        )}

                        {/* Chat Menu Button */}
                        <button
                            onClick={() => setShowChatMenu(!showChatMenu)}
                            className="p-2 hover:bg-gray-100 rounded-full transition relative"
                            aria-label="Chat options"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Chat Menu Dropdown */}
                        {showChatMenu && (
                            <div className="
                                absolute right-0 top-full mt-1
                                bg-white border rounded-lg shadow-lg
                                w-48 py-2 z-30
                            ">
                                <button
                                    onClick={deleteChatForMe}
                                    disabled={isDeletingChat}
                                    className="
                                        w-full px-4 py-2 text-left
                                        hover:bg-red-50 hover:text-red-600
                                        flex items-center gap-2
                                        text-sm
                                        disabled:opacity-50
                                    "
                                >
                                    <User className="w-4 h-4" />
                                    {isDeletingChat ? "Deleting..." : "Delete Chat for Me"}
                                </button>
                                <button
                                    onClick={deleteChatForEveryone}
                                    disabled={isDeletingChat}
                                    className="
                                        w-full px-4 py-2 text-left
                                        hover:bg-red-50 hover:text-red-600
                                        flex items-center gap-2
                                        text-sm
                                        disabled:opacity-50
                                    "
                                >
                                    <Users className="w-4 h-4" />
                                    {isDeletingChat ? "Deleting..." : "Delete Chat for Everyone"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error display */}
                {error && (
                    <div className="px-4 py-2 bg-red-50 border-b">
                        <div className="flex justify-between items-center">
                            <span className="text-red-700 text-sm">{error}</span>
                            <button
                                onClick={retryLoad}
                                className="text-red-700 hover:text-red-900 text-sm font-medium"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Messages Container */}
                <div className="
                    flex-1 overflow-y-auto 
                    p-4
                    bg-gradient-to-b from-white via-gray-50 to-gray-50
                    pb-24 md:pb-4
                ">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
                            <p className="text-gray-600">Loading messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            <div className="text-4xl mb-4 opacity-20">💬</div>
                            <p className="text-gray-600 font-medium">No messages yet</p>
                            <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {messages.map((msg) => {
                                const isMe = msg.sender_id === currentUser.user_id;
                                const messageStatus = msg.status || 'sent';

                                // Check if message is deleted
                                if (msg.isDeleted) {
                                    return (
                                        <div key={msg.message_id} className="flex justify-center my-2">
                                            <div className="bg-gray-100 text-gray-500 text-xs px-4 py-2 rounded-full italic">
                                                {isMe ? "You deleted this message" : "This message was deleted"}
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={msg.message_id || msg.temp_id}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isMobile ? 'mobile-tap-highlight' : ''}`}
                                        onContextMenu={(e) => handleMessageRightClick(e, msg)}
                                        onClick={(e) => handleMessageClick(e, msg)}
                                    >
                                        <div className={`max-w-[80%] ${isMe ? '' : ''}`}>
                                            {/* Show sender name for other users' messages */}
                                            {!isMe && msg.User?.name && (
                                                <div className="text-xs text-gray-600 mb-1 ml-1 font-medium">
                                                    {msg.User.name}
                                                </div>
                                            )}

                                            <div className={`
                                                px-4 py-3 
                                                rounded-2xl
                                                ${isMe
                                                    ? 'bg-blue-500 text-white rounded-tr-none cursor-pointer hover:bg-blue-600 transition'
                                                    : 'bg-white text-gray-900 rounded-tl-none border border-gray-200 cursor-pointer hover:bg-gray-50 transition'
                                                }
                                                ${msg.error ? 'bg-red-100 border-red-300' : ''}
                                                shadow-sm
                                                relative
                                            `}>
                                                <div className="text-sm break-words">
                                                    {msg.content}
                                                </div>
                                                <div className={`
                                                    flex items-center justify-end mt-2
                                                    ${isMe ? 'text-blue-200' : 'text-gray-500'}
                                                `}>
                                                    <MessageStatus
                                                        status={messageStatus}
                                                        time={msg.createdAt}
                                                        isMe={isMe}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%]">
                                        <div className="text-xs text-gray-600 mb-1 ml-1 font-medium">
                                            {typingUser}
                                        </div>
                                        <div className="bg-white text-gray-900 rounded-2xl rounded-tl-none border border-gray-200 px-4 py-3 shadow-sm">
                                            <div className="flex items-center space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    )}
                </div>

                {/* Message Delete Context Menu */}
                {showDeleteMenu && selectedMessage && !selectedMessage.isDeleted && (
                    <div
                        ref={messageContextMenuRef}
                        className="
                            fixed bg-white border rounded-lg shadow-xl
                            w-48 py-2 z-40 delete-menu-animation
                        "
                        style={{
                            left: `${Math.min(deleteMenuPosition.x, window.innerWidth - 200)}px`,
                            top: `${deleteMenuPosition.y}px`
                        }}
                    >
                        <div className="px-4 py-2 border-b text-xs text-gray-500">
                            Delete message?
                        </div>

                        {/* Delete for me option - always available */}
                        <button
                            onClick={deleteMessageForMe}
                            disabled={deletingMessage}
                            className="
                                w-full px-4 py-3 text-left
                                hover:bg-gray-100
                                flex items-center gap-2
                                text-sm
                                disabled:opacity-50
                            "
                        >
                            <User className="w-4 h-4" />
                            <div>
                                <div className="font-medium">
                                    {deletingMessage ? "Deleting..." : "Delete for me"}
                                </div>
                                <div className="text-xs text-gray-500">Remove from your view</div>
                            </div>
                        </button>

                        {/* Delete for everyone option - only for my messages */}
                        {selectedMessage.sender_id === currentUser.user_id && (
                            <button
                                onClick={deleteMessageForEveryone}
                                disabled={deletingForEveryone}
                                className="
                                    w-full px-4 py-3 text-left
                                    hover:bg-red-50 hover:text-red-600
                                    flex items-center gap-2
                                    text-sm border-t
                                    disabled:opacity-50
                                "
                            >
                                <Users className="w-4 h-4" />
                                <div>
                                    <div className="font-medium">
                                        {deletingForEveryone ? "Deleting..." : "Delete for everyone"}
                                    </div>
                                    <div className="text-xs text-gray-500">Remove from chat</div>
                                </div>
                            </button>
                        )}

                        <button
                            onClick={() => setShowDeleteMenu(false)}
                            className="
                                w-full px-4 py-2 text-center
                                hover:bg-gray-100
                                text-sm border-t
                            "
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* Input Section */}
                <div className="
                    absolute bottom-0 left-0 right-0
                    md:static
                    p-3
                    bg-white
                    border-t
                    z-10
                ">
                    <div className="flex items-center gap-2">
                        <button
                            className="
                                p-2
                                text-gray-500
                                hover:text-gray-700
                                hover:bg-gray-100
                                rounded-full
                                transition
                            "
                            aria-label="Attach file"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>

                        <button
                            className="
                                p-2
                                text-gray-500
                                hover:text-gray-700
                                hover:bg-gray-100
                                rounded-full
                                transition
                            "
                            aria-label="Emoji"
                        >
                            <Smile className="w-5 h-5" />
                        </button>

                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={isConnected ? `Message ${displayName}...` : "Connecting..."}
                            className="
                                flex-1 px-4 py-3
                                bg-gray-100
                                rounded-full
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                text-sm
                                placeholder-gray-500
                                transition
                                disabled:opacity-50
                            "
                            disabled={!isConnected}
                        />

                        <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || !isConnected}
                            className={`
                                p-3
                                rounded-full
                                transition-all
                                ${newMessage.trim()
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'text-gray-400 hover:text-gray-600 bg-gray-100'
                                }
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                            aria-label="Send message"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-xs text-gray-400 mt-2 text-center">
                        {isConnected ? 'Connected to chat' : 'Connecting...'}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatWindow;