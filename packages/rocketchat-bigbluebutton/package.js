Package.describe({
	name: 'rocketchat:bigbluebutton',
	version: '0.0.1',
	summary: 'Rocket.Chat big blue button implementation',
	git: ''
});

Package.onUse(function(api) {
	api.use('ecmascript');

	api.mainModule('lib/bigbluebutton-api.js');
});
