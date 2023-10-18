const { Sequelize } = require('sequelize');
const log4js = require('log4js');
const logger = log4js.getLogger('Sequelize');

let sequelize;

const init = async function(sqlConfig) {
    
    sequelize = new Sequelize(sqlConfig);

    const User = require('../../models/user.model');
    const Category = require('../../models/category.model');
    const Theme = require('../../models/theme.model');
    const Content = require('../../models/content.model');
    const ContentType = require('../../models/contentType.model');

    const [UserModel, UserOptions] = User.initParams(sequelize);
    const [CategoryModel, CategoryOptions] = Category.initParams(sequelize);
    const [ThemeModel, ThemeOptions] = Theme.initParams(sequelize);
    const [ContentModel, ContentOptions] = Content.initParams(sequelize);
    const [ContentTypeModel, ContentTypeOptions] = ContentType.initParams(sequelize);

    User.init(UserModel, UserOptions);
    Category.init(CategoryModel, CategoryOptions);
    Theme.init(ThemeModel, ThemeOptions);
    Content.init(ContentModel, ContentOptions);
    ContentType.init(ContentTypeModel, ContentTypeOptions);

    Category.hasMany(Theme, {foreignKey: 'categories'});
    Theme.belongsTo(Category, {foreignKey: 'categories'});
    Content.hasMany(Theme, {foreignKey: 'categories'});
    User.hasMany(Content, { foreignKey: 'creator' });
    Content.belongsTo(User, { foreignKey: 'creator' });
    Theme.hasMany(Content, { foreignKey: 'theme' });
    Content.belongsTo(Theme, { foreignKey: 'theme' });
    Content.hasMany(ContentType, {foreignKey: 'contentTypes'});
    ContentType.belongsTo(Content, {foreignKey: 'content'});

    await User.sync();
    await Category.sync();
    await Theme.sync();
    await Content.sync();
    await ContentType.sync();

    logger.info('DB Initialize successfully')
    return Promise.resolve();
};

const get = function() {
    return sequelize;
};

module.exports = {
    init,
    get
};
