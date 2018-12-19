export default {
	name: 'apps',
	version: 1,
	settings: {
		$noVersionPrefix: true,
	},
	actions: {

		// CREATE MESSAGE

		IPreMessageSentPrevent({ params: { message } }) {
			return Apps.getBridges().getListenerBridge().messageEvent('IPreMessageSentPrevent', message);
		},
		IPreMessageSentExtend({ params: { message } }) {
			return Apps.getBridges().getListenerBridge().messageEvent('IPreMessageSentExtend', message);
		},
		IPreMessageSentModify({ params: { message } }) {
			return Apps.getBridges().getListenerBridge().messageEvent('IPreMessageSentModify', message);
		},
		IPostMessageSent({ params: { message } }) {
			return Apps.getBridges().getListenerBridge().messageEvent('IPostMessageSent', message);
		},

		// UPDATE MESSAGE

		IPreMessageUpdatedPrevent({ params: { message } }) {
			return Apps.getBridges().getListenerBridge().messageEvent('IPreMessageUpdatedPrevent', message);
		},
		IPreMessageUpdatedExtend({ params: { message } }) {
			return Apps.getBridges().getListenerBridge().messageEvent('IPreMessageUpdatedExtend', message);
		},
		IPreMessageUpdatedModify({ params: { message } }) {
			return Apps.getBridges().getListenerBridge().messageEvent('IPreMessageUpdatedModify', message);
		},
		IPostMessageUpdated({ params: { message } }) {
			return Apps.getBridges().getListenerBridge().messageEvent('IPostMessageUpdated', message);
		},

		// DELETE MESSAGE

		IPreMessageDeletePrevent({ params: { message } }) {
			return Apps.getBridges().getListenerBridge().messageEvent('IPreMessageDeletePrevent', message);
		},
		IPostMessageDeleted({ params: { message } }) {
			return Apps.getBridges().getListenerBridge().messageEvent('IPostMessageDeleted', message);
		},
	},
};
