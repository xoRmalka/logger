const { init, logger } = require("../src/logger");
const {
    ENVIRONMENTS,
    INIT_ERROR_MESSAGES,
    INVALID_STRING,
    COLORS,
    LOG_LEVELS,
    LOG_FORMATS,
    TIMESTAMP_FORMATS,
    TEST_MESSAGE,
    VARIABLE_TYPES,
} = require("../src/constants");
const { colorize } = require("../src/utils/utils");

describe("Logger", () => {
    let consoleLogSpy, consoleInfoSpy, consoleWarnSpy, consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleLogSpy = jest.spyOn(console, LOG_LEVELS.LOG).mockImplementation();
        consoleInfoSpy = jest.spyOn(console, LOG_LEVELS.INFO).mockImplementation();
        consoleWarnSpy = jest.spyOn(console, LOG_LEVELS.WARN).mockImplementation();
        consoleErrorSpy = jest
            .spyOn(console, LOG_LEVELS.ERROR)
            .mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        logger.resetLogger();
    });

    describe("Initialization", () => {
        test("initializes with default options", () => {
            expect(init()).toBe(true);
        });

        test("throws error when initialized multiple times", () => {
            init();
            expect(() => init()).toThrow(INIT_ERROR_MESSAGES.ALREADY_INITIALIZED);
        });

        test("throws error for invalid environment", () => {
            expect(() => init({ environment: INVALID_STRING })).toThrow(
                INIT_ERROR_MESSAGES.INVALID_ENVIRONMENT
            );
        });

        test("throws error for production without API credentials", () => {
            expect(() => init({ environment: ENVIRONMENTS.PRODUCTION })).toThrow(
                INIT_ERROR_MESSAGES.MISSING_API_KEY
            );
        });
    });

    describe("Logging Methods", () => {
        beforeEach(() => {
            init({ showErrorStack: true });
        });

        test("logs message with log level", () => {
            logger.log(TEST_MESSAGE);

            expect(consoleLogSpy).toHaveBeenCalled();
            expect(consoleLogSpy.mock.calls[0]).toContain(
                colorize(`[${LOG_LEVELS.LOG.toUpperCase()}]`, COLORS.BLUE)
            );
        });

        test("logs info message", () => {
            logger.info(TEST_MESSAGE);

            expect(consoleInfoSpy).toHaveBeenCalled();
            expect(consoleInfoSpy.mock.calls[0]).toContain(
                colorize(`[${LOG_LEVELS.INFO.toUpperCase()}]`, COLORS.CYAN)
            );
        });

        test("logs warning message", () => {
            logger.warn(TEST_MESSAGE);
            expect(consoleWarnSpy).toHaveBeenCalled();
            expect(consoleWarnSpy.mock.calls[0]).toContain(
                colorize(`[${LOG_LEVELS.WARN.toUpperCase()}]`, COLORS.YELLOW)
            );
        });

        test("logs error message", () => {
            logger.error(TEST_MESSAGE);
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(consoleErrorSpy.mock.calls[0]).toContain(
                colorize(`[${LOG_LEVELS.ERROR.toUpperCase()}]`, COLORS.RED)
            );
        });

        test("logs error objects with stack trace", () => {
            const error = new Error(TEST_MESSAGE);

            logger.error(error);
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(consoleErrorSpy.mock.calls[0].join(" ")).toContain(TEST_MESSAGE);
            expect(consoleErrorSpy.mock.calls[0].join(" ")).toContain("Error:");
        });
    });

    describe("Log Levels", () => {
        beforeEach(() => {
            init();
        });

        test("respects log level hierarchy", () => {
            logger.setLogLevel(LOG_LEVELS.WARN);

            logger.log(TEST_MESSAGE);
            logger.info(TEST_MESSAGE);
            logger.warn(TEST_MESSAGE);
            logger.error(TEST_MESSAGE);

            expect(consoleLogSpy).not.toHaveBeenCalled();
            expect(consoleInfoSpy).not.toHaveBeenCalled();
            expect(consoleWarnSpy).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        test("returns default log level for invalid log level", () => {
            const warnSpy = jest.spyOn(console, 'warn');

            logger.setLogLevel(INVALID_STRING);
            expect(warnSpy).toHaveBeenCalledWith(INIT_ERROR_MESSAGES.INVALID_LOG_LEVEL);
        });
    });

    describe("Formatting Options", () => {
        test("formats logs as JSON", () => {
            init({ logFormat: LOG_FORMATS.JSON });
            logger.info(TEST_MESSAGE);

            const logCall = consoleInfoSpy.mock.calls[0];
            expect(typeof logCall).toBe(VARIABLE_TYPES.OBJECT);

            const parsedLog = JSON.parse(logCall);
            expect(parsedLog).toHaveProperty("timestamp");
            expect(parsedLog).toHaveProperty("level", LOG_LEVELS.INFO.toUpperCase());
            expect(parsedLog).toHaveProperty("data", TEST_MESSAGE);
        });

        test("formats timestamp according to specified format", () => {
            init({ timeStampFormat: TIMESTAMP_FORMATS.UNIX });
            logger.info(TEST_MESSAGE);

            const timestamp = consoleInfoSpy.mock.calls[0][0];
            expect(typeof Number(timestamp)).toBe(VARIABLE_TYPES.NUMBER);
        });
    });

    describe("Error Handling", () => {
        test("throws error when logging before initialization", () => {
            const warnSpy = jest.spyOn(console, "warn");

            logger.log(TEST_MESSAGE);
            expect(warnSpy).toHaveBeenCalledWith(INIT_ERROR_MESSAGES.NOT_INITIALIZED);
        });
    });
});