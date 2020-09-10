const logger = require("./logger");
const appLogger = logger.appLogger;
const errorLogger = logger.errorLogger;

/**
 * Common class for handing response. Response rules are defined here.
 *
 */

class ResponseUtils {
	constructor() {
		this.success = false;
		this.message = null;
		this.data = null;
		this.headers = {
		};
	}

	/**
	 *
	 * @param {*} statusCode
	 * @param {*} message
	 * @param {*} data
	 */
	setSuccess(statusCode, message, data /* , count =1*/) {
		this.success = true;
		this.message = message;
		this.headers.status = statusCode;
		this.data = data;
		return this;
	}

	/**
	 * Setting Error Message
	 * @param {*} statusCode
	 * @param {*} message
	 */
	setError(statusCode, message) {
		this.success = false;
		this.headers.status = statusCode;
		this.message = message;
		return this;
	}

	/**
	 *
	 * @param {*} header : object like {Content-Type: text/html}
	 */
	setHeader(header) {
		// this.headers.key = value;
		Object.assign(this.headers, header);
		return this;
	}

	/**
	 * Send generated response to attached client(s)
	 * @param {*} res
	 */
	send(res) {
		Object.entries(this.headers).map((header) => {
			// eslint-disable-next-line no-magic-numbers
			res.set(header[0], header[1]);
		});
		if (this.success) {
			appLogger.info(this.message);
			res.json(this.data);
		} else {
			errorLogger.error(this.message);
			res.json(this.message);
		}
	}
}

module.exports = ResponseUtils;
