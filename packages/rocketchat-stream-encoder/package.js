Package.describe({
	summary: '',
	version: '1.0.0',
	name: 'rocketchat:stream-encoder'
});


Package.onUse(function(api) {
	api.use(['underscore', 'ecmascript']);
	api.mainModule('index.js');
});

Npm.depends({
	'protocol-buffers-encodings': '1.1.0'
});
