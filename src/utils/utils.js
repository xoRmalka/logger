const { TIMESTAMP_FORMATS } = require("../constants");

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

module.exports = { getTimestamp };