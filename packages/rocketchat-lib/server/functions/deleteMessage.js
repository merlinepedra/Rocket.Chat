RocketChat.deleteMessage = function(message, user) {
	return Promise.await(RocketChat.Services.call('message.remove', { message, user }));
};
