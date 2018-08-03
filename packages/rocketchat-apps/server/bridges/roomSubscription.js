export class AppRoomSubscriptionBridge {
	constructor(orch) {
		this.orch = orch;
	}

	async getByRoomId(roomId, appId) {
		return this.orch.getConverters().get('roomSubscriptions').convertByRoomId(roomId);
	}
}
