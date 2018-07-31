export class AppSubscriptionBridge {
	constructor(orch) {
		this.orch = orch;
	}

	async getByRoomId(roomId, appId) {
		return this.orch.getConverters().get('subscriptions').convertByRoomId(roomId);
	}
}
