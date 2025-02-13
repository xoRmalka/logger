const { init, logger } = require("../src/logger");
const second = require("./second");

const loggerOptions = {
  apiKey: "example-api-key",
};

init(loggerOptions);

logger.log("Hello, world!");
logger.info("Hello, world!");
logger.warn("Hello, world!");
logger.error("Hello, world!");

second();
