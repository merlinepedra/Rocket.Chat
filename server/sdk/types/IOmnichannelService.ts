import { IUser } from '../../../definition/IUser';
import { ISetting } from '../../../definition/ISetting';
import { ILivechatDepartmentAgents } from '../../../definition/ILivechatDepartmentAgents';

export interface IOmnichannelService {
	findAgentDepartments(uid: IUser['_id'], enabledDepartmentsOnly: boolean, agentId: ILivechatDepartmentAgents['agentId']): Promise<{departments: ILivechatDepartmentAgents[]}>;
	findAppearance(uid: IUser['_id']): Promise<{appearance: ISetting[]}>;
}
