// controller/chatController.js - COMPLETE FIXED VERSION
// const { Chat, Message, User, sequelize, } = require("../model");
const { Chat, Message, User, sequelize, DeletedMessage, DeletedChat } = require("../model");
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
// exports.getChats = async (req, res) => {
//     try {
//         const userId = req.user.user_id;

//         const chats = await Chat.findAll({
//             include: [
//                 {
//                     model: User,
//                     as: "Participants",
//                     attributes: ["user_id", "name", "profilePic"],
//                     where: { user_id: userId },
//                 },
//                 {
//                     model: Message,
//                     include: [{ model: User, attributes: ["user_id", "name", "profilePic"] }],
//                 },
//             ],
//         });

//         res.json(chats);
//     } catch (err) {
//         console.error("❌ Get Chats error:", err);
//         res.status(500).json({ message: "Failed to fetch chats" });
//     }
// };

exports.getChats = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const chats = await Chat.findAll({
            where: {
                chat_id: {
                    [Op.notIn]: sequelize.literal(`(
                        SELECT chat_id FROM deleted_chats 
                        WHERE user_id = ${userId}
                    )`)
                }
            },
            include: [
                {
                    model: User,
                    as: "Participants",
                    attributes: ["user_id", "name", "profilePic"],
                    through: { attributes: [] },
                },
                {
                    model: Message,
                    as: "Messages",
                    limit: 1,
                    order: [["createdAt", "DESC"]],
                },
            ],
            order: [["updatedAt", "DESC"]],
        });


        // Only return chats where current user is a participant
        const userChats = chats.filter(chat =>
            chat.Participants.some(p => p.user_id === userId)
        );

        res.json(userChats);

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
                chat_id: chat_id,
                message_id: {
                    [Op.notIn]: sequelize.literal(`(
                        SELECT message_id FROM deleted_messages 
                        WHERE user_id = ${userId}
                    )`)
                }

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

        const { temp_id } = req.body;
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
            const messageData = {
                ...fullMessage.toJSON(),
                temp_id
            };
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

