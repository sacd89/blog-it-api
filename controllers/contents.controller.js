const log4js = require('log4js');
const {Op} = require('sequelize');

const logger = log4js.getLogger('Contents');

const Content = require('../models/content.model');
const Category = require('../models/category.model');
const ContentType = require('../models/contentType.model');
const Theme = require('../models/theme.model');
const User = require('../models/user.model');

/**
 * Metodo que verifica que el parametro data dentro del body cumpla con los parametros esperados.
 * 
 * @param {*} data (Array<ContentType>): Contenido a mostrar
 *          - category (String): Id de tipo de contenido
 *          - data (String): Valor del contenido
 * 
 * @returns true si cumple con parametros. false si no cumple con parametros.
 */
function _checkData(data) {
    let hasError = 0;
    if(data && data.length > 0) {
        for(const d of data) {
            if(!d.category || !d.data) {
                hasError++;
            }
        }
    }

    return hasError === 0;
}

/**
 * Metodo que genera un registro de un contenido.
 * 
 * Parametros esperados en el body:
 *      - title (String): Titulo de contenido
 *      - description (String): Descripcion de contenido
 *      - image (String): BASE64 de portada
 *      - theme (String): Id de tematica
 *      - data (Array<ContentType>): Contenido a mostrar
 *          - category (String): Id de tipo de contenido
 *          - data (String): Valor del contenido
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function createContent(req, res) {
    const body = req.body;

    if(!body.title || !body.description || !body.image || !body.theme || !_checkData(body.data)) {
        logger.error(`#createContent#`, 'Invalid Params', `Body: ${JSON.stringify(body)}`);
        return res.status(422).json({message: 'Invalid Params'});
    }

    try {

        const theme = await Theme.findOne({where: {id: body.theme}});

        if(theme) {
            const categoriesData = body.data.map(d => +d.category);

            const contains = theme.categories.some(element => {
                return categoriesData.includes(element);
              });

            if(contains) {
                

                const newContent = await Content.create({
                    title: body.title,
                    description: body.description,
                    image: body.image,
                    creator: req.user.id,
                    theme: theme.id
                })

                let contentTypes = [];

                for(const data of body.data) {
                    const newContentType = await ContentType.create({
                        content: newContent.id,
                        category: data.category,
                        data: data.data
                    });

                    contentTypes.push(newContentType.id);
                }


                await Content.update({contentType: contentTypes}, {where: {id: newContent.id}});

                return res.status(200).json({message: 'Content created successfully'});


            } else {
                logger.error(`#createContent#`, `Some categories are not allow`, categoriesData);
                return res.status(500).json({message: 'Error create content'});

            }
        }

        logger.error(`#createContent#`, `Theme not found`, body.theme);
        return res.status(500).json({message: 'Error create content'});

    } catch(err) {
        logger.error(`#createContent#`, `DB return error  -> `, err.message);
        logger.error(`#createContent#`, 'Error create content');
        return res.status(500).json({message: 'Error create content'});

    }
}

/**
 * Metodo que revisa y elimina en caso de ser necesario los contentTypes dentro de un Content.
 * 
 * @param {*} contentTypes (Array<Integer>) ContentTypes que se guardaran dentro de content
 * @param {*} content (String) Id de contenido
 */
async function _checkContentTypes(contentTypes, content) {
    const contentTypesSavedFounds = await ContentType.findAll({where: {content: content}});

    const contentTypesIds = contentTypesSavedFounds.map(c => c.id);

    for(const ctI of contentTypesIds) {
        const isActual = contentTypes.includes(ctI);
        if(!isActual) {
            await ContentType.destroy({where: {id: ctI}});
        }
    }

}

