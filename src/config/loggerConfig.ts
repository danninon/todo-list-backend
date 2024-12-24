import log4js from 'log4js';
import config from './default';

const logFilePath = process.env.LOG_FILE_PATH || 'logs/application.log';

log4js.configure({
    appenders: {
        out: {type: 'stdout'},
        app: {type: 'file', filename: logFilePath},
    },
    categories: {
        default: {
            appenders: ['out', 'app'],
            level: config.environment === 'production' ? 'error' : 'debug',
        },
    },
});

export default log4js;