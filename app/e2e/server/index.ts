import { callbacks } from '../../callbacks/lib/callbacks';
import { Notifications } from '../../notifications/server';
import type { IUser } from '../../../definition/IUser';
import type { IRoom } from '../../../definition/IRoom';
import './settings';
import './beforeCreateRoom';
import './methods/setUserPublicAndPrivateKeys';
import './methods/getUsersOfRoomWithoutKey';
import './methods/updateGroupKey';
import './methods/setRoomKeyID';
import './methods/fetchMyKeys';
import './methods/requestSubscriptionKeys';

callbacks.add('afterJoinRoom', (_user: IUser, room: IRoom) => {
	Notifications.notifyRoom('e2e.keyRequest', room._id, room.e2eKeyId);
}, callbacks.priority.MEDIUM, 'e2e');
