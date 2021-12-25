// @ts-nocheck
import React, { ReactElement } from 'react';

import UserCard from '../../../../components/UserCard';

const Username = ({ username, status, ...props }): ReactElement => (
	<UserCard.Username name={username} status={status} {...props} />
);

export default Username;
