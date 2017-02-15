var Filter = Npm.require('bad-words');

RocketChat.callbacks.add({ hook: 'beforeSaveMessage', callback: function(message) {

	if (RocketChat.settings.get('Message_AllowBadWordsFilter')) {
		var badWordsList = RocketChat.settings.get('Message_BadWordsFilterList');
		var options;

		// Add words to the blacklist
		if (!!badWordsList && badWordsList.length) {
			options = {
				list: badWordsList.split(',')
			};
		}
		var filter = new Filter(options);
		message.msg = filter.clean(message.msg);
	}

	return message;

}, priority: 1, id: 'filterBadWords' });
