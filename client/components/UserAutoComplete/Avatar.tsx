// @ts-nocheck
import { Options } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

import UserAvatar from '../avatar/UserAvatar';

const Avatar = ({ value, ...props }): ReactElement => (
	<UserAvatar size={Options.AvatarSize} username={value} {...props} />
);

export default Avatar;
