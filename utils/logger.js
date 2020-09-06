const log4js = require("log4js");
const { loggerConfig } = require("../config");

log4js.configure(loggerConfig);
exports.use = (app) => {
	app.use(log4js.connectLogger(log4js.getLogger("http"), {
		level: "auto"
	}));
};

exports.appLogger = log4js.getLogger("app");
exports.errorLogger = log4js.getLogger();
