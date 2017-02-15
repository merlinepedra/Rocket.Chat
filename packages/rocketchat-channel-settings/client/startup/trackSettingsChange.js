Meteor.startup(function() {
	const roomSettingsChangedCallback = (msg) => {
		Tracker.nonreactive(() => {
			if (msg.t === 'room_changed_privacy') {
				if (Session.get('openedRoom') === msg.rid) {
					const type = FlowRouter.current().route.name === 'channel' ? 'c' : 'p';
					RoomManager.close(type + FlowRouter.getParam('name'));

					const subscription = ChatSubscription.findOne({ rid: msg.rid });
					const route = subscription.t === 'c' ? 'channel' : 'group';
					FlowRouter.go(route, { name: subscription.name }, FlowRouter.current().queryParams);
				}
			}
		});

		return msg;
	};

	RocketChat.callbacks.add({ hook: 'streamMessage', callback: roomSettingsChangedCallback, priority: RocketChat.callbacks.priority.HIGH, id: 'room-settings-changed' });

	const roomNameChangedCallback = (msg) => {
		Tracker.nonreactive(() => {
			if (msg.t === 'r') {
				if (Session.get('openedRoom') === msg.rid) {
					const type = FlowRouter.current().route.name === 'channel' ? 'c' : 'p';
					RoomManager.close(type + FlowRouter.getParam('name'));
					FlowRouter.go(FlowRouter.current().route.name, { name: msg.msg }, FlowRouter.current().queryParams);
				}
			}
		});

		return msg;
	};

	RocketChat.callbacks.add({ hook: 'streamMessage', callback: roomNameChangedCallback, priority: RocketChat.callbacks.priority.HIGH, id: 'room-name-changed' });
});
