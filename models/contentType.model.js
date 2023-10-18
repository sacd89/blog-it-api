const {DataTypes} = require('sequelize');
const BaseSequelizeModel = require('./baseSequelize.model');
const modelName = 'ContentType';

class ContentType extends BaseSequelizeModel {
    static initParams(sequelize) {
        const model = {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            content: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            category: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            data: {
                type: DataTypes.STRING,
                allowNull: false
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
                name: `id_content_category_contentType`,
                fields: ['id', 'content', 'category']
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

module.exports = ContentType;
