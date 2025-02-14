const ServiceLogger = require("./serviceLogger");
const {
    ENVIRONMENTS,
    LOG_LEVELS,
    LEVEL_COLORS,
    COLORS,
    INIT_ERROR_MESSAGES,
} = require("./constants");

let environment = ENVIRONMENTS.DEVELOPMENT;
let initialized = false;
let loggerMethods = {};

const getTimestamp = () => new Date().toISOString();

const developmentLoggerMethods = {
    [LOG_LEVELS.LOG]: (...args) =>
        console.log(...formatDevelopmentLog(LOG_LEVELS.LOG, args)),
    [LOG_LEVELS.INFO]: (...args) =>
        console.info(...formatDevelopmentLog(LOG_LEVELS.INFO, args)),
    [LOG_LEVELS.WARN]: (...args) =>
        console.warn(...formatDevelopmentLog(LOG_LEVELS.WARN, args)),
    [LOG_LEVELS.ERROR]: (...args) =>
        console.error(...formatDevelopmentLog(LOG_LEVELS.ERROR, args)),
};

const formatDevelopmentLog = (level, args) => {
    const timestamp = `${COLORS.DIM}${getTimestamp()}${COLORS.RESET}`;

    const levelColor = LEVEL_COLORS[level] || COLORS.BLUE;
    const coloredLevel = `${levelColor}[${level.toUpperCase()}]${COLORS.RESET}`;

    return [timestamp, coloredLevel, ...args];
};

const init = (options = {}) => {
    if (initialized) {
        throw new Error(INIT_ERROR_MESSAGES.ALREADY_INITIALIZED);
    }

    environment = process.env.ENVIRONMENT || ENVIRONMENTS.DEVELOPMENT;

    if (![ENVIRONMENTS.DEVELOPMENT, ENVIRONMENTS.PRODUCTION].includes(environment)) {
        throw new Error(INIT_ERROR_MESSAGES.INVALID_ENVIRONMENT);
    }

    if (environment === ENVIRONMENTS.PRODUCTION) {
        if (!options.apiKey) {
            throw new Error(INIT_ERROR_MESSAGES.MISSING_API_KEY);
        }
        ServiceLogger.init(options.apiKey);
        loggerMethods = ServiceLogger;
    }

    if (environment === ENVIRONMENTS.DEVELOPMENT) {
        loggerMethods = developmentLoggerMethods;
    }

    initialized = true;
    return true;
};

const executeLoggerMethod =
    (level) =>
    (...args) => {
        if (!initialized) {
            throw new Error(INIT_ERROR_MESSAGES.NOT_INITIALIZED);
        }
        return loggerMethods[level](...args);
    };

const logger = {
    [LOG_LEVELS.LOG]: executeLoggerMethod(LOG_LEVELS.LOG),
    [LOG_LEVELS.INFO]: executeLoggerMethod(LOG_LEVELS.INFO),
    [LOG_LEVELS.WARN]: executeLoggerMethod(LOG_LEVELS.WARN),
    [LOG_LEVELS.ERROR]: executeLoggerMethod(LOG_LEVELS.ERROR),
};

module.exports = { init, logger };