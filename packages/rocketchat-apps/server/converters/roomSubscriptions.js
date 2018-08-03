export class AppRoomSubscriptionsConverter {
	constructor(orch) {
		this.orch = orch;
	}

	convertByRoomId(roomId) {
		const roomSubscriptions = RocketChat.models.Subscriptions.findByRoomId(roomId).fetch();
		const result = [];
		for (const sub in roomSubscriptions) {
			const roomSubscription = roomSubscriptions[sub];
			result.push(this.convertToApp(roomSubscription));
		}
		return result;
	}

	convertToApp(roomSubscription) {
		let user;
		if (roomSubscription.u && roomSubscription.u._id) {
			const u = RocketChat.models.Users.findOneById(roomSubscription.u._id);
			user = {
				id: u._id,
				username: u.username
			};
		}
		return {
			id: roomSubscription._id,
			user
		};
	}
}
