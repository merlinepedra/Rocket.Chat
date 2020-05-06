import { check } from 'meteor/check';

import { Messages } from '../../models/server';

export const setSmsMessageUniqueID = (mid, smsUniqueID) => {
	check(mid, String);
	check(smsUniqueID, String);

	return Messages.setUniqueSmsIdByMessageId(mid, smsUniqueID);
};
