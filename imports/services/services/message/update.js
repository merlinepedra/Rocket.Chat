import { Meteor } from 'meteor/meteor';
export default {
	async update(ctx) {
		let { message } = ctx.params;
		const { user, originalMessage = RocketChat.models.Messages.findOneById(message._id) } = ctx.params;

		// For the Rocket.Chat Apps :)
		if (message && Apps && Apps.isLoaded()) {
			const appMessage = Object.assign({}, originalMessage, message);

			const prevent = await RocketChat.Services.call('apps.IPreMessageUpdatedPrevent', { message: appMessage });
			if (prevent) {
				throw new Meteor.Error('error-app-prevented-updating', 'A Rocket.Chat App prevented the message updating.');
			}

			let result = await RocketChat.Services.call('apps.IPreMessageUpdatedExtend', { message: appMessage });
			result = await RocketChat.Services.call('apps.IPreMessageUpdatedModify', { message: result });

			if (typeof result === 'object') {
				message = Object.assign(appMessage, result);
			}
		}

		// If we keep history of edits, insert a new message to store history information
		if (RocketChat.settings.get('Message_KeepHistory')) {
			RocketChat.models.Messages.cloneAndSaveAsHistoryById(message._id);
		}

		message.editedAt = new Date();
		message.editedBy = {
			_id: user._id,
			username: user.username,
		};

		const urls = message.msg.match(/([A-Za-z]{3,9}):\/\/([-;:&=\+\$,\w]+@{1})?([-A-Za-z0-9\.]+)+:?(\d+)?((\/[-\+=!:~%\/\.@\,\w]*)?\??([-\+=&!:;%@\/\.\,\w]+)?(?:#([^\s\)]+))?)?/g) || [];
		message.urls = urls.map((url) => ({ url }));

		message = RocketChat.callbacks.run('beforeSaveMessage', message);

		const tempid = message._id;
		delete message._id;

		RocketChat.models.Messages.update({ _id: tempid }, { $set: message });

		const room = RocketChat.models.Rooms.findOneById(message.rid);

		if (Apps && Apps.isLoaded()) {
			// This returns a promise, but it won't mutate anything about the message
			// so, we don't really care if it is successful or fails
			RocketChat.Services.call('apps.IPostMessageUpdated', { message });
		}

		RocketChat.callbacks.run('afterSaveMessage', RocketChat.models.Messages.findOneById(tempid), room, user._id);
	},
};
