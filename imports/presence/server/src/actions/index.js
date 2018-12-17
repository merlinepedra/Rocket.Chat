import { newConnection } from './newConnection';
import { removeConnection } from './removeConnection';
import { removeLostConnections } from './removeLostConnections';
import { setStatus, setConnectionStatus } from './setStatus';
import updateUserPresence from './updateUserPresence';

export default {
	newConnection,
	removeConnection,
	removeLostConnections,
	setStatus,
	setConnectionStatus,
	updateUserPresence,
};
