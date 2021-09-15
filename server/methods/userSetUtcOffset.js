import { check } from 'meteor/check';

import { Users } from '../../app/models';

function userSetUtcOffset(utcOffset) {
	check(utcOffset, Number);

	if (this.userId == null) {
		return;
	}

	return Users.setUtcOffset(this.userId, utcOffset);
}

userSetUtcOffset.rule = {
	userId() {
		return true;
	},
	numRequests: 1,
	timeInterval: 60000,
};

export default userSetUtcOffset;
