Meteor.startup ->
	RocketChat.ChannelSettings.addOption
		id: 'mail-messages'
		template: 'channelSettingsMailMessages'
		validation: ->
			return RocketChat.authz.hasAllPermission('mail-messages')

	RocketChat.callbacks.add { hook: 'roomExit', callback: (mainNode) ->
		messagesBox = $('.messages-box')
		if messagesBox.get(0)?
			instance = Blaze.getView(messagesBox.get(0))?.templateInstance()
			instance?.resetSelection(false)
	, priority: RocketChat.callbacks.priority.MEDIUM, id: 'room-exit-mail-messages' }
