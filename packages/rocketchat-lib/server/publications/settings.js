import { Meteor } from 'meteor/meteor';

Meteor.methods({
	'public-settings/get'(updatedAt) {
		this.unblock();
		const records = RocketChat.models.Settings.findNotHiddenPublic().fetch();

		if (updatedAt instanceof Date) {
			return {
				update: records.filter(function(record) {
					return record._updatedAt > updatedAt;
				}),
				remove: RocketChat.models.Settings.trashFindDeletedAfter(updatedAt, {
					hidden: {
						$ne: true,
					},
					public: true,
				}, {
					fields: {
						_id: 1,
						_deletedAt: 1,
					},
				}).fetch(),
			};
		}
		return records;
	},
	'private-settings/get'(updatedAt) {
		if (!Meteor.userId()) {
			return [];
		}
		this.unblock();
		if (!RocketChat.authz.hasPermission(Meteor.userId(), 'view-privileged-setting')) {
			return [];
		}
		const records = RocketChat.models.Settings.findNotHidden().fetch();
		if (updatedAt instanceof Date) {
			return {
				update: records.filter(function(record) {
					return record._updatedAt > updatedAt;
				}),
				remove: RocketChat.models.Settings.trashFindDeletedAfter(updatedAt, {
					hidden: {
						$ne: true,
					},
				}, {
					fields: {
						_id: 1,
						_deletedAt: 1,
					},
				}).fetch(),
			};
		}
		return records;
	},
});
