# MyLogger

A flexible logging package that supports both development and production environments with rich formatting options and configurable features.

## Installation - Local Development

Since this package is not yet published to npm, you can install it directly from the repository

To develop and test locally:

1. Clone the repository
2. Navigate to the package directory
3. Install dependencies and create a local link:
```bash
npm install
npm link
```
4. In your project directory, link to your local version:
```bash
npm link mylogger
```

## Usage

```javascript
const { init, logger } = require("mylogger");

// Initialize with default options
init();

// Basic logging
logger.log("Hello, world!");
logger.info("Starting application...");
logger.warn("Resource usage high");
logger.error("Connection failed");

// Initialize with custom options
init({
  environment: "development",
  logFormat: "json",
  showTimestamp: true,
  showExecutionTime: true
});
```

## Configuration Options

| Option | Description | Values | Default |
|--------|-------------|---------|---------|
| `environment` | Logging environment | `"development"`, `"production"` | `"development"` |
| `logLevel` | Minimum level to log | `"log"`, `"info"`, `"warn"`, `"error"` | `"log"` |
| `showTimestamp` | Show timestamp in logs | `boolean` | `true` |
| `timeStampFormat` | Timestamp format | `"ISO"`, `"LOCALE"`, `"UNIX"` | `"ISO"` |
| `colorizeLogs` | Colorize log output | `boolean` | `true` |
| `logFormat` | Output format | `"raw"`, `"json"`, `"text"` | `"raw"` |
| `showErrorStack` | Show full stack trace for errors | `boolean` | `false` |
| `showExecutionTime` | Show execution time since init | `boolean` | `false` |
| `apiKey` | API key for production logging | `string` | `undefined` |
| `apiEndpoint` | Endpoint for production logging | `string` | `undefined` |

## Examples

### JSON Format Logging
```javascript
init({
  logFormat: "json",
  showExecutionTime: true
});

logger.info("Server started", { port: 3000 });
// Output: {"timestamp":"2025-02-16T18:41:53.473Z","level":"INFO","data":["Server started",{"port":3000},{"executionTime":"7.59ms"}]}
```

### Text Format with Colors
```javascript
init({
  logFormat: "text",
  colorizeLogs: true
});

logger.warn("High memory usage", { usage: "85%" });
// Output: 2025-02-16T18:42:43.238Z [WARN] High memory usage {"usage":"85%"}
```

### Error Logging with Stack Trace
```javascript
init({
  showErrorStack: true,
  logFormat: "text"
});

try {
  throw new Error("Database connection failed");
} catch (error) {
  logger.error(error);
}
// Output: 2025-02-16T18:44:09.385Z [ERROR] Error: Database connection failed
//          at Object.<anonymous> (/app/index.js:2:9)
//          at Module._compile (internal/modules/cjs/loader.js:999:30)
//    ...
```

### Production Environment
```javascript
init({
  environment: "production",
  apiKey: "your-api-key",
  apiEndpoint: "https://logging-service.com/api"
});

logger.info("Production log message"); // Sends log to external service
```

## Environment Configuration Priority

The logger follows a specific priority order when determining environment settings:

1. Runtime initialization options (highest priority)
```javascript
init({ environment: "production" });
```

2. Environment variables (LOGGER_ENV then NODE_ENV)
```bash
NODE_ENV=production 
LOGGER_ENV=production 
```

3. Default configuration (lowest priority)
```javascript
// Falls back to "development" if no other configuration is found
```

## Log Level Priority

Logs will only be output if they meet or exceed the current log level priority:

1. `error` (highest)
2. `warn`
3. `info`
4. `log` (lowest)

## Runtime Configuration

You can change settings during runtime:

```javascript
// Change log level
logger.setLogLevel("warn"); // Will only show warn and error logs

// Reset logger to default settings and will need to be initialized again
logger.resetLogger();
```

## Timestamp Formats

The logger supports three timestamp formats:

- `ISO` (default): "2024-03-20T10:30:00.000Z"
- `LOCALE`: Local date string format
- `UNIX`: Unix timestamp in milliseconds

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```


