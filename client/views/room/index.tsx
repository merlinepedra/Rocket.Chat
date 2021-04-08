import React, { FC } from 'react';

import { IRoom } from '../../../definition/IRoom';
import Room from './Room/Room';
import RoomProvider from './providers/RoomProvider';

const Provider: FC<{ rid: IRoom['_id'] }> = (props) => (
	<RoomProvider rid={props.rid}>
		<Room />
	</RoomProvider>
);

export default Provider;
