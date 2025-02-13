const ServiceLogger = require("./serviceLogger");

const ENVIRONMENTS = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
};
Object.freeze(ENVIRONMENTS);

const COLORS = {
  RESET: "\x1b[0m",
  DIM: "\x1b[2m",
  BLUE: "\x1b[34m",
  CYAN: "\x1b[36m",
  YELLOW: "\x1b[33m",
  RED: "\x1b[31m",
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
    log: COLORS.BLUE,
    info: COLORS.CYAN,
    warn: COLORS.YELLOW,
    error: COLORS.RED,
  };

  const output = [
    `${COLORS.DIM}${timestamp}${COLORS.RESET}`,
    `${levelColors[level] || COLORS.BLUE}[${level.toUpperCase()}]${
      COLORS.RESET
    }`,
    ...formattedArgs,
  ];

  if (level === "error" || level === "warn") {
    const stack = getStackTrace();
    output.push(`\n${COLORS.DIM}${stack}${COLORS.RESET}`);
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
