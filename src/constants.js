const ENVIRONMENTS = {
    DEVELOPMENT: "development",
    PRODUCTION: "production",
};
Object.freeze(ENVIRONMENTS);

const LOG_LEVELS = {
    LOG: "log",
    INFO: "info",
    WARN: "warn",
    ERROR: "error",
};
Object.freeze(LOG_LEVELS);

const COLORS = {
    RESET: "\x1b[0m",
    DIM: "\x1b[2m",
    BLUE: "\x1b[34m",
    CYAN: "\x1b[36m",
    YELLOW: "\x1b[33m",
    RED: "\x1b[31m",
};

const LEVEL_COLORS = {
    [LOG_LEVELS.LOG]: COLORS.BLUE,
    [LOG_LEVELS.INFO]: COLORS.CYAN,
    [LOG_LEVELS.WARN]: COLORS.YELLOW,
    [LOG_LEVELS.ERROR]: COLORS.RED,
};

const INIT_ERROR_MESSAGES = {
    ALREADY_INITIALIZED: "Logger has already been initialized",
    NOT_INITIALIZED: "Logger must be initialized before use. Call init() first.",
    MISSING_API_KEY: "API key is required in production environment",
    INVALID_ENVIRONMENT: "Invalid environment. Must be 'development' or 'production'.",
};

module.exports = {
    ENVIRONMENTS,
    LOG_LEVELS,
    COLORS,
    LEVEL_COLORS,
    INIT_ERROR_MESSAGES,
};