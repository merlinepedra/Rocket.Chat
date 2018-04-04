/* globals msgStream */
import _ from 'underscore';

Meteor.methods({
	setReaction(emoji, messageId) {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'setReaction' });
		}

		const message = RocketChat.models.Messages.findOneById(messageId);

		if (!message) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'setReaction' });
		}

		const room = Meteor.call('canAccessRoom', message.rid, Meteor.userId());

		if (!room) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'setReaction' });
		}

		const reactionWithoutColon = emoji.replace(/:/g, '');
		const reactionWithColon = `:${ reactionWithoutColon }:`;

		if (!RocketChat.emoji.list[reactionWithColon] && RocketChat.models.EmojiCustom.findByNameOrAlias(reactionWithoutColon).count() === 0) {
			throw new Meteor.Error('error-not-allowed', 'Invalid emoji provided.', { method: 'setReaction' });
		}

		const user = Meteor.user();

		if (Array.isArray(room.muted) && room.muted.indexOf(user.username) !== -1 && !room.reactWhenReadOnly) {
			RocketChat.Notifications.notifyUser(Meteor.userId(), 'message', {
				_id: Random.id(),
				rid: room._id,
				ts: new Date(),
				msg: TAPi18n.__('You_have_been_muted', {}, user.language)
			});
			return false;
		} else if (!RocketChat.models.Subscriptions.findOne({ rid: message.rid })) {
			return false;
		}

		if (message.reactions && message.reactions[reactionWithColon] && message.reactions[reactionWithColon].usernames.indexOf(user.username) !== -1) {
			message.reactions[reactionWithColon].usernames.splice(message.reactions[reactionWithColon].usernames.indexOf(user.username), 1);

			if (message.reactions[reactionWithColon].usernames.length === 0) {
				delete message.reactions[reactionWithColon];
			}

			if (_.isEmpty(message.reactions)) {
				delete message.reactions;
				RocketChat.models.Messages.unsetReactions(messageId);
				RocketChat.callbacks.run('unsetReaction', messageId, reactionWithColon);
			} else {
				RocketChat.models.Messages.setReactions(messageId, message.reactions);
				RocketChat.callbacks.run('setReaction', messageId, reactionWithColon);
			}
		} else {
			if (!message.reactions) {
				message.reactions = {};
			}
			if (!message.reactions[reactionWithColon]) {
				message.reactions[reactionWithColon] = {
					usernames: []
				};
			}
			message.reactions[reactionWithColon].usernames.push(user.username);

			RocketChat.models.Messages.setReactions(messageId, message.reactions);
			RocketChat.callbacks.run('setReaction', messageId, reactionWithColon);
		}

		msgStream.emit(message.rid, message);

		return;
	}
});
