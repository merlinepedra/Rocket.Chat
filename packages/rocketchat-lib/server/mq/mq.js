/* global EJSON */
import EventEmitter from 'events';

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

let getQueue = function getQueue(queueName, consume) {
	const p = new ProducerLocal(queueName);
	const c = new ConsumerLocal(queueName, consume);
	p.on('data', function() {
		c.consume();
	});
	return p;
};

export function setQueueManager(fn) {
	getQueue = fn;
}

export function createQueue(queueName, consume) {
	return getQueue(queueName, consume);
}
