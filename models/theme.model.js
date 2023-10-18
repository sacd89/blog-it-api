const {DataTypes} = require('sequelize');
const BaseSequelizeModel = require('./baseSequelize.model');
const modelName = 'Theme';

class Theme extends BaseSequelizeModel {
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
            categories: {
                type: DataTypes.ARRAY(DataTypes.INTEGER),
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
                name: `id_name_theme`,
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

module.exports = Theme;
