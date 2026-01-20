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
});


global.io = io;
app.set("io", io);

// In your server-side socket setup
io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ✅ CHAT ROOMS - Fixed parameter handling
    socket.on("joinChat", (chatId) => {
        if (!chatId) return;
        const room = chatId.toString();
        socket.join(room);
        console.log(`Socket ${socket.id} joined chat room: ${room}`);

        // Send acknowledgement
        socket.emit("chatJoined", { room, success: true });
    });

    socket.on("leaveChat", (chatId) => {
        if (!chatId) return;
        const room = chatId.toString();
        socket.leave(room);
        console.log(`Socket ${socket.id} left chat room: ${room}`);
    });

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});
// ---------------- DATABASE + SERVER ----------------
sequelize
    .sync()
    .then(() => {
        console.log("Database synced successfully");
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Socket.IO is ready - clients can connect now`);
        });
    })
    .catch((err) => {
        console.error("Database sync error:", err);
    });
