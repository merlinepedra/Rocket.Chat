import { sendAllNotifications } from 'meteor/rocketchat:lib';
import { applyMeteorMixin, queues } from '../utils';

export default {
	version: 1,
	settings: {
		$noVersionPrefix: true,
	},
	name:'Notifications',
	mixins: [queues(), applyMeteorMixin(undefined, ['queues'])],
	events: {
		'message.sent': {
			handler(args) {
				return this.createJob('sendNotificationOnMessage', args);
			},
		},
	},
	actions: {
		sendNotificationOnMessage: {
			bulkhead: {
				enabled: true,
				concurrency: 1,
				maxQueueSize: Infinity,
			},
			handler({ params }) {
				return this.createJob('sendNotificationOnMessage', params);
			},
		},
	},
	queues: {
		sendNotificationOnMessage(ctx, { message, room }) {
			sendAllNotifications(message, room);
			ctx.logger.debug(`sendNotificationOnMessage done msg:${ message._id } room: ${ room._id }`);
		},
	},
};