/**
 * Metodo para editar un contenido.
 * 
 * En este metodo en caso de ser necesario se hace borrado de ContentTypes.
 * 
 * Parametros esperados en el body:
 *      - contentId (String): Id de contenido
 *      - title (String): Titulo de contenido
 *      - description (String): Descripcion de contenido
 *      - image (String): BASE64 de portada
 *      - theme (String): Id de tematica
 *      - data (Array<ContentType>): Contenido a mostrar
 *          - category (String): Id de tipo de contenido
 *          - data (String): Valor del contenido
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function updateContent(req, res) {
    const body = req.body;

    if(!body.contentId || !body.title || !body.description || !body.image || !body.theme || !_checkData(body.data)) {
        logger.error(`#updateContent#`, 'Invalid Params', `Body: ${JSON.stringify(body)}`);
        return res.status(422).json({message: 'Invalid Params'});
    }

    try {
        const contentFound = await Content.findOne({where: {id: body.contentId}});
    
        if(contentFound) {

            if(contentFound.creator !== req.user.id) {
                logger.error(`#updateContent#`, `This content not belongs to user in session. Cannot edit`, `Creator: ${contentFound.creator}`, `User in session: ${req.user.id}`);
                return res.status(403).json({message: 'Cannot edit content'});
            }

            const theme = await Theme.findOne({where: {id: body.theme}});
        
                if(theme) {
                    const categoriesData = body.data.map(d => +d.category);
        
                    const contains = theme.categories.some(element => {
                        return categoriesData.includes(element);
                      });
        
                    if(contains) {

                        let contentTypesFounds = [];
                        
                        for(const data of body.data) {
                            if(data.id) {
                                await ContentType.update({category: data.category, data: data.data}, {where: {id: data.id}});
                                contentTypesFounds.push(data.id);
                            } else {
                                const newContentType = await ContentType.create({
                                    content: contentFound.id,
                                    category: data.category,
                                    data: data.data
                                });

                                contentTypesFounds.push(newContentType.id);
                            }
                        }

                        await _checkContentTypes(contentTypesFounds.map(c => +c), contentFound.id);
        
        
                        await Content.update({contentType: contentTypesFounds, title: body.title, description: body.description, image: body.image, theme: body.theme},
                            {where: {id: contentFound.id}});
        
                        return res.status(200).json({message: 'Content updated successfully'});
        
        
                    } else {
                        logger.error(`#updateContent#`, `Some categories are not allow`, categoriesData);
                        return res.status(500).json({message: 'Error update content'});
        
                    }
                }
    
                logger.error(`#updateContent#`, `Theme not found`, body.theme);
        }
    
            
        logger.error(`#updateContent#`, `Content not found`, body.theme);
        return res.status(500).json({message: 'Error update content'});

    } catch(err) {
        logger.error(`#updateContent#`, `DB return error  -> `, err.message);
        logger.error(`#updateContent#`, 'Error update content');
        return res.status(500).json({message: 'Error update content'});
    }

}

/**
 * Metodo para obtener contenido por Id
 * 
 *  * Parametros esperados en el body:
 *      - id (String): Id del contenido
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
        const contentFound = await Content.findOne({where: {
            id: body.id
        }});

        if(contentFound) {

            const allContentTypes = await ContentType.findAll({where: {id: {[Op.in]: contentFound.contentType}}});
            const theme = await Theme.findOne({attributes: [
                'id', 'name'
             ], where: {id: contentFound.theme}});
            const creator = await User.findOne({attributes: [
                'id', 'username', 'email'
             ], where: {id: contentFound.creator}});

            if(allContentTypes && theme && creator) {


                for(const d of allContentTypes) {
                    const categoryFull = await Category.findOne({attributes: [
                        'id', 'name', 'allowTypes'
                     ], where: {id: d.category}});
                    d.category = categoryFull.dataValues;
                }

                contentFound.contentType = [...allContentTypes];
                contentFound.theme = theme;
                contentFound.creator = creator;
                return res.status(200).json({message: 'Content found successfully', object: contentFound});
            } else {
                logger.error(`#getById#`, 'Error getting categories');

            }

        }
    
        return res.status(500).json({message: 'Content not found'});

    } catch(err) {
        logger.error(`#getById#`, `DB return error  -> `, err);
        logger.error(`#getById#`, 'Content not found');
        return res.status(500).json({message: 'Content not found'});

    }
}

/**
 * Metodo que regresa listado de contenidos
 * 
 *  * Parametros esperados en el body:
 *      - filters (Object): Filtros a aplicarse en listado
 *          - search (String): Texto a buscar dentro del campo title
 *          - sort (Object): Filtro para ordenar por campo y por tipo de orden
 *              - field (String): Campo por el cual se va a ordenar
 *              - order (String): Tipo de orden (ASC, DESC)
 *         - field (Object): Filtro para traer listado filtrando por campo especifico y valor especifico
 *              - name (String): Nombre del campo
 *              - value (String): Valor del campo
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
                    title: { [Op.substring]: body.filters.search }
                }

            }

            if(body.filters.field) {
                if(body.filters.field.name && body.filters.field.value) {
                    if(query.where) {
                        query.where[body.filters.field.name] = body.filters.field.value
                    } else {
                        query.where = {};
                        query.where[body.filters.field.name] = body.filters.field.value
                    }

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

        const contents = await Content.findAll(query);

        if(contents) {
            return res.status(200).json({message: 'Contents list get successfully', object: contents});
        }
    
        return res.status(500).json({message: 'Contents not found'});

    } catch(err) {
        logger.error(`#getList#`, `DB return error  -> `, err);
        logger.error(`#getList#`, 'Error get list of contents');
        return res.status(500).json({message: 'Error get list of contents'});

    }
}

/**
 * Metodo para eliminar un contenido
 * 
 *  * Parametros esperados en el body:
 *      - contentId (String): Id del contenido
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function deleteContent(req , res) {
    const body = req.body;

    if(!body.contentId) {
        logger.error(`#deleteContent#`, 'Invalid Params', `Body: ${body}`);
        return res.status(422).json({message: 'Invalid Params'});
    }

    try {

        const contentFound = await Content.findOne({where: {id: body.contentId}});

        if(req.user.rol === 'ADMIN' || (contentFound.creator === req.user.id)) {
            await Content.destroy({ where: {
                id: body.contentId
            }});
            return res.status(200).json({message: 'Content deleted successfully'});

        }


        logger.error(`#deleteContent#`, 'Cannot delete content. User is not ADMIN or creator of content');
        return res.status(500).json({message: 'Cannot delete content'});

    } catch(err) {
        logger.error(`#deleteContent#`, `DB return error  -> `, err.message);
        logger.error(`#deleteContent#`, 'Error delete content');
        return res.status(500).json({message: 'Error delete content'});

    }
}

module.exports = {
    createContent,
    updateContent,
    getById,
    getList,
    deleteContent
};