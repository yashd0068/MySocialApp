// models/Message.js - COMPLETE FIXED VERSION
module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define("Message", {
        message_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        chat_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Chats',
                key: 'chat_id'
            }
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'user_id'
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        tableName: 'messages',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });

    Message.associate = (models) => {
        Message.belongsTo(models.User, {
            foreignKey: 'sender_id',
            as: 'User'
        });
        Message.belongsTo(models.Chat, {
            foreignKey: 'chat_id',
            as: 'Chat'
        });
    };

    return Message;
};