import { retrieveRegistrationStatus } from './retrieveRegistrationStatus';
import { getWorkspaceAccessTokenWithScope } from './getWorkspaceAccessTokenWithScope';
import { settings } from '../../../settings/server';
import { Settings } from '../../../models/server/raw';
import { isDateSetting } from '../../../../definition/ISetting';

export async function getWorkspaceAccessToken(forceNew = false, scope = '', save = true): Promise<string> {
	const { connectToCloud, workspaceRegistered } = retrieveRegistrationStatus();

	if (!connectToCloud || !workspaceRegistered) {
		return '';
	}

	const expires = await Settings.findOneById('Cloud_Workspace_Access_Token_Expires_At');
	const now = new Date();

	if (!expires || !isDateSetting(expires)) {
		return '';
	}

	if (now < expires.value && !forceNew) {
		return settings.get<string>('Cloud_Workspace_Access_Token');
	}

	const accessToken = getWorkspaceAccessTokenWithScope(scope);

	if (save) {
		await Promise.all([
			Settings.updateValueById('Cloud_Workspace_Access_Token', accessToken.token),
			Settings.updateValueById('Cloud_Workspace_Access_Token_Expires_At', accessToken.expiresAt),
		]);
	}

	return accessToken.token;
}
