// @ts-nocheck
import React, { ReactElement } from 'react';

import NotificationStatus from './NotificationStatus';

function Unread(props): ReactElement {
	return <NotificationStatus label='Unread' bg='primary-500' {...props} />;
}

export default Unread;
