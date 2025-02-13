// 3rd Party Logging Service API
const ServiceLogger = {
  init(apiKey) {
    // Configure the logging service with an API key
    console.log("Initializing logging service with API key:", apiKey);
  },

  log(...args) {
    // Send standard log message
    console.log("Logging message to 3rd party service:", args);
  },

  info(...args) {
    // Send informational log message
    console.log("Logging message to 3rd party service:", args);
  },

  warn(...args) {
    // Send warning log message
    console.log("Logging message to 3rd party service:", args);
  },

  error(...args) {
    // Send error log message
    console.log("Logging message to 3rd party service:", args);
  },
};

module.exports = ServiceLogger;
