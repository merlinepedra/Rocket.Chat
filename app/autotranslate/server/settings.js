import { Meteor } from 'meteor/meteor';

import { settings } from '../../settings';

Meteor.startup(function() {
	settings.add('AutoTranslate_Enabled', false, {
		type: 'boolean',
		group: 'Message',
		section: 'AutoTranslate',
		public: true,
	});
	settings.add('AutoTranslate_Engine', 'Google', {
		type: 'select',
		values: [{
			key: 'Google',
			i18nLabel: 'Google',
		}, {
			key: 'DeepL',
			i18nLabel: 'DeepL',
		}],
		group: 'Message',
		section: 'AutoTranslate',
		i18nLabel: 'AutoTranslate_Engine',
		enableQuery: { _id: 'AutoTranslate_Enabled', value: true },
	});
	settings.add('AutoTranslate_GoogleAPIKey', '', {
		type: 'string',
		group: 'Message',
		section: 'AutoTranslate',
		enableQuery: [
			{ _id: 'AutoTranslate_Enabled', value: true },
			{ _id: 'AutoTranslate_Engine', value: 'Google' },
		],
	});
	settings.add('AutoTranslate_DeepLAPIKey', '', {
		type: 'string',
		group: 'Message',
		section: 'AutoTranslate',
		enableQuery: [
			{ _id: 'AutoTranslate_Enabled', value: true },
			{ _id: 'AutoTranslate_Engine', value: 'DeepL' },
		],
	});
});
