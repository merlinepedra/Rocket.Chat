import { Match, check } from 'meteor/check';

import { API } from '../../../../api/server';
import { Omnichannel } from '../../../../../server/sdk';

API.v1.addRoute('livechat/agents/:agentId/departments', { authRequired: true }, {
	get() {
		check(this.urlParams, {
			agentId: String,
		});
		check(this.queryParams, {
			enabledDepartmentsOnly: Match.Maybe(String),
		});

		const departments = Promise.await(Omnichannel.findAgentDepartments(
			this.userId,
			this.queryParams.enabledDepartmentsOnly && this.queryParams.enabledDepartmentsOnly === 'true',
			this.urlParams.agentId,
		));

		return API.v1.success(departments);
	},
});
