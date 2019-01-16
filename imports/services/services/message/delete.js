import moment from 'moment';

import { Meteor } from 'meteor/meteor';

export default {
	async delete(ctx) {
		const { mid, uid } = ctx.params;
		const message = RocketChat.models.Messages.findOneById(mid, {
			fields: {
				u: 1,
				rid: 1,
				file: 1,
				ts: 1,
			},
		});
		if (message == null) {
			throw new Meteor.Error('error-action-not-allowed', 'Not allowed', {
				method: 'deleteMessage',
				action: 'Delete_message',
			});
		}
		const forceDelete = await ctx.call('authorization.hasPermission', { uid, permission: 'force-delete-message', scope: message.rid });
		const hasPermission = await ctx.call('authorization.hasPermission', { uid, permission: 'delete-message', scope: message.rid });
		const deleteAllowed = RocketChat.settings.get('Message_AllowDeleting');
		const deleteOwn = message && message.u && message.u._id === uid;
		if (!(hasPermission || (deleteAllowed && deleteOwn)) && !(forceDelete)) {
			throw new Meteor.Error('error-action-not-allowed', 'Not allowed', {
				method: 'deleteMessage',
				action: 'Delete_message',
			});
		}
		const blockDeleteInMinutes = RocketChat.settings.get('Message_AllowDeleting_BlockDeleteInMinutes') || 0;
		if (blockDeleteInMinutes !== 0 && !forceDelete) {
			if (message.ts == null) {
				return;
			}
			const msgTs = moment(message.ts);
			if (msgTs == null) {
				return;
			}
			const currentTsDiff = moment().diff(msgTs, 'minutes');
			if (currentTsDiff > blockDeleteInMinutes) {
				throw new Meteor.Error('error-message-deleting-blocked', 'Message deleting is blocked', {
					method: 'deleteMessage',
				});
			}
		}
		return ctx.call('message.remove', { message, uid });
	},
};
