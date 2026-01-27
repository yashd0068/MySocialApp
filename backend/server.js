require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const sequelize = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware ---------------- 
app.use(cors());
app.use(express.json());

// Routes --------------------
app.use("/api/users", userRoutes);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/follow", require("./routes/followRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/chat", chatRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/notifications", require("./routes/notificationRoutes"));

app.get("/", (req, res) => res.send("API is running..."));

// ---------------- SOCKET.IO ----------------
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

// Store active users and typing status
const activeUsers = new Map(); // socketId -> {userId, userName, socket}
const typingUsers = new Map(); // chatId -> {userId, userName, lastTyping}

global.io = io;
app.set("io", io);

// Socket.io connection handler
io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Store user info when they connect
    socket.on("userInfo", (userData) => {
        const { userId, userName } = userData;
        activeUsers.set(socket.id, { userId, userName, socket });
        socket.userId = userId;
        socket.userName = userName;
        console.log(`User ${userName} (${userId}) connected with socket ${socket.id}`);
    });

    // Join chat room
    socket.on("joinChat", (chatId) => {
        if (!chatId) return;
        const room = chatId.toString();
        socket.join(room);
        console.log(`User ${socket.userId} joined chat room: ${room}`);

        // Send acknowledgement
        socket.emit("chatJoined", { room, success: true });

        // Mark messages as read for this user in this chat
        markMessagesAsRead(chatId, socket.userId);
    });

    // Leave chat room
    socket.on("leaveChat", (chatId) => {
        if (!chatId) return;
        const room = chatId.toString();
        socket.leave(room);

        // Remove typing status
        typingUsers.delete(room);

        console.log(`User ${socket.userId} left chat room: ${room}`);
    });

    // Typing indicator
    socket.on("typing", (data) => {
        const { chatId, userId, userName } = data;
        if (!chatId) return;

        const room = chatId.toString();

        // Update typing users
        typingUsers.set(room, { userId, userName, lastTyping: Date.now() });

        // Broadcast to others in chat (except sender)
        socket.to(room).emit("userTyping", {
            chatId,
            userId,
            userName,
            timestamp: Date.now()
        });

        console.log(`User ${userName} is typing in chat ${chatId}`);
    });

    // Stop typing indicator
    socket.on("stopTyping", (data) => {
        const { chatId, userId } = data;
        if (!chatId) return;

        const room = chatId.toString();

        // Remove from typing users
        const typingUser = typingUsers.get(room);
        if (typingUser && typingUser.userId === userId) {
            typingUsers.delete(room);
        }

        // Broadcast to others in chat
        socket.to(room).emit("userStopTyping", {
            chatId,
            userId
        });

        console.log(`User ${userId} stopped typing in chat ${chatId}`);
    });

    // Handle sending message (optional - if you want to send via socket)
    socket.on("sendMessage", (messageData) => {
        const { chatId, content, temp_id, sender_id } = messageData;
        if (!chatId || !content) return;

        const room = chatId.toString();

        // Emit to all in chat room (including sender for delivery confirmation)
        io.to(room).emit("receiveMessage", {
            ...messageData,
            createdAt: new Date().toISOString(),
            temp_id, // Include temp_id for client matching
            status: 'sent'
        });

        console.log(`Message sent in chat ${chatId} by user ${sender_id}`);
    });

    // Message delivered (when user receives message)
    socket.on("messageDelivered", (data) => {
        const { messageId, chatId } = data;
        if (!chatId || !messageId) return;

        const room = chatId.toString();

        // Update message status in database
        updateMessageStatus(messageId, 'delivered');

        // Notify sender (broadcast to others in room)
        socket.to(room).emit("messageDelivered", {
            messageId,
            chatId,
            timestamp: Date.now()
        });

        console.log(`Message ${messageId} delivered in chat ${chatId}`);
    });

    // Message read (when user opens chat/messages)
    socket.on("messageRead", (data) => {
        const { messageIds, chatId } = data;
        if (!chatId || !messageIds || !Array.isArray(messageIds)) return;

        const room = chatId.toString();

        // Update messages status in database
        markMessagesAsRead(chatId, socket.userId);

        // Notify sender
        socket.to(room).emit("messageRead", {
            messageIds,
            chatId,
            readerId: socket.userId,
            timestamp: Date.now()
        });

        console.log(`Messages read by user ${socket.userId} in chat ${chatId}: ${messageIds.length} messages`);
    });

    // Cleanup on disconnect
    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id} (User: ${socket.userId})`);

        // Remove from active users
        activeUsers.delete(socket.id);

        // Clean up typing indicators
        for (const [chatId, data] of typingUsers.entries()) {
            if (data.userId === socket.userId) {
                typingUsers.delete(chatId);

                // Notify others in chat
                io.to(chatId).emit("userStopTyping", {
                    chatId,
                    userId: socket.userId
                });

                console.log(`Cleaned up typing status for user ${socket.userId} in chat ${chatId}`);
            }
        }
    });

    // Handle errors
    socket.on("error", (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
});

// Helper functions (you'll need to implement these based on your database)
async function updateMessageStatus(messageId, status) {
    try {
        // Implement your database update logic here
        // Example:
        // await Message.update({ status }, { where: { message_id: messageId } });
        console.log(`Message ${messageId} status updated to: ${status}`);
    } catch (error) {
        console.error("Error updating message status:", error);
    }
}

async function markMessagesAsRead(chatId, userId) {
    try {
        // Implement your database logic to mark messages as read
        // Example:
        // await Message.update(
        //     { status: 'read' },
        //     { 
        //         where: { 
        //             chat_id: chatId,
        //             sender_id: { [Op.ne]: userId },
        //             status: { [Op.ne]: 'read' }
        //         }
        //     }
        // );
        console.log(`Messages marked as read in chat ${chatId} by user ${userId}`);
    } catch (error) {
        console.error("Error marking messages as read:", error);
    }
}

// Periodic cleanup of stale typing indicators
setInterval(() => {
    const now = Date.now();
    const timeout = 3000; // 3 seconds without typing activity

    for (const [chatId, data] of typingUsers.entries()) {
        if (now - data.lastTyping > timeout) {
            typingUsers.delete(chatId);

            // Notify chat room that user stopped typing
            io.to(chatId).emit("userStopTyping", {
                chatId,
                userId: data.userId
            });

            console.log(`Cleaned up stale typing indicator for user ${data.userId} in chat ${chatId}`);
        }
    }
}, 1000); // Check every second

// ---------------- DATABASE + SERVER ----------------
sequelize
    .sync()
    .then(() => {
        console.log("Database synced successfully");
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Socket.IO is ready with typing indicators and message status tracking`);
        });
    })
    .catch((err) => {
        console.error("Database sync error:", err);
    });