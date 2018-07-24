import mqemitter from 'mqemitter';
import msgpack from 'msgpack-lite';

let mq = mqemitter();
export default mq;

export let queuePersistence = null;

export function setMQ(fn, persistence) {
	mq = fn;
	queuePersistence = persistence;
}

export class Streamer extends Meteor.Streamer {
	constructor(name, { encoder = (args) => msgpack.encode(args) } = {}) {
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
