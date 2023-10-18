const jwt = require('jsonwebtoken');
const log4js = require('log4js');

const logger = log4js.getLogger('SecurityMiddleware');
const User = require("../models/user.model");

async function checkSession(req, res, next) {
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if(typeof token !== 'undefined') {
        const bearer = token.split(' ');
        const bearerToken = bearer[1];
        token = bearerToken;

        try {
            const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    
            if(decoded) {
                const user = await User.findOne({where: {id: decoded.id}});
                
                if(user) {
                    req.user = user;
                    return next();
                }
            }
            
            return res.status(403).json({message: 'Not valid session'});

        } catch(err) {
            logger.error('#checkSession#', 'Error JWT', err.message);
            return res.status(403).json({message: 'Not valid session'});

        }

    } else {
        return res.status(403).json({message: 'Not valid session'});
    }
    
}

function checkRol(rols) {
    return async function (req, res, next) {
        if(rols.includes(req.user.rol)) {
            return next();
        } 
        logger.error('#checkRol#', 'User try to access', `Rols: ${rols}, User: ${req.user.id}`);
        return res.status(403).json({message: 'No access'});
    }

}

module.exports = {
    checkSession,
    checkRol
}