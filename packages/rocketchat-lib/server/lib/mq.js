/* global EJSON */
import EventEmitter from 'events';
import mqemitter from 'mqemitter';
import redisMq from 'mqemitter-redis';

import { Producer, Consumer } from 'redis-smq'; //eslint ignore-line


const mq = process.env.REDIS ? redisMq({ host: process.env.REDIS }) : mqemitter();
export default mq;


export class Streamer extends Meteor.Streamer {
	constructor(name, { encoder = (args) => EJSON.stringify(args) } = {}) {
		super(...arguments);
		this.encoder = encoder;
	}
	_emit(eventName, args, origin, broadcast) {
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
	done() {
		this.counter--;
		this.consume();
	}
	consume() {
		if (this.counter < this.limit && queues[this.queueName].length) {
			this.counter++;
			this.fn(queues[this.queueName].shift(), () => this.done());
		}
	}
}

const options = {
	namespace: 'rocketchat',
	redis: {
		host: process.env.REDIS,
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
		port: 4000
	}
};
export const createQueue = process.env.REDIS ? (queueName, consume) => {
	class _Consumer extends Consumer {
		consume(message, cb) {
			consume(message, cb);
		}
	}
	_Consumer.queueName = 'afterSaveMessage';
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
