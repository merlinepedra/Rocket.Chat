// @ts-nocheck
import { Options } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

import RoomAvatar from '../../../../components/avatar/RoomAvatar';

const Avatar = ({ _id, type, avatarETag, test: _test, ...props }): ReactElement => (
	<RoomAvatar size={Options.AvatarSize} room={{ type, _id, avatarETag }} {...props} />
);

export default Avatar;
