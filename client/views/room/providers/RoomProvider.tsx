import React, { ReactNode, useContext, useMemo } from 'react';

import { roomTypes } from '../../../../app/utils/client';
import { IRoom } from '../../../../definition/IRoom';
import { useUserId, useUserSubscription } from '../../../contexts/UserContext';
import { RoomSkeleton } from '../Room/RoomSkeleton';
import { RoomContext } from '../contexts/RoomContext';
import { useUserRoom } from '../hooks/useUserRoom';
import ToolboxProvider from './ToolboxProvider';

const fields = {};

export type Props = {
	children: ReactNode;
	rid: IRoom['_id'];
};

const RoomProvider = ({ rid, children }: Props): JSX.Element => {
	const uid = useUserId();
	const subscription = (useUserSubscription(rid, fields) as unknown) as IRoom;
	const _room = (useUserRoom(rid, fields) as unknown) as IRoom;

	const room = uid ? subscription || _room : _room;
	const context = useMemo(() => {
		if (!room) {
			return null;
		}
		room._id = rid;
		return {
			rid,
			room: { ...room, name: roomTypes.getRoomName(room.t, room) },
		};
	}, [room, rid]);

	if (!room) {
		return <RoomSkeleton />;
	}

	return (
		<RoomContext.Provider value={context}>
			<ToolboxProvider room={room}>{children}</ToolboxProvider>
		</RoomContext.Provider>
	);
};

export const useRoom = (): IRoom => {
	const context = useContext(RoomContext);
	if (!context) {
		throw Error('useRoom should be used only inside rooms context');
	}
	return context.room;
};

export default RoomProvider;
