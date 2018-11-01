import { Meteor } from 'meteor/meteor';
import { Apps } from '../lib/Apps';
import { AppServerOrchestrator } from './orchestrator';
import { RocketChat } from 'meteor/rocketchat:lib';


Meteor.startup(function _appServerOrchestrator() {
	Apps = new AppServerOrchestrator();

	if (Apps.isEnabled()) {
		Apps.load();
	}
});

RocketChat.settings.get('Apps_Framework_enabled', (key, isEnabled) => {
	// In case this gets called before `Meteor.startup`
	if (!(Apps instanceof AppServerOrchestrator)) {
		return;
	}

	if (isEnabled) {
		Apps.load();
	} else {
		Apps.unload();
	}
});

export {
	Apps,
};
