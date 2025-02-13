const { logger } = require("../src/logger");

function second() {
  logger.log("Hello from second.js");
  logger.info("Hello from second.js");
  logger.warn("Hello from second.js");
  logger.error("Hello from second.js");
}

module.exports = second;
