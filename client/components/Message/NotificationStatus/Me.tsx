// @ts-nocheck
import React, { ReactElement } from 'react';

import NotificationStatus from './NotificationStatus';

function Me(props): ReactElement {
	return <NotificationStatus label='Me' bg='danger-500' {...props} />;
}

export default Me;
