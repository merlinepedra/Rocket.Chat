RocketChat.callbacks.add({ hook: 'livechat.offlineMessage', callback: (data) => {
	if (!RocketChat.settings.get('Livechat_webhook_on_offline_msg')) {
		return data;
	}

	const postData = {
		type: 'LivechatOfflineMessage',
		sentAt: new Date(),
		visitor: {
			name: data.name,
			email: data.email
		},
		message: data.message
	};

	RocketChat.Livechat.sendRequest(postData);
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'livechat-send-email-offline-message' });
