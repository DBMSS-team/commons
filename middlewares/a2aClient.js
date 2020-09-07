const commandFactory = require("express-hystrix");
const Toobusy = require("hystrix-too-busy");

module.exports.use = (app) => {
	/** too busy function
	 *
	 * @param {*} config
	 */
	function tooBusyFactory(config) {
		Toobusy.init(config);

		return function commandExecutor(command, req, res, next) {
			return new Promise((resolve, reject) => {
				Toobusy.getStatus((busy) => {
					setImmediate(next);
					if (busy) {
						return reject(new Error("TooBusy"));
					}
					resolve();
				});
			});
		};
	}

	// Dashboard for easy viewing before toobusy
	app.use(
		"/hystrix",
		require("hystrix-dashboard")({
			idleTimeout: 4000,
			interval: 2000,
			proxy: true
		})
	);

	// Circuit breaker check
	app.use(
		commandFactory({
			hystrix: {
				"default": {
					circuitBreakerErrorThresholdPercentage: 50,
					circuitBreakerForceClosed: false,
					circuitBreakerForceOpened: false,
					circuitBreakerSleepWindowInMilliseconds: 1000,
					maxConcurrentConnections: 10,
					circuitBreakerRequestVolumeThreshold: 20,
					requestVolumeRejectionThreshold: 0,
					statisticalWindowNumberOfBuckets: 10,
					statisticalWindowLength: 10000,
					percentileWindowNumberOfBuckets: 6,
					percentileWindowLength: 60000
				}
			}
		})
	);

	// toobusy command before any other route
	app.use(
		commandFactory({
			commandExecutorFactory: tooBusyFactory
		})
	);

	app.use(
		commandFactory({
			commandStatusResolver: (req, res) => {
				// eslint-disable-next-line no-magic-numbers
				if (res && res.statusCode === 404) {
					return Promise.reject(new Error("Bad path"));
				}
				return Promise.resolve();
			}
		})
	);

	// handle open circuit here
	app.use((err, req, res, next) => {
		if (err && err.message === "OpenCircuitError") {
			err.httpCode = 500;
			err.message = "OpenCircuitError";
			err.cause = "Service busy";
		} else {
			// eslint-disable-next-line no-magic-numbers
			err.httpCode = err.status || 500;
			err.cause = "A2A middleware errror";
			err.message = err.message || "A2A error";
		}
		next(err);
	});
};
