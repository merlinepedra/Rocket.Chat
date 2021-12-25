// @ts-nocheck
import React, { ReactElement } from 'react';

import { useUserSubscription } from '../../../contexts/UserContext';
import ParentRoom from './ParentRoom';
import ParentRoomWithEndpointData from './ParentRoomWithEndpointData';

const ParentRoomWithData = ({ room }): ReactElement => {
	const subscription = useUserSubscription(room.prid);

	if (subscription) {
		return <ParentRoom room={subscription} />;
	}

	return <ParentRoomWithEndpointData rid={room.prid} />;
};

export default ParentRoomWithData;
