const logger = new Logger('getRoles');
let roleCustomFields = [];
RocketChat.settings.get('Accounts_CustomFields', (key, value) => {
	roleCustomFields = [];

	if (!value.trim()) {
		return;
	}

	try {
		const customFieldsOnServer = JSON.parse(value.trim());
		Object.keys(customFieldsOnServer).forEach((key) => {
			const element = customFieldsOnServer[key];
			const elementIsRole = element.hasOwnProperty('modifyRecordField') && element.modifyRecordField.field && element.modifyRecordField.field === 'roles';
			if (elementIsRole) {
				if (element.options && Array.isArray(element.options)) {
					roleCustomFields = roleCustomFields.concat(element.options.map((option) => ({ _id: option })));
				}
			}
		});
	} catch (e) {
		logger.warn(`The JSON specified for "Accounts_CustomFields" is invalid. The following error was thrown: ${ e }`);
	}
});


RocketChat.authz.getRoles = function() {
	let roles = RocketChat.models.Roles.find().fetch();
	if (roleCustomFields.length) {
		roles = roles.concat(roleCustomFields);
	}
	return roles;
};
