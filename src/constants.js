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

const LOG_LEVELS_PRIORITY = {
    [LOG_LEVELS.LOG]: 0,
    [LOG_LEVELS.INFO]: 1,
    [LOG_LEVELS.WARN]: 2,
    [LOG_LEVELS.ERROR]: 3,
};
Object.freeze(LOG_LEVELS_PRIORITY);

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
    MISSING_API_ENDPOINT: "API endpoint is required in production environment",
    INVALID_ENVIRONMENT: "Invalid environment. Must be 'development' or 'production'.",
    INVALID_LOG_LEVEL: "Invalid log level. Must be one of the following: 'log', 'info', 'warn', 'error'.",
};

const TIMESTAMP_FORMATS = {
    ISO: "ISO",
    LOCALE: "LOCALE",
    UNIX: "UNIX",
    INVALID: "INVALID",
};
Object.freeze(TIMESTAMP_FORMATS);

const LOG_FORMATS = {
    RAW: "raw",
    JSON: "json",
    TEXT: "text",
};
Object.freeze(LOG_FORMATS);

const VARIABLE_TYPES = {
    STRING: "string",
    NUMBER: "number",
    BOOLEAN: "boolean",
    OBJECT: "object",
};
Object.freeze(VARIABLE_TYPES);

module.exports = {
    ENVIRONMENTS,
    LOG_LEVELS,
    LOG_LEVELS_PRIORITY,
    COLORS,
    LEVEL_COLORS,
    INIT_ERROR_MESSAGES,
    TIMESTAMP_FORMATS,
    LOG_FORMATS,
    VARIABLE_TYPES,
};