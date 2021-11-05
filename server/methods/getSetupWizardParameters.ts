import { Meteor } from 'meteor/meteor';

import { Settings } from '../../app/models/server/raw';

Meteor.methods({
	async getSetupWizardParameters() {
		const settings = await Settings.findSetupWizardSettings().toArray();
		const allowStandaloneServer = process.env.DEPLOY_PLATFORM !== 'rocket-cloud';

		return {
			settings,
			allowStandaloneServer,
		};
	},
});
