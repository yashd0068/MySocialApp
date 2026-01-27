const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { getOrCreateChat, getChats, sendMessage, getMessages, getChatInfo, deleteMessageForMe,
    deleteMessageForEveryone,
    deleteChatForMe,
    deleteChatForEveryone } = require("../controller/chatController");

router.post("/", verifyToken, getOrCreateChat);
router.get("/", verifyToken, getChats);
router.post("/:chat_id/message", verifyToken, sendMessage);
router.get("/:chat_id/messages", verifyToken, getMessages);
router.get("/:chat_id/info", verifyToken, getChatInfo);

router.delete("/message/:message_id/delete-for-me", verifyToken, deleteMessageForMe);
router.delete("/message/:message_id/delete-for-everyone", verifyToken, deleteMessageForEveryone);
router.delete("/:chat_id/delete-for-me", verifyToken, deleteChatForMe);
router.delete("/:chat_id/delete-for-everyone", verifyToken, deleteChatForEveryone);

module.exports = router;
