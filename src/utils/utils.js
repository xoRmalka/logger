const {
    TIMESTAMP_FORMATS,
    COLORS,
    LEVEL_COLORS,
    VARIABLE_TYPES,
} = require("../constants");

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

const isBoolean = (value) => typeof value === VARIABLE_TYPES.BOOLEAN;
const isString = (value) => typeof value === VARIABLE_TYPES.STRING;

module.exports = {
    getTimestamp,
    colorizeLogParts,
    formatJsonLog,
    formatTextLog,
    isBoolean,
    isString,
};