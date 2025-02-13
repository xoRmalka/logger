const { init, logger } = require("../src/logger");
const second = require("./second");

const loggerOptions = {
  // apiKey: "example-api-key",
};

init(loggerOptions);

logger.log("Hello, world!", {
  userId: 123,
  name: "John Doe",
  email: "john.doe@example.com",
});
logger.info("Hello, world!", 1234567);
logger.warn({ warning: "before" }, "Hello, world!");
logger.error("Hello, world!", {
  error: "after",
});

second();
