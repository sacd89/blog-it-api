const {DataTypes} = require('sequelize');
const BaseSequelizeModel = require('./baseSequelize.model');
const modelName = 'Category';

class Category extends BaseSequelizeModel {
    static initParams(sequelize) {
        const model = {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            allowTypes: {
                type: DataTypes.ARRAY(DataTypes.STRING),
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
                name: `id_name_category`,
                fields: ['id', 'name']
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

module.exports = Category;
