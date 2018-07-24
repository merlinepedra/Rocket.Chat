import '/imports/startup/server';
import { init, connect } from 'rocket.chat.mqtt';
import { mq, queuePersistence as persistence } from 'meteor/rocketchat:lib';

Meteor.startup(function() {
	const options = init({
		Subscriptions: RocketChat.models.Subscriptions.model.rawCollection()
	});
	connect({
		mq,
		persistence,
		...options
	});
});
