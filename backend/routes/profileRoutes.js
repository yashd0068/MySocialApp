const express = require("express");
const router = express.Router();
const { getUserProfile, updateProfile } = require("../controller/profileController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/:user_id", verifyToken, getUserProfile);
router.put("/update", verifyToken, updateProfile);   // 

module.exports = router;
