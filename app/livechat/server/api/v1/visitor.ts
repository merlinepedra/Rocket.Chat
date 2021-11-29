import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { API } from '../../../../api/server';
import { findGuest } from '../lib/livechat';
import { Livechat } from '../../lib/Livechat';

API.v1.addRoute('livechat/visitor.callStatus', {
	async post() {
		check(this.bodyParams, {
			token: String,
			callStatus: String,
			rid: String,
			callId: String,
		});

		const { token, callStatus, rid, callId } = this.bodyParams;
		const guest = await findGuest(token);
		if (!guest) {
			throw new Meteor.Error('invalid-token');
		}
		const status = callStatus;
		await Livechat.updateCallStatus(callId, rid, status, guest);
		return API.v1.success({ token, callStatus });
	},
});
