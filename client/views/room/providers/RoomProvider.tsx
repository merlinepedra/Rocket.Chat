import React, { ReactNode, useContext, useMemo } from 'react';

import { roomTypes } from '../../../../app/utils/client';
import { IRoom } from '../../../../definition/IRoom';
import { useUserId, useUserSubscription } from '../../../contexts/UserContext';
import { RoomSkeleton } from '../Room/RoomSkeleton';
import { RoomContext, RoomContextValue } from '../contexts/RoomContext';
import { useUserRoom } from '../hooks/useUserRoom';
import ToolboxProvider from './ToolboxProvider';

const fields = {};

export type Props = {
	children: ReactNode;
	rid: IRoom['_id'];
};

const openUserCard = () => {
	console.log('openUserCard');
};
const followMessage = () => {
	console.log('followMessage');
};
const unfollowMessage = () => {
	console.log('unfollowMessage');
};
const openDiscussion = () => {
	console.log('openDiscussion');
};
const openThread = () => {
	console.log('openThread');
};
const replyBroadcast = () => {
	console.log('replyBroadcast');
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
			actions: {
				openUserCard,
				followMessage,
				unfollowMessage,
				openDiscussion,
				openThread,
				replyBroadcast,
			},
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

export const useRoomActions = (): RoomContextValue['actions'] => {
	const context = useContext(RoomContext);
	if (!context) {
		throw Error('useRoom should be used only inside rooms context');
	}
	return context.actions;
};

export default RoomProvider;
