const {
    getTimestamp,
    colorize,
    formatError,
    getExecutionTime,
} = require("../src/utils/utils");

const {
    TIMESTAMP_FORMATS,
    VARIABLE_TYPES,
    COLORS,
    LOG_FORMATS,
    LOG_LEVELS,
} = require("../src/constants");

describe("Utils", () => {
    describe("getTimestamp", () => {
        test("ISO format returns valid ISO date string", () => {
            const timestamp = getTimestamp(TIMESTAMP_FORMATS.ISO);
            expect(timestamp).toBe(new Date(timestamp).toISOString());
        });

        test("LOCALE format returns readable date string", () => {
            const timestamp = getTimestamp(TIMESTAMP_FORMATS.LOCALE);
            expect(typeof timestamp).toBe(VARIABLE_TYPES.STRING);
        });

        test("UNIX format returns current timestamp in milliseconds", () => {
            const timestamp = getTimestamp(TIMESTAMP_FORMATS.UNIX);
            const now = Date.now();

            expect(typeof timestamp).toBe(VARIABLE_TYPES.NUMBER);
            expect(timestamp).toBeLessThanOrEqual(now);
        });

        test("Invalid format defaults to ISO", () => {
            const timestamp = getTimestamp(TIMESTAMP_FORMATS.INVALID);
            const validTimestamp = getTimestamp(TIMESTAMP_FORMATS.ISO);

            expect(typeof timestamp).toBe(typeof validTimestamp);
            expect(timestamp.length).toBe(validTimestamp.length);
        });
    });

    describe("colorize", () => {
        test("returns empty string for falsy input", () => {
            expect(colorize(null, COLORS.RED)).toBe("");
            expect(colorize(undefined, COLORS.RED)).toBe("");
        });

        test("wraps text with color codes", () => {
            const coloredText = colorize("test", COLORS.RED);
            expect(coloredText).toBe(`${COLORS.RED}test${COLORS.RESET}`);
        });
    });

    describe("formatError", () => {
        const testError = new Error("Test error");
        testError.code = "TEST_001";

        test("formats error without stack trace", () => {
            const result = formatError(testError, false, LOG_FORMATS.JSON);
            expect(result).toEqual({
                type: LOG_LEVELS.ERROR,
                name: "Error",
                message: "Test error",
                code: "TEST_001",
            });
            expect(result.stack).toBeUndefined();
        });

        test("formats error for TEXT format with stack trace", () => {
            const result = formatError(testError, true, LOG_FORMATS.TEXT);
            expect(result).toContain("Error: Test error");
            expect(result).toContain("at ");
        });

        test("formats error for JSON format with stack trace", () => {
            const result = formatError(testError, true, LOG_FORMATS.JSON);
            expect(result).toEqual(
                expect.objectContaining({
                    type: LOG_LEVELS.ERROR,
                    name: "Error",
                    message: "Test error",
                    stack: expect.any(String),
                    code: "TEST_001",
                })
            );
        });
    });

    describe("getExecutionTime", () => {
        test("returns formatted time with 'ms' suffix", () => {
            const startTime = process.hrtime.bigint();
            const result = getExecutionTime(startTime);

            expect(result.endsWith("ms")).toBe(true);
            expect(typeof parseFloat(result)).toBe(VARIABLE_TYPES.NUMBER);
        });

        test("measures elapsed time correctly", async() => {
            const startTime = process.hrtime.bigint();

            await new Promise((resolve) => setTimeout(resolve, 50));

            const result = getExecutionTime(startTime);
            const timeValue = parseFloat(result);

            expect(timeValue).toBeGreaterThan(0);
            expect(timeValue).toBeGreaterThanOrEqual(50);
        });
    });
});