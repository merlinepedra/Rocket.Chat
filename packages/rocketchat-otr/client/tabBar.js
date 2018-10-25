Meteor.startup(function() {
	Tracker.autorun(function() {
		const crypto = window.crypto || window.msCrypto;
		if (RocketChat.settings.get('OTR_Enable') && crypto) {
			RocketChat.OTR.crypto = crypto.subtle || crypto.webkitSubtle;
			RocketChat.OTR.enabled.set(true);
			RocketChat.TabBar.addButton({
				groups: ['direct'],
				id: 'otr',
				i18nTitle: 'OTR',
				icon: 'key',
				template: 'otrFlexTab',
				order: 11,
			});
		} else {
			RocketChat.OTR.enabled.set(false);
			RocketChat.TabBar.removeButton('otr');
		}
	});
});
