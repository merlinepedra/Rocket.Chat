// @ts-nocheck
import React, { memo, ReactElement } from 'react';

import { useRoomAvatarPath } from '../../contexts/AvatarUrlContext';
import BaseAvatar from './BaseAvatar';

function RoomAvatar({ room, ...rest }): ReactElement {
	const getRoomPathAvatar = useRoomAvatarPath();
	const { url = getRoomPathAvatar(room), ...props } = rest;
	return <BaseAvatar url={url} {...props} />;
}

export default memo(RoomAvatar);
