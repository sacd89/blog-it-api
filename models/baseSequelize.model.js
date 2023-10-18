const { Model } = require('sequelize');

module.exports = class BaseSequelizeModel extends Model {
    static initParams() {
        throw new Error('Unimplemented');
    }
}; 