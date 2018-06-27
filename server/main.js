import '/imports/startup/server';
import { init, connect } from 'rocket.chat.mqtt';

Meteor.startup(function() {
	const options = init({
		Subscriptions: RocketChat.models.Subscriptions.model.rawCollection()
	});
	connect(options);
});
