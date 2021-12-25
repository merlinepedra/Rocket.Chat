// @ts-nocheck
import React, { ReactElement } from 'react';

import UserAvatar from '../../../../components/avatar/UserAvatar';

const Avatar = ({ username, ...props }): ReactElement => (
	<UserAvatar title={username} username={username} {...props} />
);

export default Avatar;
