import moment from 'moment';

import { Meteor } from 'meteor/meteor';
export default {
	async edit(ctx) {
		const { message, user } = ctx.params;
		const originalMessage = RocketChat.models.Messages.findOneById(message._id);
		const uid = user._id;
		if (!originalMessage || !originalMessage._id) {
			return;
		}

		const editAllowed = RocketChat.settings.get('Message_AllowEditing');
		const editOwn = originalMessage.u && originalMessage.u._id === uid;

		if ((!editAllowed || !editOwn) && ! await RocketChat.Services.call('authorization.hasPermission', { uid, permission: 'edit-message', scope: message.rid })) {
			throw new Meteor.Error('error-action-not-allowed', 'Message editing not allowed', { method: 'updateMessage', action: 'Message_editing' });
		}

		const blockEditInMinutes = RocketChat.settings.get('Message_AllowEditing_BlockEditInMinutes');
		if (typeof blockEditInMinutes === 'number' && blockEditInMinutes !== 0) {
			let currentTsDiff;
			let msgTs;

			if (typeof originalMessage.ts === 'number') {
				msgTs = moment(originalMessage.ts);
			}
			if (msgTs) {
				currentTsDiff = moment().diff(msgTs, 'minutes');
			}
			if (currentTsDiff > blockEditInMinutes) {
				throw new Meteor.Error('error-message-editing-blocked', 'Message editing is blocked', { method: 'updateMessage' });
			}
		}

		// It is possible to have an empty array as the attachments property, so ensure both things exist
		if (originalMessage.attachments && originalMessage.attachments.length > 0 && originalMessage.attachments[0].description !== undefined) {
			message.attachments = originalMessage.attachments;
			message.attachments[0].description = message.msg;
			message.msg = originalMessage.msg;
		}

		message.u = originalMessage.u;
		return RocketChat.Services.call('message.update', { message, user, originalMessage });
	},
};
