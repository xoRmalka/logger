const ServiceLogger = require("./serviceLogger");
const {
    ENVIRONMENTS,
    LOG_LEVELS,
    INIT_ERROR_MESSAGES,
    LOG_LEVELS_PRIORITY,
    LOG_FORMATS,
    DEFAULT_LOGGER_CONFIG,
} = require("./constants");

const {
    getTimestamp,
    isBoolean,
    isString,
    colorizeLogParts,
    formatJsonLog,
    formatTextLog,
    formatError,
    getExecutionTime,
    validateLogLevel,
} = require("./utils/utils");

let initialized = false;
let loggerConfig = {
    ...DEFAULT_LOGGER_CONFIG,
    startTime: process.hrtime.bigint(),
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

const formatDevelopmentLog = (level, args) => {
    const timestamp = loggerConfig.showTimestamp ?
        getTimestamp(loggerConfig.timeStampFormat) :
        undefined;

    const formattedArgs = formatLogArguments(args);
    return formatLogOutput(timestamp, level, formattedArgs);
};

const formatLogArguments = (args) => {
    const formattedArgs = args.map((arg) => {
        if (arg instanceof Error) {
            return formatError(
                arg,
                loggerConfig.showErrorStack,
                loggerConfig.logFormat
            );
        }
        return arg;
    });

    if (loggerConfig.showExecutionTime) {
        formattedArgs.push({ executionTime: getExecutionTime(loggerConfig.startTime) });
    }

    return formattedArgs;
};

const formatLogOutput = (timestamp, level, args) => {
    switch (loggerConfig.logFormat) {
        case LOG_FORMATS.JSON:
            return formatJsonLog(timestamp, level, args);
        case LOG_FORMATS.TEXT:
            return formatTextLog(
                timestamp,
                level,
                args,
                loggerConfig.colorizeLogs
            );
        case LOG_FORMATS.RAW:
        default:
            return loggerConfig.colorizeLogs ?
                colorizeLogParts(timestamp, level, args) : [timestamp, `[${level.toUpperCase()}]`, ...args];
    }
};

const init = (options = {}) => {
    if (initialized) {
        console.warn(INIT_ERROR_MESSAGES.ALREADY_INITIALIZED);
        return false;
    }

    const {
        environment: optionsEnvironment,
        logLevel,
        apiKey,
        apiEndpoint,
        showTimestamp,
        timeStampFormat,
        colorizeLogs,
        logFormat,
        showErrorStack,
        showExecutionTime,
    } = options;

    const environment =
        optionsEnvironment || process.env.LOGGER_ENV || process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT;

    if (![ENVIRONMENTS.DEVELOPMENT, ENVIRONMENTS.PRODUCTION].includes(environment)) {
        console.warn(INIT_ERROR_MESSAGES.INVALID_ENVIRONMENT);
        return false;
    }

    if (logLevel) setLogLevel(logLevel);

    if (isBoolean(showTimestamp)) loggerConfig.showTimestamp = showTimestamp;
    if (isString(timeStampFormat)) loggerConfig.timeStampFormat = timeStampFormat;
    if (isBoolean(colorizeLogs)) loggerConfig.colorizeLogs = colorizeLogs;
    if (isString(logFormat)) loggerConfig.logFormat = logFormat;
    if (isBoolean(showErrorStack)) loggerConfig.showErrorStack = showErrorStack;
    if (isBoolean(showExecutionTime)) loggerConfig.showExecutionTime = showExecutionTime;

    if (environment === ENVIRONMENTS.PRODUCTION) {
        if (!apiKey) {
            console.warn(INIT_ERROR_MESSAGES.MISSING_API_KEY);
            resetLogger();
            return false;
        }
        if (!apiEndpoint) {
            console.warn(INIT_ERROR_MESSAGES.MISSING_API_ENDPOINT);
            resetLogger();
            return false;
        }

        ServiceLogger.init(apiKey, apiEndpoint);
        loggerConfig.loggerMethods = ServiceLogger;
    }

    if (environment === ENVIRONMENTS.DEVELOPMENT) {
        loggerConfig.loggerMethods = developmentLoggerMethods;

        if (logFormat === LOG_FORMATS.JSON && colorizeLogs) {
            loggerConfig.colorizeLogs = false;
            console.warn(INIT_ERROR_MESSAGES.JSON_AND_COLORIZE_LOGS);
        }
    }

    initialized = true;
    return true;
};

const executeLoggerMethod =
    (level) =>
    (...args) => {
        if (!initialized) {
            console.warn(INIT_ERROR_MESSAGES.NOT_INITIALIZED);
            return;
        }

        if (
            LOG_LEVELS_PRIORITY[level] >=
            LOG_LEVELS_PRIORITY[loggerConfig.currentLogLevel]
        ) {
            return loggerConfig.loggerMethods[level](...args);
        }
    };

const setLogLevel = (level) => {
    loggerConfig.currentLogLevel = validateLogLevel(level);
};

const resetLogger = () => {
    initialized = false;
    loggerConfig = {...DEFAULT_LOGGER_CONFIG, startTime: loggerConfig.startTime };
};

const logger = {
    [LOG_LEVELS.LOG]: executeLoggerMethod(LOG_LEVELS.LOG),
    [LOG_LEVELS.INFO]: executeLoggerMethod(LOG_LEVELS.INFO),
    [LOG_LEVELS.WARN]: executeLoggerMethod(LOG_LEVELS.WARN),
    [LOG_LEVELS.ERROR]: executeLoggerMethod(LOG_LEVELS.ERROR),
    setLogLevel,
    resetLogger,
};

module.exports = { init, logger };