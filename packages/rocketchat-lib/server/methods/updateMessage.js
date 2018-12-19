import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';

Meteor.methods({
	updateMessage(message) {

		check(message, Match.ObjectIncluding({ _id: String }));
		const uid = Meteor.userId();

		if (!uid) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'updateMessage' });
		}

		return RocketChat.Services.call('message.edit', { message, user: Meteor.user() });
	},
});
