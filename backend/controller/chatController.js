// controller/chatController.js - COMPLETE FIXED VERSION
const { Chat, Message, User, sequelize } = require("../model");
const { Op } = require("sequelize");

// Create or get one-to-one chat
exports.getOrCreateChat = async (req, res) => {
    try {
        const userId1 = req.user.user_id;
        const userId2 = parseInt(req.body.user_id);

        console.log(`🔍 Creating/getting chat between ${userId1} and ${userId2}`);

        if (userId1 === userId2) {
            return res.status(400).json({ message: "Cannot chat with yourself" });
        }

        // Check if users exist
        const user1 = await User.findByPk(userId1);
        const user2 = await User.findByPk(userId2);

        if (!user1 || !user2) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find existing chat between these two users
        const allChats = await Chat.findAll({
            include: [
                {
                    model: User,
                    as: "Participants",
                    where: { user_id: [userId1, userId2] },
                },
            ],
        });

        let existingChat = null;

        for (let chat of allChats) {
            const participants = await chat.getParticipants();
            const participantIds = participants.map(p => p.user_id);

            if (participantIds.includes(userId1) && participantIds.includes(userId2) && participantIds.length === 2) {
                existingChat = chat;
                console.log(`✅ Found existing chat: ${chat.chat_id}`);
                break;
            }
        }

        if (existingChat) {
            return res.json({
                chat_id: existingChat.chat_id,
                existing: true
            });
        }

        // Create new chat
        const newChat = await Chat.create();
        await newChat.addParticipants([user1, user2]);

        console.log(`✅ Created new chat: ${newChat.chat_id}`);

        res.json({
            chat_id: newChat.chat_id,
            existing: false
        });

    } catch (err) {
        console.error("❌ Get/Create Chat error:", err);
        res.status(500).json({
            message: "Failed to create/get chat",
            error: err.message
        });
    }
};

// Get all chats for a user
exports.getChats = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const chats = await Chat.findAll({
            include: [
                {
                    model: User,
                    as: "Participants",
                    attributes: ["user_id", "name", "profilePic"],
                    where: { user_id: userId },
                },
                {
                    model: Message,
                    include: [{ model: User, attributes: ["user_id", "name", "profilePic"] }],
                },
            ],
        });

        res.json(chats);
    } catch (err) {
        console.error("❌ Get Chats error:", err);
        res.status(500).json({ message: "Failed to fetch chats" });
    }
};

// Get messages for a chat - FIXED
exports.getMessages = async (req, res) => {
    try {
        const { chat_id } = req.params;
        const userId = req.user.user_id;

        console.log(`📥 Fetching messages for chat ${chat_id}, user ${userId}`);

        // Check if chat exists and user is participant
        const chat = await Chat.findByPk(chat_id, {
            include: [{
                model: User,
                as: "Participants",
                attributes: ["user_id"]
            }],
        });

        if (!chat) {
            console.log(`❌ Chat ${chat_id} not found`);
            return res.status(404).json({
                message: "Chat not found",
                chat_id
            });
        }

        // Check if user is participant
        const isParticipant = chat.Participants.some(u => u.user_id === userId);
        if (!isParticipant) {
            console.log(`❌ User ${userId} not in chat ${chat_id}`);
            return res.status(403).json({
                message: "Not authorized to view this chat",
                chat_id,
                userId
            });
        }

        // Fetch messages - FIXED QUERY
        const messages = await Message.findAll({
            where: {
                chat_id: chat_id
            },
            include: [{
                model: User,
                attributes: ["user_id", "name", "profilePic"]
            }],
            order: [["createdAt", "ASC"]],
        });

        console.log(`✅ Found ${messages.length} messages for chat ${chat_id}`);

        // Debug: log message details
        if (messages.length > 0) {
            messages.forEach((msg, i) => {
                console.log(`  ${i + 1}. ID: ${msg.message_id}, From: ${msg.User?.name}, Content: ${msg.content}`);
            });
        }

        res.json(messages);

    } catch (err) {
        console.error("❌ Get Messages error:", err);
        console.error("Error details:", err.stack);
        res.status(500).json({
            message: "Failed to fetch messages",
            error: err.message
        });
    }
};

// Send message - FIXED
exports.sendMessage = async (req, res) => {
    try {
        const { chat_id } = req.params;
        const { content } = req.body;
        const sender_id = req.user.user_id;

        console.log(`📤 Sending message to chat ${chat_id} from user ${sender_id}: "${content}"`);

        // Validate input
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Message content is required" });
        }

        // Check if chat exists and user is participant
        const chat = await Chat.findByPk(chat_id, {
            include: [{
                model: User,
                as: "Participants",
                attributes: ["user_id"]
            }],
        });

        if (!chat) {
            console.log(`❌ Chat ${chat_id} not found`);
            return res.status(404).json({
                message: "Chat not found",
                chat_id
            });
        }

        // Check if user is participant
        const participantIds = chat.Participants.map(p => p.user_id);
        console.log(`📋 Chat ${chat_id} participants:`, participantIds);

        if (!participantIds.includes(sender_id)) {
            console.log(`❌ User ${sender_id} not in chat ${chat_id}`);
            return res.status(403).json({
                message: "Not authorized to send messages in this chat",
                chat_id,
                sender_id
            });
        }

        // Create message
        const message = await Message.create({
            chat_id,
            content: content.trim(),
            sender_id
        });

        console.log(`✅ Message created with ID: ${message.message_id}`);

        // Get full message with user info
        const fullMessage = await Message.findByPk(message.message_id, {
            include: [{
                model: User,
                attributes: ["user_id", "name", "profilePic"]
            }],
        });

        console.log(`📨 Full message data:`, {
            id: fullMessage.message_id,
            chat_id: fullMessage.chat_id,
            content: fullMessage.content,
            sender: fullMessage.User?.name
        });

        // Broadcast via Socket.IO
        const io = req.app.get("io");
        if (io) {
            const messageData = fullMessage.toJSON();
            console.log(`📡 Broadcasting to room ${chat_id}`);
            io.to(chat_id.toString()).emit("receiveMessage", messageData);
        }

        // Send response
        res.json(fullMessage);

        console.log(`✅ Message ${message.message_id} sent successfully`);

    } catch (err) {
        console.error("❌ Send Message error:", err);
        console.error("Error stack:", err.stack);

        res.status(500).json({
            message: "Failed to send message",
            error: err.message
        });
    }
};