import { Settings } from '../../../models/server/raw';
import { retrieveRegistrationStatus } from './retrieveRegistrationStatus';

export async function disconnectWorkspace() {
	const { connectToCloud } = retrieveRegistrationStatus();
	if (!connectToCloud) {
		return true;
	}

	await Settings.updateValueById('Register_Server', false);

	return true;
}
