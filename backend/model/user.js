const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User",
        {

            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            email: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false,
                validate: {    //
                    isEmail: true,
                    len: [5, 100]
                }
            },

            password: {
                type: DataTypes.STRING,
                allowNull: true
            },



            profilePic: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            authType: {
                type: DataTypes.STRING,
                defaultValue: "local", // local/jwt, github, facebook
            },

            passwordSet: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,   // Tracks if OAuth user set local pwd
            },

            github_id: { type: DataTypes.STRING, allowNull: true },
            facebook_id: { type: DataTypes.STRING, allowNull: true },

            resetOTP: { type: DataTypes.STRING, allowNull: true },
            resetOTPExpiry: { type: DataTypes.DATE, allowNull: true },
        },
        {

            timestamps: true,

            indexes: [

                { unique: true, fields: ['email'] },
                { fields: ['github_id'] },
                { fields: ['facebook_id'] }
            ],


            hooks: {
                beforeCreate: async (user) => {
                    if (user.password) {

                        const salt = await bcrypt.genSalt(12); // Stronger salt
                        user.password = await bcrypt.hash(user.password, salt);
                        user.passwordSet = true;
                    }
                },
                beforeUpdate: async (user) => {
                    if (user.changed("password") && user.password) {
                        const salt = await bcrypt.genSalt(12);
                        user.password = await bcrypt.hash(user.password, salt);
                        user.passwordSet = true;
                    }
                }
            }
        }
    );


    User.prototype.validPassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    return User;
};