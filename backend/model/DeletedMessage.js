// models/DeletedMessage.js
module.exports = (sequelize, DataTypes) => {
    const DeletedMessage = sequelize.define("DeletedMessage", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        message_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        tableName: 'deleted_messages',
        timestamps: true,
        createdAt: 'deletedAt',
        updatedAt: false
    });

    DeletedMessage.associate = (models) => {
        DeletedMessage.belongsTo(models.Message, {
            foreignKey: 'message_id',
            as: 'Message'
        });
        DeletedMessage.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'User'
        });
    };

    return DeletedMessage;
};