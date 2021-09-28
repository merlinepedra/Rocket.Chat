import { Meteor } from 'meteor/meteor';

import { onValidateLicenses } from '../../app/license/server/license';
import { registerToggleableFeature } from '../lib/featureToggle';
import { SeatsCap } from '../configuration/seatsCap';

const update = registerToggleableFeature(new SeatsCap());

Meteor.startup(() => {
	onValidateLicenses(update);
});
