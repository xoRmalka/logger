// You can run this file with the command from the root of the project: node example/demo.js

const { init, logger } = require("../src/logger");

// Basic usage with default settings
console.log("\n=== Basic Usage (Default Settings) ===");
init({ environment: "development" });
logger.log("This is a regular log message");
logger.info("Starting application...");
logger.warn("Memory usage is high");
logger.error("Failed to connect to database");

// Reset logger for next example
logger.resetLogger();

// JSON format with execution time
console.log("\n=== JSON Format with Execution Time ===");
init({
    environment: "development",
    logFormat: "json",
    showExecutionTime: true
});

logger.info("Server started", { port: 3000 });
logger.warn("High CPU usage", { usage: "85%" });

// Reset logger for next example
logger.resetLogger();

// Text format with colors and error stack
console.log("\n=== Text Format with Colors and Error Stack ===");
init({
    environment: "development",
    logFormat: "text",
    colorizeLogs: true,
    showErrorStack: true
});

try {
    throw new Error("Database connection failed");
} catch (error) {
    error.code = "DB_001";
    logger.error(error);
}

// Reset logger for next example
logger.resetLogger();

// Different timestamp formats
console.log("\n=== Different Timestamp Formats ===");
init({
    environment: "development",
    timeStampFormat: "UNIX"
});
logger.info("Using UNIX timestamp");

logger.resetLogger();
init({
    environment: "development",
    timeStampFormat: "LOCALE"
});
logger.info("Using LOCALE timestamp");

// Reset logger for next example
logger.resetLogger();

// Log level filtering
console.log("\n=== Log Level Filtering ===");
init({ environment: "development" });
logger.setLogLevel("warn");

logger.log("This log message won't show");
logger.info("This info message won't show");
logger.warn("This warning will show");
logger.error("This error will show");

// Reset logger for next example
logger.resetLogger();

// Production environment example (will show warning due to missing API key)
console.log("\n=== Production Environment Example ===");
init({
    environment: "production",
    apiKey: "your-api-key",
    apiEndpoint: "https://logging-service.com/api"
});

logger.info("This message would be sent to the logging service");