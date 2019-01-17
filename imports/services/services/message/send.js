import moment from 'moment';
import GraphemeSplitter from 'grapheme-splitter';

import { RocketChat } from 'meteor/rocketchat:lib';
import { Meteor } from 'meteor/meteor';

const splitter = new GraphemeSplitter();

export const messageProperties = {

	length: ((message) => splitter.countGraphemes(message)),

	messageWithoutEmojiShortnames: ((message) => message.replace(/:\w+:/gm, (match) => {
		if (RocketChat.emoji.list[match] !== undefined) {
			return ' ';
		}
		return match;
	})),
};


export default {
	send: {
		params: {
			// uid: 'string',
			// role: [
			// 	{ type: 'string' },
			// 	{ type: 'array', items: 'string' },
			// ],
			// scope: { type: 'string', optional: true },
		},
		async handler(ctx) {
			const { uid, message } = ctx.params;

			if (message.ts) {
				const tsDiff = Math.abs(moment(message.ts).diff());
				if (tsDiff > 60000) {
					throw new Meteor.Error('error-message-ts-out-of-sync', 'Message timestamp is out of sync', {
						method: 'sendMessage',
						message_ts: message.ts,
						server_ts: new Date().getTime(),
					});
				} else if (tsDiff > 10000) {
					message.ts = new Date();
				}
			} else {
				message.ts = new Date();
			}

			if (message.msg) {
				const adjustedMessage = messageProperties.messageWithoutEmojiShortnames(message.msg);

				if (messageProperties.length(adjustedMessage) > RocketChat.settings.get('Message_MaxAllowedSize')) {
					throw new Meteor.Error('error-message-size-exceeded', 'Message size exceeds Message_MaxAllowedSize', {
						method: 'sendMessage',
					});
				}
			}

			const user = RocketChat.models.Users.findOneById(uid, {
				fields: {
					username: 1,
					name: 1,
				},
			});
			if (!user) {
				return;
			}
			const room = await ctx.call('authorization.canAccessRoom', { rid: message.rid, uid });
			if (!room) {
				return false;
			}

			const subscription = RocketChat.models.Subscriptions.findOneByRoomIdAndUserId(message.rid, uid);

			if (subscription && (subscription.blocked || subscription.blocker)) {
				// RocketChat.Notifications.notifyUser(uid, 'message', {
				// 	_id: Random.id(),
				// 	rid: room._id,
				// 	ts: new Date,
				// 	msg: TAPi18n.__('room_is_blocked', {}, user.language),
				// });
				throw new Meteor.Error('You can\'t send messages because you are blocked');
			}

			if ((room.muted || []).includes(user.username)) {
				// RocketChat.Notifications.notifyUser(uid, 'message', {
				// 	_id: Random.id(),
				// 	rid: room._id,
				// 	ts: new Date,
				// 	msg: TAPi18n.__('You_have_been_muted', {}, user.language),
				// });
				throw new Meteor.Error('You can\'t send messages because you have been muted');
			}

			if (message.alias == null && RocketChat.settings.get('Message_SetNameToAliasEnabled')) {
				message.alias = user.name;
			}

			// if (Meteor.settings.public.sandstorm) {
			// 	message.sandstormSessionId = this.connection.sandstormSessionId();
			// }

			RocketChat.metrics.messagesSent.inc(); // TODO This line needs to be moved to it's proper place. See the comments on: https://github.com/RocketChat/Rocket.Chat/pull/5736
			return ctx.call('message.create', { user, message, room });
		},
	},
};
