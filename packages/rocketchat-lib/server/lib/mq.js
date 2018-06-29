/* global EJSON */
import mqemitter from 'mqemitter';
import redisMq from 'mqemitter-redis';
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
