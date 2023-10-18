const log4js = require('log4js');
const {Op} = require('sequelize');

const logger = log4js.getLogger('Themes');

const Theme = require('../models/theme.model');
const Category = require('../models/category.model');
const Content = require('../models/content.model');

/**
 * Metodo que genera un registro de una tematica.
 * 
 * Parametros esperados en el body:
 *      - name (String): Nombre de la tematica
 *      - categories (Array<String>): Id de categorias
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function createTheme(req, res) {
    const body = req.body;

    if(!body.name || !body.categories) {
        logger.error(`#createTheme#`, 'Invalid Params', `Body: ${body}`);
        return res.status(422).json({message: 'Invalid Params'});
    }

    try {

        const categoriesExists = await Category.count({where: {
            id: {[Op.in]: body.categories}
        }});

        if(categoriesExists !== body.categories.length) {
            logger.error(`#createTheme#`, 'Some categories doesnt exists');
            return res.status(500).json({message: 'Error create theme'});
        }

        await Theme.create({ name: body.name, categories: body.categories });
    
        return res.status(200).json({message: 'Theme create successfully'});

    } catch(err) {
        logger.error(`#createTheme#`, `DB return error  -> `, err);
        logger.error(`#createTheme#`, 'Error create theme');
        return res.status(500).json({message: 'Error create theme'});

    }
}

/**
 * Metodo para editar una tematica
 * 
 *  * Parametros esperados en el body:
 *      - themeId (String): Id de la tematica
 *      - name (String): Nombre de la tematica
 *      - categories (Array<String>): Id de categorias
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function updateTheme(req, res) {
    const body = req.body;

    if(!body.themeId || !body.name || !body.categories) {
        logger.error(`#updateTheme#`, 'Invalid Params', `Body: ${body}`);
        return res.status(422).json({message: 'Invalid Params'});
    }

    try {

        const categoriesExists = await Category.count({where: {
            id: {[Op.in]: body.categories}
        }});

        if(categoriesExists !== body.categories.length) {
            logger.error(`#updateTheme#`, 'Some categories doesnt exists');
            return res.status(500).json({message: 'Error update theme'});
        }

        const themeUpdated = await Theme.update({ name: body.name, categories: body.categories }, {
            where: {
              id: body.themeId
            }
          });
    
        return res.status(200).json({message: 'Theme update successfully', object: themeUpdated.dataValues});

    } catch(err) {
        logger.error(`#updateTheme#`, `DB return error  -> `, err.message);
        logger.error(`#updateTheme#`, 'Error update theme');
        return res.status(500).json({message: 'Error update theme'});

    }
}

/**
 * Metodo para obtener tematica por Id
 * 
 *  * Parametros esperados en el body:
 *      - id (String): Id de la tematica
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function getById(req, res) {
    const body = req.body;
    
    if(!body.id) {
        logger.error(`#getById#`, 'Invalid Params', `Body: ${body}`);
        return res.status(422).json({message: 'Invalid Params'});
    }

    try {
        const themeFound = await Theme.findOne({where: {
            id: body.id
        }});

        if(themeFound) {

            const allCategories = await Category.findAll({where: {id: {[Op.in]: themeFound.categories}}});

            if(allCategories) {
                themeFound.categories = [...allCategories];
                return res.status(200).json({message: 'Theme found successfully', object: themeFound.dataValues});
            } else {
                logger.error(`#getById#`, 'Error getting categories');

            }

        }
    
        return res.status(500).json({message: 'Theme not found'});

    } catch(err) {
        logger.error(`#getById#`, `DB return error  -> `, err);
        logger.error(`#getById#`, 'Theme not found');
        return res.status(500).json({message: 'Theme not found'});

    }
}

/**
 * Metodo que regresa listado de tematicas
 * 
 *  * Parametros esperados en el body:
 *      - filters (Object): Filtros a aplicarse en listado
 *          - search (String): Texto a buscar dentro del campo name
 *          - sort (Object): Filtro para ordenar por campo y por tipo de orden
 *              - field (String): Campo por el cual se va a ordenar
 *              - order (String): Tipo de orden (ASC, DESC)
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function getList(req, res) {
    const body = req.body;

    try {

        let query = {};

        if(body.filters) {
            if(body.filters.search) {
                query.where = {
                    name: { [Op.substring]: body.filters.search }
                }

            }

            if(body.filters.sort) {
                if(body.filters.sort.field && body.filters.sort.order) {
                    query.order = [
                        [body.filters.sort.field, body.filters.sort.order],
                    ];
                } else {
                    query.order = [
                        ['createdAt', 'DESC'],
                    ]
                }
            }

        }

        const themes = await Theme.findAll(query);

        if(themes) {

            // for(const t of themes) {
            //     const categories = await Category.findAll({attributes: [
            //         'id', 'name'
            //      ], where: {id: {[Op.in]: t.categories}}})
            //     const onlyNames = categories.map(c => c.id);
            //     t.categories = categories;
            // }

            return res.status(200).json({message: 'Themes list get successfully', object: themes});
        }
    
        return res.status(500).json({message: 'Themes not found'});

    } catch(err) {
        logger.error(`#getList#`, `DB return error  -> `, err.message);
        logger.error(`#getList#`, 'Error get list of themes');
        return res.status(500).json({message: 'Error get list of themes'});

    }
}

/**
 * Metodo para eliminar una tematica
 * 
 *  * Parametros esperados en el body:
 *      - themeId (String): Id de la tematica
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function deleteTheme(req , res) {
    const body = req.body;

    if(!body.themeId) {
        logger.error(`#deleteTheme#`, 'Invalid Params', `Body: ${body}`);
        return res.status(422).json({message: 'Invalid Params'});
    }

    try {
        const themeFound = await Theme.findOne({ where: {
            id: body.themeId
        }});

        if(themeFound) {

            const contents = await Content.count({where: {theme: themeFound.id}});

            if(contents === 0) {
                await Theme.destroy({ where: {
                    id: body.themeId
                }});
                return res.status(200).json({message: 'Theme deleted successfully'});
            }

            logger.error(`#deleteTheme#`, 'Error delete theme. This theme is associate with contents');
            return res.status(500).json({message: 'Cannot delete theme'});


        }
    
        return res.status(500).json({message: 'Theme not found'});

    } catch(err) {
        logger.error(`#deleteTheme#`, `DB return error  -> `, err.message);
        logger.error(`#deleteTheme#`, 'Error delete theme');
        return res.status(500).json({message: 'Error delete theme'});

    }
}

module.exports = {
    createTheme,
    updateTheme,
    getById,
    getList,
    deleteTheme
};