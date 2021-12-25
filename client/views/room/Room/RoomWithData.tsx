// @ts-nocheck
import React, { ReactElement } from 'react';

import { useOpenedRoom } from '../../../lib/RoomManager';
import RoomProvider from '../providers/RoomProvider';
import Room from './Room';

const RoomWithData = (): ReactElement => {
	const rid = useOpenedRoom();
	return rid ? (
		<RoomProvider rid={rid}>
			<Room />
		</RoomProvider>
	) : null;
};

export default RoomWithData;
