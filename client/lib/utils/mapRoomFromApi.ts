import { IRoom } from '../../../definition/IRoom';
import { Serialized } from '../../../definition/Serialized';
import { mapMessageFromApi } from './mapMessageFromApi';

export const mapRoomFromApi = ({
	lastMessage,
	lm,
	ts,
	_updatedAt,
	jitsiTimeout,
	...room
}: Serialized<IRoom>): IRoom => ({
	...room,
	...(ts && { ts: new Date(ts) }),
	...(lm && { lm: new Date(lm) }),
	...(jitsiTimeout && { jitsiTimeout: new Date(jitsiTimeout) }),
	_updatedAt: new Date(_updatedAt),
	...(lastMessage && {
		lastMessage: mapMessageFromApi(lastMessage),
	}),
});
