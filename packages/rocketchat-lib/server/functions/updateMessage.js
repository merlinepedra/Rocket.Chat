RocketChat.updateMessage = function(message, user, originalMessage) {
	return Promise.await(RocketChat.Services.call('message.update', { message, user, originalMessage }));
};
