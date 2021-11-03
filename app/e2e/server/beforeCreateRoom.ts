import { callbacks } from '../../callbacks/lib/callbacks';
import { settings } from '../../settings/server';
import type { IRoom } from '../../../definition/IRoom';

callbacks.add('beforeCreateRoom', ({ type, extraData }: { type: IRoom['t']; extraData: Pick<IRoom, 'encrypted'> }) => {
	if (
		settings.get('E2E_Enabled') && ((type === 'd' && settings.get('E2E_Enabled_Default_DirectRooms'))
		|| (type === 'p' && settings.get('E2E_Enabled_Default_PrivateRooms')))
	) {
		extraData.encrypted = extraData.encrypted ?? true;
	}
});