// Get chat info (participants)
exports.getChatInfo = async (req, res) => {
    try {
        const { chat_id } = req.params;
        const userId = req.user.user_id;

        const chat = await Chat.findByPk(chat_id, {
            include: [
                {
                    model: User,
                    as: "Participants",
                    attributes: ["user_id", "name", "profilePic"]
                }
            ]
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const otherUser = chat.Participants.find(p => p.user_id !== userId);

        res.json({ otherUser });

    } catch (err) {
        console.error("❌ Get Chat Info error:", err);
        res.status(500).json({ message: "Failed to fetch chat info" });
    }
};








//// Delete functionalty 

// Delete message for me only
// exports.deleteMessageForMe = async (req, res) => {
//     try {
//         const { message_id } = req.params;
//         const userId = req.user.user_id;

//         console.log(`🗑️ Deleting message ${message_id} for user ${userId}`);

//         // Check if message exists
//         const message = await Message.findByPk(message_id);
//         if (!message) {
//             return res.status(404).json({ message: "Message not found" });
//         }

//         // Check if user is in the chat
//         const chat = await Chat.findByPk(message.chat_id, {
//             include: [{
//                 model: User,
//                 as: "Participants",
//                 attributes: ["user_id"]
//             }],
//         });

//         if (!chat) {
//             return res.status(404).json({ message: "Chat not found" });
//         }

//         const isParticipant = chat.Participants.some(u => u.user_id === userId);
//         if (!isParticipant) {
//             return res.status(403).json({ message: "Not authorized" });
//         }

//         // Create deletion record (soft delete for this user)
//         await DeletedMessage.create({
//             message_id,
//             user_id: userId
//         });

//         // Emit socket event
//         const io = req.app.get("io");
//         if (io) {
//             io.to(message.chat_id.toString()).emit("messageDeleted", {
//                 messageId: message_id,
//                 userId: userId,
//                 deleteForEveryone: false
//             });
//         }

//         res.json({
//             success: true,
//             message: "Message deleted for you"
//         });

//     } catch (err) {
//         console.error("❌ Delete message error:", err);
//         res.status(500).json({ message: "Failed to delete message", error: err.message });
//     }
// };
exports.deleteMessageForMe = async (req, res) => {
    try {
        const { message_id } = req.params;
        const userId = req.user.user_id;

        console.log(`🗑️ Deleting message ${message_id} for user ${userId}`);

        const message = await Message.findByPk(message_id);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        const chat = await Chat.findByPk(message.chat_id, {
            include: [{ model: User, as: "Participants", attributes: ["user_id"] }]
        });

        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const isParticipant = chat.Participants.some(u => u.user_id === userId);
        if (!isParticipant) return res.status(403).json({ message: "Not authorized" });

        // prevent duplicate delete
        const alreadyDeleted = await DeletedMessage.findOne({
            where: { message_id, user_id: userId }
        });

        if (alreadyDeleted) {
            return res.json({ success: true, message: "Already deleted for you" });
        }

        await DeletedMessage.create({
            message_id,
            user_id: userId
        });

        const io = req.app.get("io");
        if (io) {
            io.to(message.chat_id.toString()).emit("messageDeleted", {
                messageId: message_id,
                userId,
                deleteForEveryone: false
            });
        }

        res.json({ success: true, message: "Message deleted for you" });

    } catch (err) {
        console.error("❌ Delete message error:", err);
        res.status(500).json({ message: "Failed to delete message", error: err.message });
    }
};

// Delete message for everyone
exports.deleteMessageForEveryone = async (req, res) => {
    try {
        const { message_id } = req.params;
        const userId = req.user.user_id;

        console.log(`🗑️ Deleting message ${message_id} for everyone by user ${userId}`);

        // Check if message exists
        const message = await Message.findByPk(message_id);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        // Check if user is the sender
        if (message.sender_id !== userId) {
            return res.status(403).json({
                message: "Only the sender can delete messages for everyone"
            });
        }

        // Check if message is too old (optional - Telegram allows 48 hours)
        const messageAge = Date.now() - new Date(message.createdAt).getTime();
        const hoursOld = messageAge / (1000 * 60 * 60);

        if (hoursOld > 48) {
            return res.status(400).json({
                message: "Messages older than 48 hours cannot be deleted for everyone"
            });
        }

        // Delete the message permanently
        await message.destroy();

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(message.chat_id.toString()).emit("messageDeleted", {
                messageId: message_id,
                userId: userId,
                deleteForEveryone: true
            });
        }

        res.json({
            success: true,
            message: "Message deleted for everyone"
        });

    } catch (err) {
        console.error("❌ Delete message for everyone error:", err);
        res.status(500).json({ message: "Failed to delete message", error: err.message });
    }
};

// Delete chat for me only
exports.deleteChatForMe = async (req, res) => {
    try {
        const { chat_id } = req.params;
        const userId = req.user.user_id;

        console.log(`🗑️ Deleting chat ${chat_id} for user ${userId}`);

        // Check if chat exists
        const chat = await Chat.findByPk(chat_id);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Create deletion record
        await DeletedChat.create({
            chat_id,
            user_id: userId
        });

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(chat_id.toString()).emit("chatDeleted", {
                chatId: chat_id,
                userId: userId,
                deleteForEveryone: false
            });
        }

        res.json({
            success: true,
            message: "Chat deleted for you"
        });

    } catch (err) {
        console.error("❌ Delete chat error:", err);
        res.status(500).json({ message: "Failed to delete chat", error: err.message });
    }
};

// Delete chat for everyone
exports.deleteChatForEveryone = async (req, res) => {
    try {
        const { chat_id } = req.params;
        const userId = req.user.user_id;

        console.log(`🗑️ Deleting chat ${chat_id} for everyone by user ${userId}`);

        // Check if chat exists
        const chat = await Chat.findByPk(chat_id);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Delete all messages in chat
        await Message.destroy({
            where: { chat_id }
        });

        // Delete the chat
        await chat.destroy();

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to(chat_id.toString()).emit("chatDeleted", {
                chatId: chat_id,
                userId: userId,
                deleteForEveryone: true
            });
        }

        res.json({
            success: true,
            message: "Chat deleted for everyone"
        });

    } catch (err) {
        console.error("❌ Delete chat for everyone error:", err);
        res.status(500).json({ message: "Failed to delete chat", error: err.message });
    }
};