import { Db } from 'mongodb';

import { IOmnichannelService } from '../../sdk/types/IOmnichannelService';
import { ServiceClass } from '../../sdk/types/ServiceClass';
import { LivechatDepartmentAgentsRaw } from '../../../app/models/server/raw/LivechatDepartmentAgents';
import { Authorization } from '../../sdk';
import { ILivechatDepartmentAgents } from '../../../definition/ILivechatDepartmentAgents';
import { IUser } from '../../../definition/IUser';

export class OmnichannelService extends ServiceClass implements IOmnichannelService {
	protected name = 'omnichannel';

	private LivechatDepartmentAgentsModal: LivechatDepartmentAgentsRaw;

	constructor(db: Db) {
		super();

		this.LivechatDepartmentAgentsModal = new LivechatDepartmentAgentsRaw(db.collection('rocketchat_livechat_department_agents'));
	}

	async findAgentDepartments(uid: IUser['_id'], enabledDepartmentsOnly: boolean, agentId: ILivechatDepartmentAgents['agentId']): Promise<unknown> {
		if (!await Authorization.hasPermission(uid, 'view-l-room')) {
			throw new Error('error-not-authorized');
		}

		if (enabledDepartmentsOnly) {
			return {
				departments: await this.LivechatDepartmentAgentsModal.findActiveDepartmentsByAgentId(agentId).toArray(),
			};
		}

		return {
			departments: await this.LivechatDepartmentAgentsModal.find({ agentId }).toArray(),
		};
	}
}
