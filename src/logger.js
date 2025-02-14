const ServiceLogger = require("./serviceLogger");
const {
    ENVIRONMENTS,
    LOGGER_METHODS_NAMES,
    COLORS,
    INIT_ERROR_MESSAGES,
} = require("./constants");

let environment = ENVIRONMENTS.DEVELOPMENT;
let initialized = false;
let loggerMethods = {};

const getTimestamp = () => new Date().toISOString();

const getStackTrace = () => {
    const stack = new Error().stack.split("\n").slice(5).join("\n");
    return stack;
};

const formatArgs = (args) => {
    return args.map((arg) =>
        arg instanceof Error ?
        { message: arg.message, stack: arg.stack, name: arg.name } :
        arg
    );
};

const formatDevelopmentLog = (level, args) => {
    const timestamp = getTimestamp();
    const formattedArgs = formatArgs(args);

    const levelColors = {
        log: COLORS.BLUE,
        info: COLORS.CYAN,
        warn: COLORS.YELLOW,
        error: COLORS.RED,
    };

    const output = [
        `${COLORS.DIM}${timestamp}${COLORS.RESET}`,
        `${levelColors[level] || COLORS.BLUE}[${level.toUpperCase()}]${
      COLORS.RESET
    }`,
        ...formattedArgs,
    ];

    if (level === "error" || level === "warn") {
        output.push(`\n${COLORS.DIM}${getStackTrace()}${COLORS.RESET}`);
    }

    return output;
};

const developmentLoggerMethods = {
    [LOGGER_METHODS_NAMES.LOG]: (...args) =>
        console.log(...formatDevelopmentLog(LOGGER_METHODS_NAMES.LOG, args)),
    [LOGGER_METHODS_NAMES.INFO]: (...args) =>
        console.info(...formatDevelopmentLog(LOGGER_METHODS_NAMES.INFO, args)),
    [LOGGER_METHODS_NAMES.WARN]: (...args) =>
        console.warn(...formatDevelopmentLog(LOGGER_METHODS_NAMES.WARN, args)),
    [LOGGER_METHODS_NAMES.ERROR]: (...args) =>
        console.error(...formatDevelopmentLog(LOGGER_METHODS_NAMES.ERROR, args)),
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

const createLoggerMethod =
    (level) =>
    (...args) => {
        if (!initialized) {
            throw new Error(INIT_ERROR_MESSAGES.NOT_INITIALIZED);
        }
        return loggerMethods[level](...args);
    };

const logger = {
    [LOGGER_METHODS_NAMES.LOG]: createLoggerMethod(LOGGER_METHODS_NAMES.LOG),
    [LOGGER_METHODS_NAMES.INFO]: createLoggerMethod(LOGGER_METHODS_NAMES.INFO),
    [LOGGER_METHODS_NAMES.WARN]: createLoggerMethod(LOGGER_METHODS_NAMES.WARN),
    [LOGGER_METHODS_NAMES.ERROR]: createLoggerMethod(LOGGER_METHODS_NAMES.ERROR),
};

module.exports = { init, logger };