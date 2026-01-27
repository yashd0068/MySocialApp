module.exports = (sequelize, DataTypes) => {
    const Chat = sequelize.define("Chat", {
        chat_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        tableName: 'chats',
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    });

    Chat.associate = (models) => {
        Chat.belongsToMany(models.User, {
            through: 'ChatUsers',
            as: 'Participants',
            foreignKey: 'chat_id',
            otherKey: 'user_id'
        });

        Chat.hasMany(models.Message, {
            foreignKey: 'chat_id',
            as: 'Messages'
        });
    };

    return Chat;
};