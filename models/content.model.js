const {DataTypes} = require('sequelize');
const BaseSequelizeModel = require('./baseSequelize.model');
const modelName = 'Content';

class Content extends BaseSequelizeModel {
    static initParams(sequelize) {
        const model = {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false
            },
            image: {
                type: DataTypes.STRING,
                allowNull: false
            },
            creator: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            theme: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            contentType: {
                type: DataTypes.ARRAY(DataTypes.INTEGER)
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
                name: `id_content`,
                fields: ['id']
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

module.exports = Content;
