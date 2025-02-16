// 3rd Party Logging Service API
const ServiceLogger = {
    init(apiKey, apiEndpoint) {
        // Configure the logging service with an API key and endpoint
        console.log("Initializing logging service with API key:", apiKey);
        console.log("Initializing logging service with API endpoint:", apiEndpoint);
    },

    log(...args) {
        // Send standard log message 
        console.log("LOG message to 3rd party service:", ...args);
    },

    info(...args) {
        // Send informational log message
        console.info("INFO message to 3rd party service:", ...args);
    },

    warn(...args) {
        // Send warning log message
        console.warn("WARN message to 3rd party service:", ...args);
    },

    error(...args) {
        // Send error log message
        console.error("ERROR message to 3rd party service:", ...args);
    },
};

module.exports = ServiceLogger;