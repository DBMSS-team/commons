const process = require("process");
const nodeEnv = process.env.NODE_ENV;
if (nodeEnv === "dev" || nodeEnv === "development") {
	module.exports = require("./dev");
} else {
	module.exports = require("./prod");
}
