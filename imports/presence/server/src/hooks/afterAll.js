const _processConnectionStatus = (current, { status }) => {
	if (status === 'online') {
		return 'online';
	}
	if (status !== 'offline') {
		return status;
	}
	return current;
};

export async function afterAll(ctx) {

	const { uid } = ctx.params;

	const key = { _id: uid };

	const user = await this.user().findOne(key);
	if (!user) { return; }

	const { statusDefault = 'online' } = user;
	const userSession = await this.userSession().findOne(key);
	const connection = statusDefault === 'offline' || !userSession ? 'offline' : userSession.connections.reduce(_processConnectionStatus, 'offline');

	this.user().updateOne(key, {
		$set: {
			status: connection === 'online' ? statusDefault : connection,
		},
	});
}
