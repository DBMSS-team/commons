const redis = require("redis");
const { retryStrategy } = require(__commons);
require("dotenv").config();

class redisFactory {

	static options = {
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
		password: process.env.REDIS_PASSWORD,
	};

	static redisClient = redis.createClient(options);

	/**
	 * Get value
	 * @param {*} key
	 */
	static get(key) {
		redisFactory.redisClient.get(key, (err, value) => {
			if (err) {
				throw new Error("Data does not exist");
			}
			return value;
		});
	}

	/**
	 * Set value
	 * @param {*} key
	 */
	static set(key) {
		redisFactory.redisClient.set(key, (err, reply) => {
			if (err) {
				throw new Error("Could not set the data");
			}
			return reply;
		});
	}

	/**
	 * Store Values as  args in Hash specifed by  HashTable as  Key
	 * @param {*} key HashTable
	 * @param  {...any} args List of Argument to be added
	 */
	static hmSet(key, ...args) {
		let argsArray = Array.prototype.slice.call(args);
		redisFactory.redisClient.hmset(key, argsArray, (err, reply) => {
			if (err) {
				throw new Error("Could not set data in redis");
			}
			return reply;
		});
	}

	/**
	 * Get Value(s) from Hashtable based on input Ids
	 * @param {*} tableName
	 * @param {*} hashIDs
	 */
	static async hmGet(tableName, hashIDs) {
		return new Promise((resolve, reject) => {
			redisFactory.redisClient.hmget(tableName, hashIDs, (err, data) => {
				if (err) {
					reject(new Error("Data does not exist"));
				}
				resolve(JSON.parse(data[0]));
			});
		})
	}

	/**
	 * Get total number of values(HashIDs)
	 * @param {*} tableName
	 */
	static hlen(tableName) {
		redisFactory.redisClient.hlen(tableName, (err, length) => {
			if (err) {
				throw new Error("Unexpected Error");
			}
			return length;
		});
	}

	/**
	 * Remove  value  of given key
	 * @param {*} key
	 */
	static remove(key) {
		return redisFactory.redisClient.del(key);
	}

	/**
	 * Quit Redis Client
	 */
	static quit() {
		return redisFactory.redisClient.quit();
	}
}
module.exports = redisFactory;
