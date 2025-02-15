const ServiceLogger = require("./serviceLogger");
const {
    ENVIRONMENTS,
    LOG_LEVELS,
    LEVEL_COLORS,
    COLORS,
    INIT_ERROR_MESSAGES,
    LOG_LEVELS_PRIORITY,
} = require("./constants");

let initialized = false;
const loggerConfig = {
    currentLogLevel: LOG_LEVELS.LOG,
    loggerMethods: {},
    showTimestamp: true,
    timeStampFormat: "ISO",
};

const getTimestamp = () => {
    switch (loggerConfig.timeStampFormat) {
        case "ISO":
            return new Date().toISOString();
        case "LOCALE":
            return new Date().toLocaleString();
        case "UNIX":
            return new Date().getTime();
        default:
            return new Date().toISOString();
    }
};

const developmentLoggerMethods = {
    [LOG_LEVELS.LOG]: logLog,
    [LOG_LEVELS.INFO]: logInfo,
    [LOG_LEVELS.WARN]: logWarn,
    [LOG_LEVELS.ERROR]: logError,
};

function logLog(...args) {
    console.log(...formatDevelopmentLog(LOG_LEVELS.LOG, args));
}

function logInfo(...args) {
    console.info(...formatDevelopmentLog(LOG_LEVELS.INFO, args));
}

function logWarn(...args) {
    console.warn(...formatDevelopmentLog(LOG_LEVELS.WARN, args));
}

function logError(...args) {
    console.error(...formatDevelopmentLog(LOG_LEVELS.ERROR, args));
}

const formatDevelopmentArgs = (args) => {
    return args.map((arg) => {
        // if (arg instanceof Error) {
        //     return {
        //         message: arg.message,
        //         stack: arg.stack,
        //         name: arg.name,
        //         ...arg,
        //     };
        // }
        return arg;
    });
};

const formatDevelopmentLog = (level, args) => {
    const timestamp = loggerConfig.showTimestamp ?
        `${COLORS.DIM}${getTimestamp()}${COLORS.RESET}` :
        "";
    const levelColor = LEVEL_COLORS[level] || COLORS.BLUE;
    const coloredLevel = `${levelColor}[${level.toUpperCase()}]${COLORS.RESET}`;
    return [timestamp, coloredLevel, ...formatDevelopmentArgs(args)];
};

const init = (options = {}) => {
    if (initialized) {
        throw new Error(INIT_ERROR_MESSAGES.ALREADY_INITIALIZED);
    }

    const {
        environment: optionsEnvironment,
        logLevel,
        apiKey,
        apiEndpoint,
        showTimestamp,
        timeStampFormat,
    } = options;

    const environment =
        optionsEnvironment || process.env.ENVIRONMENT || ENVIRONMENTS.DEVELOPMENT;

    if (![ENVIRONMENTS.DEVELOPMENT, ENVIRONMENTS.PRODUCTION].includes(environment)) {
        throw new Error(INIT_ERROR_MESSAGES.INVALID_ENVIRONMENT);
    }

    if (logLevel) setLogLevel(logLevel);

    if (showTimestamp !== undefined) loggerConfig.showTimestamp = showTimestamp;
    if (timeStampFormat) loggerConfig.timeStampFormat = timeStampFormat;

    if (environment === ENVIRONMENTS.PRODUCTION) {
        if (!apiKey) {
            throw new Error(INIT_ERROR_MESSAGES.MISSING_API_KEY);
        }
        if (!apiEndpoint) {
            throw new Error(INIT_ERROR_MESSAGES.MISSING_API_ENDPOINT);
        }

        ServiceLogger.init(apiKey, apiEndpoint);
        loggerConfig.loggerMethods = ServiceLogger;
    }

    if (environment === ENVIRONMENTS.DEVELOPMENT) {
        loggerConfig.loggerMethods = developmentLoggerMethods;
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

        if (
            LOG_LEVELS_PRIORITY[level] >=
            LOG_LEVELS_PRIORITY[loggerConfig.currentLogLevel]
        ) {
            return loggerConfig.loggerMethods[level](...args);
        }
    };

const validateLogLevel = (level) => {
    if (!Object.values(LOG_LEVELS).includes(level)) {
        throw new Error(INIT_ERROR_MESSAGES.INVALID_LOG_LEVEL);
    }
};

const setLogLevel = (level) => {
    validateLogLevel(level);
    loggerConfig.currentLogLevel = level;
};

const logger = {
    [LOG_LEVELS.LOG]: executeLoggerMethod(LOG_LEVELS.LOG),
    [LOG_LEVELS.INFO]: executeLoggerMethod(LOG_LEVELS.INFO),
    [LOG_LEVELS.WARN]: executeLoggerMethod(LOG_LEVELS.WARN),
    [LOG_LEVELS.ERROR]: executeLoggerMethod(LOG_LEVELS.ERROR),
    setLogLevel,
};

module.exports = { init, logger };