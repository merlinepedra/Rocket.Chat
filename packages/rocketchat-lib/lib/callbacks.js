import _ from 'underscore';

/*
* Callback hooks provide an easy way to add extra steps to common operations.
* @namespace RocketChat.callbacks
*/

RocketChat.callbacks = {};

if (Meteor.isServer) {
	RocketChat.callbacks.showTime = true;
	RocketChat.callbacks.showTotalTime = true;
} else {
	RocketChat.callbacks.showTime = false;
	RocketChat.callbacks.showTotalTime = false;
}


/*
* Callback priorities
*/

RocketChat.callbacks.priority = {
	HIGH: -1000,
	MEDIUM: 0,
	LOW: 1000
};

const getHooks = hookName => RocketChat.callbacks[hookName] || [];

/*
* Add a callback function to a hook
* @param {String} hook - The name of the hook
* @param {Function} callback - The callback function
*/

RocketChat.callbacks.add = function(hook, callback, priority, id = Random.id()) {
	if (!_.isNumber(priority)) {
		priority = RocketChat.callbacks.priority.MEDIUM;
	}
	callback.priority = priority;
	callback.id = id;
	RocketChat.callbacks[hook] = getHooks(hook);

	if (RocketChat.callbacks.showTime === true) {
		const err = new Error;
		callback.stack = err.stack;
	}

	if (RocketChat.callbacks[hook].find((cb) => cb.id === callback.id)) {
		return;
	}
	RocketChat.callbacks[hook].push(callback);
	RocketChat.callbacks[hook] = _.sortBy(RocketChat.callbacks[hook], function(callback) {
		return callback.priority || RocketChat.callbacks.priority.MEDIUM;
	});
};


/*
* Remove a callback from a hook
* @param {string} hook - The name of the hook
* @param {string} id - The callback's id
*/

RocketChat.callbacks.remove = function(hook, id) {
	RocketChat.callbacks[hook] = getHooks(hook).filter(callback => callback.id !== id);
};


/*
* Successively run all of a hook's callbacks on an item
* @param {String} hook - The name of the hook
* @param {Object} item - The post, comment, modifier, etc. on which to run the callbacks
* @param {Object} [constant] - An optional constant that will be passed along to each callback
* @returns {Object} Returns the item after it's been through all the callbacks for this hook
*/

RocketChat.callbacks.run = function(hook, item, constant) {
	const callbacks = RocketChat.callbacks[hook];
	if (!callbacks || !callbacks.length) {
		return item;
	}

	let rocketchatHooksEnd;
	if (Meteor.isServer) {
		rocketchatHooksEnd = RocketChat.metrics.rocketchatHooks.startTimer({hook, callbacks_length: callbacks.length});
	}

	let totalTime = 0;
	const result = callbacks.reduce(function(result, callback) {
		let rocketchatCallbacksEnd;
		if (Meteor.isServer) {
			rocketchatCallbacksEnd = RocketChat.metrics.rocketchatCallbacks.startTimer({hook, callback: callback.id});
		}
		const time = RocketChat.callbacks.showTime === true || RocketChat.callbacks.showTotalTime === true ? Date.now() : 0;

		const callbackResult = callback(result, constant);

		if (RocketChat.callbacks.showTime === true || RocketChat.callbacks.showTotalTime === true) {
			const currentTime = Date.now() - time;
			totalTime += currentTime;
			if (RocketChat.callbacks.showTime === true) {
				if (Meteor.isServer) {
					rocketchatCallbacksEnd();
					RocketChat.statsTracker.timing('callbacks.time', currentTime, [`hook:${ hook }`, `callback:${ callback.id }`]);
				} else {
					let stack = callback.stack && typeof callback.stack.split === 'function' && callback.stack.split('\n');
					stack = stack && stack[2] && (stack[2].match(/\(.+\)/)||[])[0];
					console.log(String(currentTime), hook, callback.id, stack);
				}
			}
		}
		return (typeof callbackResult === 'undefined') ? result : callbackResult;
	}, item);

	if (Meteor.isServer) {
		rocketchatHooksEnd();
	}

	if (RocketChat.callbacks.showTotalTime === true) {
		if (Meteor.isServer) {
			RocketChat.statsTracker.timing('callbacks.totalTime', totalTime, [`hook:${ hook }`]);
		} else {
			console.log(`${ hook }:`, totalTime);
		}
	}

	return result;

};


/*
* Successively run all of a hook's callbacks on an item, in async mode (only works on server)
* @param {String} hook - The name of the hook
* @param {Object} item - The post, comment, modifier, etc. on which to run the callbacks
* @param {Object} [constant] - An optional constant that will be passed along to each callback
*/
if(Meteor.isServer) {
	import { Producer, Consumer } from "redis-smq"; //eslint ignore-line
	const options = {
		namespace: 'rocketchat',
		redis: {
			host: '127.0.0.1',
			port: 6379,
			connect_timeout: 3600000
		},
		log: {
			enabled: 0,
			options: {
				level: 'trace'
				/*
					streams: [
						{
							path: path.normalize(`${__dirname}/../logs/redis-smq.log`)
						},
					],
					*/
			}
		},
		monitor: {
			enabled: true,
			host: '127.0.0.1',
			port: 3000
		}
	};

	const producer = {
		afterSaveMessage: new Producer('afterSaveMessage', options)
	};

	RocketChat.callbacks.runAsync = function(hook, item) {
		return producer[hook] && producer[hook].produce(EJSON.stringify(item), console.log);
	};

	// const run = Meteor.bindEnviroment(RocketChat.callbacks.run);

	const run = Meteor.bindEnvironment((queueName, message, cb) => {
		RocketChat.callbacks.run(queueName, message);
		cb();
	});

	class TestQueueConsumer extends Consumer {
		/**
		 *
		 * @param message
		 * @param cb
		 */
		consume(message, cb) {
			run(this.queueName, EJSON.parse(message), cb);
		}
	}

	TestQueueConsumer.queueName = 'afterSaveMessage';

	const consumer = new TestQueueConsumer(options, { messageConsumeTimeout: 2000 });

	consumer.run();

}
RocketChat.callbacks.add(
	"afterSaveMessage",
	item => console.log("terminei", item),
	RocketChat.callbacks.priority
);
