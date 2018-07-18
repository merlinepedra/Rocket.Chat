/* global EJSON */
import EventEmitter from 'events';
import mqemitter from 'mqemitter';
import redisMq from 'mqemitter-redis';

import { Producer, Consumer } from 'redis-smq'; //eslint ignore-line

import { redisConfig } from './redis';

const mq = process.env.REDIS_HOST ? redisMq(redisConfig) : mqemitter();
export default mq;

// elect master server from cluster
import { Democracy } from './democracy';

const dem = new Democracy({
	source: `${ process.env.INSTANCE_IP || 'localhost' }:${ process.env.PORT }`
	//   peers: ['127.0.0.1:12345', '127.0.0.1:12346', '127.0.0.1:12347']
});

dem.on('added', function(data) {
	console.log('Added: ', data);
});

dem.on('removed', function(data) {
	console.log('Removed: ', data);
});

dem.on('elected', function(data) {
	console.log('You are elected leader!');
});

dem.on('leader', function(data) {
	console.log('New Leader: ', data);
});

setInterval(() => {
	console.log('am I leader ->', dem._id, dem.isLeader());
}, 2000);

export class Streamer extends Meteor.Streamer {
	constructor(name, { encoder = (args) => EJSON.stringify(args) } = {}) {
		super(...arguments);
		this.encoder = encoder;
	}
	_emit(eventName, args, origin, broadcast) {
		// emit only if is master
		mq.emit({
			topic: `${ this.name }/${ eventName }`,
			payload: this.encoder(args)
		});
		super._emit(eventName, args, origin, broadcast);
	}
}

const queues = {};


class ProducerLocal extends EventEmitter {
	constructor(queueName) {
		super();
		this.queueName = queueName;
		queues[queueName] = [];
	}
	produce(data) {
		queues[this.queueName].push(data);
		console.log('produce', data);
		this.emit('data');
	}
}

class ConsumerLocal {
	constructor(queueName, fn) {
		this.counter = 0;
		this.limit = 1;
		this.fn = fn;
		this.queueName = queueName;
	}
	_done() {
		this.counter--;
		this.consume();
	}
	consume() {
		if (this.counter < this.limit && queues[this.queueName].length) {
			this.counter++;
			process.nextTick(() => {
				this.fn(queues[this.queueName].shift(), () => this._done());
			});
		}
	}
}

const options = {
	namespace: 'rocketchat',
	redis: {
		...redisConfig,
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
		port: 4000
	}
};

export const createQueue = process.env.REDIS_HOST ? (queueName, consume) => {
	class _Consumer extends Consumer {
		consume(message, cb) {
			consume(message, cb);
		}
	}
	_Consumer.queueName = queueName;
	const consumer = new _Consumer(options);
	consumer.run();
	return new Producer(queueName);
} : (queueName, consume) => {
	const p = new ProducerLocal(queueName);
	const c = new ConsumerLocal(queueName, consume);
	p.on('data', function() {
		c.consume();
	});
	return p;
};
