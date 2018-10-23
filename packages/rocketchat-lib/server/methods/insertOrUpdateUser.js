Meteor.methods({
	insertOrUpdateUser(userData) {
		check(userData, Object);

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'insertOrUpdateUser' });
		}
		const user = RocketChat.saveUser(Meteor.userId(), userData);
		if (userData.customFields) {
			RocketChat.saveCustomFields(Meteor.userId(), userData.customFields);
		}
		return user;
	},
});
