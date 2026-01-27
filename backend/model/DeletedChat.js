// models/DeletedChat.js
module.exports = (sequelize, DataTypes) => {
    const DeletedChat = sequelize.define("DeletedChat", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        chat_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'deleted_chats',
        timestamps: true,
        createdAt: 'deletedAt',
        updatedAt: false
    });

    DeletedChat.associate = (models) => {
        DeletedChat.belongsTo(models.Chat, {
            foreignKey: 'chat_id',
            as: 'Chat'
        });
        DeletedChat.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'User'
        });
    };

    return DeletedChat;
};