import { Settings } from '../../../models/server/raw';
import { retrieveRegistrationStatus } from './retrieveRegistrationStatus';


export async function unregisterWorkspace(): Promise<boolean> {
	const { workspaceRegistered } = retrieveRegistrationStatus();
	if (!workspaceRegistered) {
		return true;
	}

	await Settings.updateMany({
		_id: {
			$in:
			[
				'Cloud_Workspace_Id',
				'Cloud_Workspace_Name',
				'Cloud_Workspace_Client_Id',
				'Cloud_Workspace_Client_Secret',
				'Cloud_Workspace_Client_Secret_Expires_At',
				'Cloud_Workspace_PublicKey',
				'Cloud_Workspace_Registration_Client_Uri',
			],
		},
	}, {
		$set: {
			value: undefined,
		},
	});

	return true;
}
