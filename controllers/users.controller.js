const bcrypt = require('bcrypt');
const log4js = require('log4js');
const {Op} = require('sequelize');
const jwt = require('jsonwebtoken');

const logger = log4js.getLogger('Users');

const User = require('../models/user.model');
const Content = require('../models/content.model');
const ContentType = require('../models/contentType.model');

const passwordREGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

/**
 * Metodo para realizar inicio de sesión a partir de un username o correo electronico y contraseña.
 * 
 * Parametros esperados en el body:
 *  - username (String): Username o correo electronico del usuario
 *  - password (String): Contraseña del usuario
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function login(req, res) {
    const body = req.body;

    if(!body.username || !body.password) {
        logger.error(`#login#`, 'Invalid Params', `Body: ${body}`);
        return res.status(422).json({message: 'Invalid Params'});
    }

    try {


        const userFound = await User.findOne({ where: {
            [Op.or]: [
                { username: body.username },
                { email: body.username }
              ]
        }});

        if(userFound) {
            const passwordMatch = bcrypt.compareSync(body.password, userFound.password)


            if(passwordMatch) {
                const tokenSession = jwt.sign({id: userFound.id}, process.env.JWT_SECRET);
                return res.status(200).json({message: 'Login success', object: tokenSession});

            } else {
                logger.error(`#login#`, 'Password not match');
            }

        } else {
            logger.error(`#login#`, 'User not found');
        }
        
        return res.status(500).json({message: 'Username / Password incorrect'});
    

    } catch(err) {
        logger.error(`#login#`, `DB return error  -> `, err.message);
        logger.error(`#login#`, 'User not found');
        return res.status(500).json({message: 'User / Password incorrect'});

    }

}

/**
 * Metodo que genera un registro de un usuario.
 * 
 * Parametros esperados en el body:
 *  - username (String): Username del usuario
 *  - email (String): Correo electronico del usuario
 *  - password (String): Contraseña del usuario
 *  - confirmPassword (String): Contraseña del usuario
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function register(req, res) {
    const body = req.body;

    if(!body.username || !body.email || !body.password || !body.confirmPassword) {
        logger.error(`#register#`, 'Invalid Params', `Body: ${body}`);
        return res.status(422).json({message: 'Invalid Params'});
    }

    if(body.password !== body.confirmPassword) {
        logger.error(`#register#`, 'Passwords not match');
        return res.status(500).json({message: 'Passwords not match'});

    }

    if(!passwordREGEX.test(body.password)) {
        logger.error(`#register#`, 'Password not match with REGEX');
        return res.status(500).json({message: 'Password does not comply with the rules'});
    }

    try {
        await User.create( {
            username: body.username,
            email: body.email,
            password: bcrypt.hashSync(body.password, bcrypt.genSaltSync(8))
        })
    
        return res.status(200).json({message: 'Register Success'});

    } catch(err) {
        logger.error(`#register#`, `DB return error  -> `, err.message);
        logger.error(`#register#`, 'User already exists');
        return res.status(500).json({message: 'User already exists'});

    }

}

/**
 * Metodo para editar un usuario
 * 
 *  * Parametros esperados en el body:
 *      - userId (String): Id del usuario
 *      - rol (String): rol del usuario
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function updateUser(req, res) {
    const body = req.body;

    if(!body.userId || !body.rol) {
        logger.error(`#updateUser#`, 'Invalid Params', `Body: ${body}`);
        return res.status(422).json({message: 'Invalid Params'});
    }

    try {

        if(req.user.rol === 'ADMIN' || req.user.id === body.userId) {
            const userUpdated = await User.update({ rol: body.rol }, {
                where: {
                  id: body.userId
                }
              });
        
            return res.status(200).json({message: 'User update successfully', object: userUpdated.dataValues});

        }

        logger.error(`#updateUser#`, 'Cannot update user. User is not admin or is not herself');
        return res.status(403).json({message: 'Cannot edit user'});


    } catch(err) {
        logger.error(`#updateUser#`, `DB return error  -> `, err.message);
        logger.error(`#updateUser#`, 'Error update user');
        return res.status(500).json({message: 'Error update user'});

    }
}

/**
 * Metodo para obtener usuario por Id
 * 
 *  * Parametros esperados en el body:
 *      - id (String): Id del usuario
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
        const userFound = await User.findOne({ where: {
            id: body.id
        }});

        if(userFound) {
            return res.status(200).json({message: 'User found successfully', object: userFound.dataValues});
        }
    
        return res.status(500).json({message: 'User not found'});

    } catch(err) {
        logger.error(`#register#`, `DB return error  -> `, err.message);
        logger.error(`#register#`, 'User not found');
        return res.status(500).json({message: 'User not found'});

    }
}

/**
 * Metodo que regresa listado de usuarios
 * 
 *  * Parametros esperados en el body:
 *      - filters (Object): Filtros a aplicarse en listado
 *          - search (String): Texto a buscar dentro de campos username y email
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
                    [Op.or]: [
                        { username: { [Op.substring]: body.filters.search }},
                        { email: { [Op.substring]: body.filters.search }}
                      ]
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

        const users = await User.findAll(query);

        if(users) {
            return res.status(200).json({message: 'Users list get successfully', object: users});
        }
    
        return res.status(500).json({message: 'Users not found'});

    } catch(err) {
        logger.error(`#getList#`, `DB return error  -> `, err.message);
        logger.error(`#getList#`, 'Error get list of users');
        return res.status(500).json({message: 'Error get list of users'});

    }
}

/**
 * Metodo para eliminar un usuario
 * 
 *  * Parametros esperados en el body:
 *      - userId (String): Id del usuario
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function deleteUser(req , res) {
    const body = req.body;

    if(!body.userId) {
        logger.error(`#deleteUser#`, 'Invalid Params', `Body: ${body}`);
        return res.status(422).json({message: 'Invalid Params'});
    }

    try {
        const userFound = await User.findOne({ where: {
            id: body.userId
        }});

        if(userFound) {
            const contents = await Content.findAll({where: {creator: userFound.id}});

            if(contents && contents.length > 0) {

                for(const c of contents) {
                    for(const ct of c.contentType) {
                        await ContentType.destroy({where: {id: ct}});
                    }

                    await Content.destroy({where: {id: c.id}});
                }

            }

            await User.destroy({ where: {
                id: body.userId
            }});
            return res.status(200).json({message: 'User deleted successfully'});
        }
    
        return res.status(500).json({message: 'User not found'});

    } catch(err) {
        logger.error(`#deleteUser#`, `DB return error  -> `, err.message);
        logger.error(`#deleteUser#`, 'Error delete user');
        return res.status(500).json({message: 'Error delete user'});

    }
}

module.exports = {
    login,
    register,
    updateUser,
    getById,
    getList,
    deleteUser
};