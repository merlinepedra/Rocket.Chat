import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

Meteor.methods({
	deleteMessage(message) {
		check(message, Match.ObjectIncluding({
			_id: String,
		}));
		const uid = Meteor.userId();
		const mid = message._id;
		if (!uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'deleteMessage',
			});
		}
		return RocketChat.Services.call('message.delete', { mid, uid });
	},
});
