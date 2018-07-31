export class AppSubscriptionsConverter {
	constructor(orch) {
		this.orch = orch;
	}

	convertByRoomId(roomId) {
		const subscriptions = RocketChat.models.Subscriptions.findByRoomId(roomId).fetch();
		const result = [];
		for (const sub in subscriptions) {
			const subscription = subscriptions[sub];
			result.push(this.convertToApp(subscription));
		}
		console.log(result);
		return result;
	}

	convertToApp(subscription) {
		return {
			id: subscription._id
		};
	}
}
