//Trigger the trackPageView manually as the page views don't seem to be tracked
FlowRouter.triggers.enter([(route) => {
	if (window._paq) {
		const http = location.protocol;
		const slashes = http.concat('//');
		const host = slashes.concat(window.location.hostname);

		window._paq.push(['setCustomUrl', host + route.path]);
		window._paq.push(['trackPageView']);
	}
}]);

//Login page has manual switches
RocketChat.callbacks.add({ hook: 'loginPageStateChange', callback: (state) => {
	if (window._paq) {
		window._paq.push(['trackEvent', 'Navigation', 'Login Page State Change', state]);
	}
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'piwik-login-state-change' });

//Messsages
RocketChat.callbacks.add({ hook: 'afterSaveMessage', callback: (message) => {
	if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_messages')) {
		const room = ChatRoom.findOne({ _id: message.rid });
		window._paq.push(['trackEvent', 'Message', 'Send', room.name + ' (' + room._id + ')' ]);
	}
}, priority: 2000, id: 'trackEvents' });

//Rooms
RocketChat.callbacks.add({ hook: 'afterCreateChannel', callback: (owner, room) => {
	if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_rooms')) {
		window._paq.push(['trackEvent', 'Room', 'Create', room.name + ' (' + room._id + ')' ]);
	}
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'piwik-after-create-channel' });

RocketChat.callbacks.add({ hook: 'roomNameChanged', callback: (room) => {
	if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_rooms')) {
		window._paq.push(['trackEvent', 'Room', 'Changed Name', room.name + ' (' + room._id + ')' ]);
	}
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'piwik-room-name-changed' });

RocketChat.callbacks.add({ hook: 'roomTopicChanged', callback: (room) => {
	if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_rooms')) {
		window._paq.push(['trackEvent', 'Room', 'Changed Topic', room.name + ' (' + room._id + ')' ]);
	}
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'piwik-room-topic-changed' });

RocketChat.callbacks.add({ hook: 'roomTypeChanged', callback: (room) => {
	if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_rooms')) {
		window._paq.push(['trackEvent', 'Room', 'Changed Room Type', room.name + ' (' + room._id + ')' ]);
	}
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'piwik-room-type-changed' });

RocketChat.callbacks.add({ hook: 'archiveRoom', callback: (room) => {
	if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_rooms')) {
		window._paq.push(['trackEvent', 'Room', 'Archived', room.name + ' (' + room._id + ')' ]);
	}
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'piwik-archive-room' });

RocketChat.callbacks.add({ hook: 'unarchiveRoom', callback: (room) => {
	if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_rooms')) {
		window._paq.push(['trackEvent', 'Room', 'Unarchived', room.name + ' (' + room._id + ')' ]);
	}
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'piwik-unarchive-room' });

//Users
//Track logins and associate user ids with piwik
(() => {
	let oldUserId = null;

	Meteor.autorun(() => {
		const newUserId = Meteor.userId();
		if (oldUserId === null && newUserId) {
			if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_users')) {
				window._paq.push(['trackEvent', 'User', 'Login', newUserId ]);
				window._paq.push(['setUserId', newUserId]);
			}
		} else if (newUserId === null && oldUserId) {
			if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_users')) {
				window._paq.push(['trackEvent', 'User', 'Logout', oldUserId ]);
			}
		}
		oldUserId = Meteor.userId();
	});
})();

RocketChat.callbacks.add({ hook: 'userRegistered', callback: () => {
	if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_users')) {
		window._paq.push(['trackEvent', 'User', 'Registered']);
	}
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'piwik-user-resitered' });

RocketChat.callbacks.add({ hook: 'usernameSet', callback: () => {
	if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_users')) {
		window._paq.push(['trackEvent', 'User', 'Username Set']);
	}
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'piweik-username-set' });

RocketChat.callbacks.add({ hook: 'userPasswordReset', callback: () => {
	if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_users')) {
		window._paq.push(['trackEvent', 'User', 'Reset Password']);
	}
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'piwik-user-password-reset' });

RocketChat.callbacks.add({ hook: 'userConfirmationEmailRequested', callback: () => {
	if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_users')) {
		window._paq.push(['trackEvent', 'User', 'Confirmation Email Requested']);
	}
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'piwik-user-confirmation-email-requested' });

RocketChat.callbacks.add({ hook: 'userForgotPasswordEmailRequested', callback: () => {
	if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_users')) {
		window._paq.push(['trackEvent', 'User', 'Forgot Password Email Requested']);
	}
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'piwik-user-forgot-password-email-requested' });

RocketChat.callbacks.add({ hook: 'userStatusManuallySet', callback: (status) => {
	if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_users')) {
		window._paq.push(['trackEvent', 'User', 'Status Manually Changed', status]);
	}
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'piwik-user-status-manually-set' });

RocketChat.callbacks.add({ hook: 'userAvatarSet', callback: (service) => {
	if (window._paq && RocketChat.settings.get('PiwikAnalytics_features_users')) {
		window._paq.push(['trackEvent', 'User', 'Avatar Changed', service]);
	}
}, priority: RocketChat.callbacks.priority.MEDIUM, id: 'piwik-user-avatar-set' });
