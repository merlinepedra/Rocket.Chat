import { Db } from 'mongodb';

import { Authorization } from '../../sdk';
import { IOmnichannelService } from '../../sdk/types/IOmnichannelService';
import { ServiceClass } from '../../sdk/types/ServiceClass';
import { LivechatDepartmentAgentsRaw } from '../../../app/models/server/raw/LivechatDepartmentAgents';
import { SettingsRaw } from '../../../app/models/server/raw/Settings';
import { ILivechatDepartmentAgents } from '../../../definition/ILivechatDepartmentAgents';
import { IUser } from '../../../definition/IUser';
import { ISetting } from '../../../definition/ISetting';

export class OmnichannelService extends ServiceClass implements IOmnichannelService {
	protected name = 'omnichannel';

	private LivechatDepartmentAgentsModal: LivechatDepartmentAgentsRaw;

	private SettingsModal: SettingsRaw;


	constructor(db: Db) {
		super();

		this.LivechatDepartmentAgentsModal = new LivechatDepartmentAgentsRaw(db.collection('rocketchat_livechat_department_agents'));
		this.SettingsModal = new SettingsRaw(db.collection('rocketchat_settings'));
	}

	async findAgentDepartments(uid: IUser['_id'], enabledDepartmentsOnly: boolean, agentId: ILivechatDepartmentAgents['agentId']): Promise<{departments: ILivechatDepartmentAgents[]}> {
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

	async findAppearance(uid: IUser['_id']): Promise<{appearance: ISetting[]}> {
		if (!await Authorization.hasPermission(uid, 'view-livechat-manager')) {
			throw new Error('error-not-authorized');
		}
		const query = {
			_id: {
				$in: [
					'Livechat_title',
					'Livechat_title_color',
					'Livechat_enable_message_character_limit',
					'Livechat_message_character_limit',
					'Livechat_show_agent_info',
					'Livechat_show_agent_email',
					'Livechat_display_offline_form',
					'Livechat_offline_form_unavailable',
					'Livechat_offline_message',
					'Livechat_offline_success_message',
					'Livechat_offline_title',
					'Livechat_offline_title_color',
					'Livechat_offline_email',
					'Livechat_conversation_finished_message',
					'Livechat_registration_form',
					'Livechat_name_field_registration_form',
					'Livechat_email_field_registration_form',
					'Livechat_registration_form_message',
					'Livechat_conversation_finished_text',
				],
			},
		};

		return {
			appearance: await this.SettingsModal.find(query).toArray(),
		};
	}
}
