const log4js = require('log4js');
const {Op} = require('sequelize');

const logger = log4js.getLogger('Categories');

const Category = require('../models/category.model');
const Theme = require('../models/theme.model');

/**
 * Metodo que genera un registro de una categoria.
 * 
 * Parametros esperados en el body:
 *      - name (String): Nombre de la categoria
 *      - allowTypes (Array<String>): Tipo de archivos que permite
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function createCategory(req, res) {
    const body = req.body;

    if(!body.name || !body.allowTypes) {
        logger.error(`#createCategory#`, 'Invalid Params', `Body: ${body}`);
        return res.status(422).json({message: 'Invalid Params'});
    }

    try {
        await Category.create({ name: body.name, allowTypes: body.allowTypes });
    
        return res.status(200).json({message: 'Category create successfully'});

    } catch(err) {
        logger.error(`#createCategory#`, `DB return error  -> `, err.message);
        logger.error(`#createCategory#`, 'Error create category');
        return res.status(500).json({message: 'Error create category'});

    }
}

/**
 * Metodo para editar una categoria
 * 
 *  * Parametros esperados en el body:
 *      - categoryId (String): Id de la categoria
 *      - name (String): Nombre de la categoria
 *      - allowTypes (Array<String>): Tipo de archivos que permite
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function updateCategory(req, res) {
    const body = req.body;

    if(!body.categoryId || !body.name || !body.allowTypes) {
        logger.error(`#updateCategory#`, 'Invalid Params', `Body: ${body}`);
        return res.status(422).json({message: 'Invalid Params'});
    }

    try {
        const categoryUpdated = await Category.update({ name: body.name, allowTypes: body.allowTypes }, {
            where: {
              id: body.categoryId
            }
          });
    
        return res.status(200).json({message: 'Category update successfully', object: categoryUpdated.dataValues});

    } catch(err) {
        logger.error(`#updateCategory#`, `DB return error  -> `, err.message);
        logger.error(`#updateCategory#`, 'Error update category');
        return res.status(500).json({message: 'Error update category'});

    }
}

/**
 * Metodo para obtener categoria por Id
 * 
 *  * Parametros esperados en el body:
 *      - id (String): Id de la categoria
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
        const categoryFound = await Category.findOne({ where: {
            id: body.id
        }});

        if(categoryFound) {
            return res.status(200).json({message: 'Category found successfully', object: categoryFound.dataValues});
        }
    
        return res.status(500).json({message: 'Category not found'});

    } catch(err) {
        logger.error(`#register#`, `DB return error  -> `, err.message);
        logger.error(`#register#`, 'Category not found');
        return res.status(500).json({message: 'Category not found'});

    }
}

/**
 * Metodo que regresa listado de categorias
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

        const categories = await Category.findAll(query);

        if(categories) {
            return res.status(200).json({message: 'Categories list get successfully', object: categories});
        }
    
        return res.status(500).json({message: 'Categories not found'});

    } catch(err) {
        logger.error(`#getList#`, `DB return error  -> `, err.message);
        logger.error(`#getList#`, 'Error get list of categories');
        return res.status(500).json({message: 'Error get list of categories'});

    }
}

/**
 * Metodo para eliminar una categoria
 * 
 *  * Parametros esperados en el body:
 *      - categoryId (String): Id de la categoria
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function deleteCategory(req , res) {
    const body = req.body;

    if(!body.categoryId) {
        logger.error(`#deleteCategory#`, 'Invalid Params', `Body: ${body}`);
        return res.status(422).json({message: 'Invalid Params'});
    }

    try {
        const categoryFound = await Category.findOne({ where: {
            id: body.categoryId
        }});

        if(categoryFound) {

            const contents = await Theme.count({where: {categories: {[Op.in]: categoryFound.id}}});

            if(contents === 0) {
                await Category.destroy({ where: {
                    id: body.categoryId
                }});
                return res.status(200).json({message: 'Category deleted successfully'});
            }

            logger.error(`#deleteCategory#`, 'Error delete category. This categoriy is associate with themes');
            return res.status(500).json({message: 'Cannot delete category'});

        }
    
        return res.status(500).json({message: 'Category not found'});

    } catch(err) {
        logger.error(`#deleteCategory#`, `DB return error  -> `, err.message);
        logger.error(`#deleteCategory#`, 'Error delete category');
        return res.status(500).json({message: 'Error delete category'});

    }
}

module.exports = {
    createCategory,
    updateCategory,
    getById,
    getList,
    deleteCategory
};