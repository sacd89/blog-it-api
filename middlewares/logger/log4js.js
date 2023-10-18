const log4js = require('log4js');

function initLog(req, res, next) {
    if (
        process.env.npm_command === 'test' ||
        req.originalUrl === '/' ||
        req.originalUrl === '/favicon.ico' ||
        req.originalUrl === '/images/favicon.ico' ||
        req.originalUrl.indexOf('/status') === 0
    ) {
        next();
    } else {
        log4js.connectLogger(log4js.getLogger('request'), {
            level: log4js.levels.INFO.levelStr,
            format: `:remote-addr - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"`,
            statusRules: [
                { from: 200, to: 299, level: 'info' },
                { from: 300, to: 499, level: 'warn' },
                { from: 500, to: 599, level: 'error' }
            ]
        })(req, res, next);
    }
}

module.exports = {
    initLog
};
