/* global EJSON */
import mq from 'mqemitter';
import redisMq from 'mqemitter-redis';
export default process.env.REDIS ? redisMq({ host: process.env.REDIS }) : mq();

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
