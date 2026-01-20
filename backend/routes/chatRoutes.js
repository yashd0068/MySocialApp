const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { getOrCreateChat, getChats, sendMessage, getMessages } = require("../controller/chatController");

router.post("/", verifyToken, getOrCreateChat);
router.get("/", verifyToken, getChats);
router.post("/:chat_id/message", verifyToken, sendMessage);
router.get("/:chat_id/messages", verifyToken, getMessages);

module.exports = router;
