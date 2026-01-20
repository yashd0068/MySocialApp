const { User, Post, Follow, Like, Comment } = require("../model");
const { Op } = require("sequelize");

exports.getUserProfile = async (req, res) => {
    try {
        const profile_user_id = req.params.user_id;
        const current_user_id = req.user.user_id;

        // USER
        const user = await User.findByPk(profile_user_id, {
            attributes: ["user_id", "name", "email", "profilePic"],
        });
        if (!user) return res.status(404).json({ message: "User not found" });

        // ← ADD THIS: Check if current user is following this profile
        const isFollowing = await Follow.findOne({
            where: {
                follower_id: current_user_id,
                following_id: profile_user_id,
            },
        }) !== null;

        // STATS
        const [postsCount, followersCount, followingCount] = await Promise.all([
            Post.count({ where: { user_id: profile_user_id } }),
            Follow.count({ where: { following_id: profile_user_id } }),
            Follow.count({ where: { follower_id: profile_user_id } }),
        ]);

        // POSTS with likes and comments
        const posts = await Post.findAll({
            where: { user_id: profile_user_id },
            include: [
                { model: User, attributes: ["user_id", "name", "profilePic"] },
                { model: Like, as: "likes", attributes: ["user_id"] },
                {
                    model: Comment,
                    as: "comments",
                    include: [{ model: User, attributes: ["user_id", "name", "profilePic"] }],
                    order: [["createdAt", "ASC"]],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const formattedPosts = posts.map(post => {
            const json = post.toJSON();
            return {
                ...json,
                likesCount: json.likes.length,
                likedByMe: json.likes.some(like => like.user_id === current_user_id),
                comments: json.comments || [],
            };
        });

        res.json({
            user,
            stats: {
                posts: postsCount,
                followers: followersCount,
                following: followingCount
            },
            posts: formattedPosts,
            isFollowing: isFollowing   // ← ADD THIS LINE (this is the key!)
        });

    } catch (err) {
        console.error("Profile fetch error:", err);
        res.status(500).json({ message: "Failed to load profile" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { name, email } = req.body;

        if (!name && !email) {
            return res.status(400).json({ message: "Nothing to update" });
        }

        // 🔒 Check if email already exists (except this user)
        if (email) {
            const existingUser = await User.findOne({
                where: {
                    email,
                    user_id: { [Op.ne]: userId }
                }
            });

            if (existingUser) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        // Update
        await User.update(
            { name, email },
            { where: { user_id: userId } }
        );

        const updatedUser = await User.findByPk(userId, {
            attributes: ["user_id", "name", "email", "profilePic"]
        });

        res.json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ message: "Server error" });
    }
};