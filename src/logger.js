const ServiceLogger = require("./serviceLogger");

const ENVIRONMENTS = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
};
Object.freeze(ENVIRONMENTS);

const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

let environment = ENVIRONMENTS.DEVELOPMENT;
let initialized = false;

const getTimestamp = () => {
  return new Date().toISOString();
};

const getStackTrace = () => {
  const stack = new Error().stack.split("\n").slice(5).join("\n");
  return stack;
};

const formatArgs = (args) => {
  return args.map((arg) => {
    if (arg instanceof Error) {
      return {
        message: arg.message,
        stack: arg.stack,
        name: arg.name,
      };
    }
    return arg;
  });
};

const formatDevelopmentLog = (level, args) => {
  const timestamp = getTimestamp();
  const formattedArgs = formatArgs(args);

  const levelColors = {
    log: colors.blue,
    info: colors.cyan,
    warn: colors.yellow,
    error: colors.red,
  };

  const output = [
    `${colors.dim}${timestamp}${colors.reset}`,
    `${levelColors[level] || colors.blue}[${level.toUpperCase()}]${
      colors.reset
    }`,
    ...formattedArgs,
  ];

  if (level === "error" || level === "warn") {
    const stack = getStackTrace();
    output.push(`\n${colors.dim}${stack}${colors.reset}`);
  }

  return output;
};

const loggerMethods = {
  development: {
    log: (...args) => console.log(...formatDevelopmentLog("log", args)),
    info: (...args) => console.info(...formatDevelopmentLog("info", args)),
    warn: (...args) => console.warn(...formatDevelopmentLog("warn", args)),
    error: (...args) => console.error(...formatDevelopmentLog("error", args)),
  },
  production: ServiceLogger,
};

const init = (options = {}) => {
  if (initialized) {
    throw new Error("Logger has already been initialized");
  }

  environment = process.env.ENVIRONMENT || ENVIRONMENTS.DEVELOPMENT;

  if (environment === ENVIRONMENTS.PRODUCTION && !options.apiKey) {
    throw new Error("API key is required in production environment");
  }

  if (environment === ENVIRONMENTS.PRODUCTION) {
    ServiceLogger.init(options.apiKey);
  }

  initialized = true;
};

const logger = {
  log(...args) {
    loggerMethods[environment].log(...args);
  },
  info(...args) {
    loggerMethods[environment].info(...args);
  },
  warn(...args) {
    loggerMethods[environment].warn(...args);
  },
  error(...args) {
    loggerMethods[environment].error(...args);
  },
};

module.exports = { init, logger };
