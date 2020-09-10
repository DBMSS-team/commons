const logger = require("../utils/logger");
const appLogger = logger.appLogger;
const errorLogger = logger.errorLogger;

module.exports = function retryStrategy(options) {
	if (options.error && options.error.code === "ECONNREFUSED") {
		// End reconnecting on a specific error and flush all commands with
		// a individual error
		errorLogger.error("The server refused the connection");
		return new Error("The server refused the connection");
	}
	if (options.total_retry_time > 1000 * 60 * 60) {
		// End reconnecting after a specific timeout and flush all commands
		// with a individual error
		errorLogger.error("Retry time exhausted");
		return new Error("Retry time exhausted");
	}
	if (options.attempt > 8) {
		// End reconnecting with built in error
		errorLogger.error("Max attempt exceeded");
		return undefined;
	}
	// reconnect after
	appLogger.warn(`Reconnect after ${Math.pow(2, options.attempt) * 500 / 1000} secs`);
	return Math.pow(2, options.attempt) * 500;
};
