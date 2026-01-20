const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const db = {};

db.sequelize = sequelize;

/* ================= MODELS ================= */

db.User = require("./user")(sequelize, DataTypes);
db.Post = require("./post")(sequelize, DataTypes);
db.Like = require("./like")(sequelize, DataTypes);
db.Follow = require("./Follow")(sequelize, DataTypes);
db.Comment = require("./Comment")(sequelize, DataTypes);
db.Chat = require("./Chat")(sequelize, DataTypes);
db.Message = require("./Message")(sequelize, DataTypes);

db.Notification = require("./Notification")(sequelize, DataTypes);

/* ================= POSTS ================= */

db.User.hasMany(db.Post, { foreignKey: "user_id" });
db.Post.belongsTo(db.User, { foreignKey: "user_id" });

/* ================= LIKES ================= */

db.User.hasMany(db.Like, { foreignKey: "user_id" });

db.Post.hasMany(db.Like, {
    foreignKey: "post_id",
    as: "likes",
});

db.Like.belongsTo(db.User, { foreignKey: "user_id" });
db.Like.belongsTo(db.Post, { foreignKey: "post_id" });

db.User.belongsToMany(db.Post, {
    through: db.Like,
    foreignKey: "user_id",
    otherKey: "post_id",
    as: "LikedPosts",
});

db.Post.belongsToMany(db.User, {
    through: db.Like,
    foreignKey: "post_id",
    otherKey: "user_id",
    as: "Likers",
});

/* ================= COMMENTS ================= */

db.User.hasMany(db.Comment, { foreignKey: "user_id" });
db.Comment.belongsTo(db.User, { foreignKey: "user_id" });

db.Post.hasMany(db.Comment, {
    foreignKey: "post_id",
    as: "comments",
});
db.Comment.belongsTo(db.Post, { foreignKey: "post_id" });

/* ================= FOLLOW ================= */

db.User.belongsToMany(db.User, {
    through: db.Follow,
    as: "Following",
    foreignKey: "follower_id",
    otherKey: "following_id",
});

db.User.belongsToMany(db.User, {
    through: db.Follow,
    as: "Followers",
    foreignKey: "following_id",
    otherKey: "follower_id",
});

db.Follow.belongsTo(db.User, { foreignKey: "follower_id", as: "FollowerUser" });
db.Follow.belongsTo(db.User, { foreignKey: "following_id", as: "FollowingUser" });

// Chat ↔ User through ChatUsers
db.Chat.belongsToMany(db.User, { through: "ChatUsers", as: "Participants" });
db.User.belongsToMany(db.Chat, { through: "ChatUsers", as: "Chats" });



db.Chat.belongsToMany(db.User, { through: "ChatUsers" });
db.User.belongsToMany(db.Chat, { through: "ChatUsers" });

db.Message.belongsTo(db.User, { foreignKey: "sender_id" });
db.User.hasMany(db.Message, { foreignKey: "sender_id" });

db.User.hasMany(db.Notification, { foreignKey: "user_id", as: "Notifications" });
db.Notification.belongsTo(db.User, { foreignKey: "user_id" });

db.Notification.belongsTo(db.User, { foreignKey: "trigger_user_id", as: "TriggerUser" });
db.Notification.belongsTo(db.Post, { foreignKey: "post_id" });
db.Notification.belongsTo(db.Message, { foreignKey: "message_id" });

module.exports = db;
