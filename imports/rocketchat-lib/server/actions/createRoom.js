export default {
	createRoom(ctx) {
		const { name, type, members, readOnly, customFields, extraData, uid } = ctx.params;
		const { username } = RocketChat.models.Users.findOneById(uid);
		return RocketChat.createRoom(type, name, username, members, readOnly, { customFields, ...extraData });
	},
};
