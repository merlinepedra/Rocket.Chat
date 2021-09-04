import { IUser } from '../../../definition/IUser';
import { ILivechatDepartmentAgents } from '../../../definition/ILivechatDepartmentAgents';

export interface IOmnichannelService {
	findAgentDepartments(uid: IUser['_id'], enabledDepartmentsOnly: boolean, agentId: ILivechatDepartmentAgents['agentId']): Promise<unknown>;
}
