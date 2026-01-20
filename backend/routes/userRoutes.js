const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

console.log("UPLOAD =", upload)



const { register, login, getMe, getUserProfile, uploadProfilePic, changePassword, setPassword, forgotPassword, verifyOTP, resetPassword } =
    require("../controller/userController");
const { verifyToken } = require("../middleware/authMiddleware");


// Auth routes
router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// Current user
router.get("/me", verifyToken, getMe);

// Search users 
router.get("/search/:query", verifyToken, async (req, res) => {
    const { query } = req.params;
    const { Op } = require("sequelize");
    const { User } = require("../model");

    const users = await User.findAll({
        where: {
            name: { [Op.like]: `%${query}%` },
        },
        attributes: ["user_id", "name", "profilePic"],
    });

    res.json(users);
});

router.put(
    "/profile-pic",
    verifyToken,
    upload.single("image"),
    uploadProfilePic
);
// Get any user profile
router.get("/:user_id", verifyToken, getUserProfile);

router.post("/set-password", verifyToken, setPassword);
router.post("/change-password", verifyToken, changePassword);

console.log("uploadProfilePic =", uploadProfilePic);



module.exports = router;
