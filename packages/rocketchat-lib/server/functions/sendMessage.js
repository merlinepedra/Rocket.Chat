RocketChat.sendMessage = function(user, message, room, upsert = false) {
	if (!user || !message || !room._id) {
		return false;
	}
	return Promise.await(RocketChat.Services.call('message.create', { user, message, room, upsert }));
};
