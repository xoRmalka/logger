const {
    TIMESTAMP_FORMATS,
    COLORS,
    LEVEL_COLORS,
    VARIABLE_TYPES,
    LOG_FORMATS,
    LOG_LEVELS,
} = require("../constants");

const isBoolean = (value) => typeof value === VARIABLE_TYPES.BOOLEAN;
const isString = (value) => typeof value === VARIABLE_TYPES.STRING;

const getTimestamp = (timeStampFormat) => {
    switch (timeStampFormat) {
        case TIMESTAMP_FORMATS.ISO:
            return new Date().toISOString();
        case TIMESTAMP_FORMATS.LOCALE:
            return new Date().toLocaleString();
        case TIMESTAMP_FORMATS.UNIX:
            return new Date().getTime();
        default:
            return new Date().toISOString();
    }
};

const getExecutionTime = (startTime) => {
    const endTime = process.hrtime.bigint();
    const executionTime = Number(endTime - startTime) / 1000000;
    return `${executionTime.toFixed(2)}ms`;
};

const colorize = (text, color) => {
    if (!text) return "";
    return `${color}${text}${COLORS.RESET}`;
};

const colorizeLogParts = (timestamp, level, args) => {
    const coloredTimestamp = colorize(timestamp, COLORS.DIM);
    const levelColor = LEVEL_COLORS[level] || COLORS.BLUE;
    const coloredLevel = colorize(`[${level.toUpperCase()}]`, levelColor);
    return [coloredTimestamp, coloredLevel, ...args];
};

const formatJsonLog = (timestamp, level, args) => {
    const logEntry = {
        timestamp: timestamp || undefined,
        level: level.toUpperCase(),
        data: args.length === 1 ? args[0] : args,
    };

    return [JSON.stringify(logEntry)];
};

const formatTextLog = (timestamp, level, args, useColors) => {
    const formattedArgs = args.map((arg) => {
        if (typeof arg === VARIABLE_TYPES.OBJECT && arg !== null) {
            return JSON.stringify(arg, null, 2);
        }
        return arg;
    });

    return useColors ?
        colorizeLogParts(timestamp, level, formattedArgs) :
        [timestamp, `[${level.toUpperCase()}]`, ...formattedArgs];
};

const formatError = (error, showStackTrace, logFormat) => {
    if (!(error instanceof Error)) return error;

    if (!showStackTrace) {
        const { stack, ...errorProps } = error;
        return {
            type: LOG_LEVELS.ERROR,
            name: error.name,
            message: error.message,
            ...errorProps,
        };
    }

    if (logFormat === LOG_FORMATS.TEXT) {
        let result = `${error.name}: ${error.message}`;
        if (error.stack) {
            result +=
                "\n" +
                error.stack
                .split("\n")
                .slice(1)
                .map((line) => `  ${line.trim()}`)
                .join("\n");
        }
        return result;
    }

    if (logFormat === LOG_FORMATS.JSON) {
        return {
            type: LOG_LEVELS.ERROR,
            name: error.name,
            message: error.message,
            stack: error.stack,
            ...error,
        };
    }

    return error;
};

module.exports = {
    getTimestamp,
    colorizeLogParts,
    formatJsonLog,
    formatTextLog,
    formatError,
    isBoolean,
    isString,
    getExecutionTime,
    colorize,
};