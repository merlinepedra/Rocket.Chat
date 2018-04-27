import { AppMethods } from './communication';
import { AppServerOrchestrator } from './orchestrator';

import { AppManager } from '@rocket.chat/apps-engine/server/AppManager';

Meteor.startup(function _appServerOrchestrator() {
	// Ensure that everything is setup
	if (process.env[AppManager.ENV_VAR_NAME_FOR_ENABLING] !== 'true' && process.env[AppManager.SUPER_FUN_ENV_ENABLEMENT_NAME] !== 'true') {
		global.Apps = new AppMethods();
		return;
	}

	console.log('Orchestrating the app piece...');
	global.Apps = new AppServerOrchestrator();

	global.Apps.getManager().load()
		.then((affs) => console.log(`...done loading ${ affs.length }! ;)`))
		.catch((err) => console.warn('...failed!', err));
});
