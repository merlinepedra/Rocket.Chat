import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

import broker from '../../services';

// capture log in event
Accounts.onLogin((login) => {
	login.connection.presenceUserId = login.user._id;
	broker.call('presence.newConnection', {
		uid: login.user._id,
		connection: login.connection,
	});
});

// capture browser close/refresh event
Meteor.onConnection((connection) => {
	connection.onClose(async() => {
		if (connection.presenceUserId) {
			broker.call('presence.removeConnection', {
				uid: connection.presenceUserId,
				connectionId: connection.id,
			});
		}
	});
});

// capture log out event
Meteor.publish(null, function() {
	if (this.userId == null && this.connection.presenceUserId) {
		broker.call('presence.removeConnection', {
			uid: this.connection.presenceUserId,
			connectionId: this.connection.id,
		});
		delete this.connection.presenceUserId;
	}
	this.ready();
});

Meteor.methods({
	'UserPresence:setDefaultStatus'(status) {
		const uid = Meteor.userId();
		return broker.call('presence.setStatus', { uid, status });
	},
	'UserPresence:online'() {
		const uid = Meteor.userId();
		return broker.call('presence.setStatus', { uid, status: 'online' });
	},
	'UserPresence:away'() {
		const uid = Meteor.userId();
		return broker.call('presence.setStatus', { uid, status: 'away', connection: this.connection });
	},
});
