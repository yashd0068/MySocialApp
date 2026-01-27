const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Post, Follow, Like } = require("../model");
const { Op } = require("sequelize");
const transporter = require("../config/mailer");



/* ================= REGISTER ================= */
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;


        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters",
            });
        }

        const existing = await User.findOne({
            where: { email: email.toLowerCase() },
        });

        if (existing) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            authType: "local",
        });

        const token = jwt.sign(
            { user_id: newUser.user_id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({ token });
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await User.findOne({
            where: { email: email.toLowerCase() },
        });

        if (!user || !user.passwordSet) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const match = await user.validPassword(password);

        if (!match) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { user_id: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ message: "Error logging in" });
    }
};

/* ================= GET ME ================= */
// exports.getMe = async (req, res) => {
//     try {
//         const user = await User.findByPk(req.user.user_id, {
//             attributes: ["user_id", "name", "email", "profilePic"],
//         });

//         res.json(user);
//     } catch (err) {
//         res.status(500).json({ message: "Failed to fetch user" });
//     }
// };

// exports.getMe = async (req, res) => {
//     try {
//         const user = await User.findByPk(req.user.user_id, {
//             attributes: ["user_id", "name", "email", "profilePic", "passwordSet"],
//         });

//         res.json({
//             ...user.toJSON(),
//             hasPassword: !!user.passwordSet, // frontend can use this
//         });
//     } catch (err) {
//         res.status(500).json({ message: "Failed to fetch user" });
//     }
// };

/* ================= GET ME ================= */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            attributes: ["user_id", "name", "email", "profilePic", "passwordSet", "authType"],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            hasPassword: !!user.passwordSet, // Critical for frontend
            authProvider: user.authType || "local", // Use authType from your model
        });
    } catch (err) {
        console.error("GetMe error:", err);
        res.status(500).json({ message: "Failed to fetch user" });
    }
};

exports.setPassword = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id);

        if (user.passwordSet) {
            return res.status(400).json({
                message: "Password already set. Use change-password endpoint."
            });
        }

        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: "Password set successfully" });

    } catch (err) {
        console.error("Set password error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.changePassword = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id);

        if (!user.passwordSet) {
            return res.status(400).json({
                message: "No password set. Please use set-password endpoint."
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Validate required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters"
            });
        }

        const isMatch = await user.validPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: "Password changed successfully" });

    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

/* ================= SEARCH USERS ================= */
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.params;

        const users = await User.findAll({
            where: {
                name: { [Op.like]: `%${query}%` },
            },
            attributes: ["user_id", "name", "profilePic"],
        });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Search failed" });
    }
};

/* ================= USER PROFILE ================= */
exports.getUserProfile = async (req, res) => {
    try {
        const profile_user_id = req.params.user_id;
        const current_user_id = req.user.user_id;

        // USER
        const user = await User.findByPk(profile_user_id, {
            attributes: ["user_id", "name", "profilePic"],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // STATS
        const [postsCount, followersCount, followingCount] = await Promise.all([
            Post.count({ where: { user_id: profile_user_id } }),
            Follow.count({ where: { following_id: profile_user_id } }),
            Follow.count({ where: { follower_id: profile_user_id } }),
        ]);

        // POSTS
        const posts = await Post.findAll({
            where: { user_id: profile_user_id },
            include: [
                { model: User, attributes: ["user_id", "name", "profilePic"] },
                { model: Like, as: "likes", attributes: ["user_id"] },
                {
                    model: Comment,
                    as: "comments",
                    include: [{ model: User, attributes: ["user_id", "name", "profilePic"] }]
                }
            ],
            order: [["createdAt", "DESC"]],
        });


        const formattedPosts = posts.map(post => {
            const json = post.toJSON();
            return {
                ...json,
                likesCount: json.likes.length,
                commentsCount: json.comments.length,
                likedByMe: json.likes.some(l => l.user_id === current_user_id),
            };
        });


        res.json({
            user,
            stats: {
                posts: postsCount,
                followers: followersCount,
                following: followingCount,
            },
            posts: formattedPosts,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to load profile" });
    }
};

/* ================= UPLOAD PROFILE PIC ================= */
exports.uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        await User.update(
            { profilePic: imageUrl },
            { where: { user_id: req.user.user_id } }
        );

        res.json({
            message: "Profile picture updated",
            profilePic: imageUrl
        });
    } catch (err) {
        console.error("UPLOAD ERROR:", err);
        res.status(500).json({ message: "Upload failed" });
    }
};


exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email. Please check or sign up."
            });
        }

        if (!user.passwordSet) {
            return res.status(400).json({
                message: "This account uses social login. Please login with your OAuth provider.",
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await user.update({
            resetOTP: otp,
            resetOTPExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        await transporter.sendMail({
            from: `"Todo App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset OTP",
            html: `<h2>Your OTP for password reset:</h2><h1 style="color:blue;">${otp}</h1><p>This OTP is valid for 10 minutes only.</p>`,
        });

        return res.status(200).json({
            message: "OTP sent successfully to your email"
        });

    } catch (err) {
        console.error("Forgot password error:", err);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({
            where: {
                email,
                resetOTP: otp,
                resetOTPExpiry: { [Op.gt]: new Date() },
            },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.json({ message: "OTP verified successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Use the instance method to update password
        // This will trigger the beforeUpdate hooks
        user.password = newPassword;
        await user.save();

        res.json({
            message: "Password reset successfully",
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error during password reset",
            error: err.message
        });
    }
};