const {DataTypes} = require('sequelize');
const BaseSequelizeModel = require('./baseSequelize.model');
const rolesEnum = require('./enums/roles.enum');
const modelName = "Users"

class User extends BaseSequelizeModel {
    static initParams(sequelize) {
        const model = {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            username: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                unique: false,
                allowNull: false
            },
            rol: {
                type: DataTypes.ENUM,
                values: rolesEnum.values
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        };
        const params = {
            sequelize,
            modelName,
            createdAt: true
        };
        const indexes = [
            {
                unique: true,
                name: `username_email_user`,
                fields: ['username', 'email']
            }
        ];

        return [
            model,
            {
                ...params,
                indexes,
            }
        ];
    }
}

module.exports = User;
