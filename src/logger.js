const ServiceLogger = require("./serviceLogger");
const {
    ENVIRONMENTS,
    LOG_LEVELS,
    INIT_ERROR_MESSAGES,
    TIMESTAMP_FORMATS,
    LOG_LEVELS_PRIORITY,
    LOG_FORMATS,
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
} = require("./utils/utils");

let initialized = false;
const loggerConfig = {
    currentLogLevel: LOG_LEVELS.LOG,
    loggerMethods: {},
    showTimestamp: true,
    timeStampFormat: TIMESTAMP_FORMATS.ISO,
    colorizeLogs: true,
    logFormat: LOG_FORMATS.RAW,
    showStackTrace: false,
    startTime: process.hrtime.bigint(),
    showExecutionTime: false,
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

    if (loggerConfig.showExecutionTime) {
        args.push({ executionTime: getExecutionTime(loggerConfig.startTime) });
    }

    const argsWithFormattedErrors = args.map((arg) => {
        if (arg instanceof Error) {
            return formatError(
                arg,
                loggerConfig.showStackTrace,
                loggerConfig.logFormat
            );
        }
        return arg;
    });

    switch (loggerConfig.logFormat) {
        case LOG_FORMATS.JSON:
            return formatJsonLog(timestamp, level, argsWithFormattedErrors);

        case LOG_FORMATS.TEXT:
            return formatTextLog(
                timestamp,
                level,
                argsWithFormattedErrors,
                loggerConfig.colorizeLogs
            );
            // TODO: Maybe implement RAW format or throw an error if it's not supported
        default: // RAW format
            return loggerConfig.colorizeLogs ?
                colorizeLogParts(timestamp, level, argsWithFormattedErrors) :
                [timestamp, `[${level.toUpperCase()}]`, ...argsWithFormattedErrors];
    }
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
        colorizeLogs,
        logFormat,
        showStackTrace,
        showExecutionTime,
    } = options;

    const environment =
        optionsEnvironment || process.env.ENVIRONMENT || ENVIRONMENTS.DEVELOPMENT;

    if (![ENVIRONMENTS.DEVELOPMENT, ENVIRONMENTS.PRODUCTION].includes(environment)) {
        throw new Error(INIT_ERROR_MESSAGES.INVALID_ENVIRONMENT);
    }

    if (logLevel) setLogLevel(logLevel);

    if (isBoolean(showTimestamp)) loggerConfig.showTimestamp = showTimestamp;
    if (isString(timeStampFormat)) loggerConfig.timeStampFormat = timeStampFormat;
    if (isBoolean(colorizeLogs)) loggerConfig.colorizeLogs = colorizeLogs;
    if (isString(logFormat)) loggerConfig.logFormat = logFormat;
    if (isBoolean(showStackTrace)) loggerConfig.showStackTrace = showStackTrace;
    if (isBoolean(showExecutionTime))
        loggerConfig.showExecutionTime = showExecutionTime;

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
        // TODO: Maybe throw an error instead of warning
        if (logFormat === LOG_FORMATS.JSON && colorizeLogs) {
            loggerConfig.colorizeLogs = false;
            console.warn(
                "Color logs are automatically disabled when using JSON format."
            );
        }
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

const resetLogger = () => {
    initialized = false;
    loggerConfig.currentLogLevel = LOG_LEVELS.LOG;
    loggerConfig.loggerMethods = {};
    loggerConfig.showTimestamp = true;
    loggerConfig.timeStampFormat = TIMESTAMP_FORMATS.ISO;
    loggerConfig.colorizeLogs = true;
    loggerConfig.logFormat = LOG_FORMATS.RAW;
    loggerConfig.showStackTrace = false;
    loggerConfig.showExecutionTime = false;
};

const logger = {
    [LOG_LEVELS.LOG]: executeLoggerMethod(LOG_LEVELS.LOG),
    [LOG_LEVELS.INFO]: executeLoggerMethod(LOG_LEVELS.INFO),
    [LOG_LEVELS.WARN]: executeLoggerMethod(LOG_LEVELS.WARN),
    [LOG_LEVELS.ERROR]: executeLoggerMethod(LOG_LEVELS.ERROR),
    setLogLevel,
};

module.exports = { init, logger, resetLogger };