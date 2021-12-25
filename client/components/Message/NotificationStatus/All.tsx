// @ts-nocheck
import React, { ReactElement } from 'react';

import NotificationStatus from './NotificationStatus';

function All(props): ReactElement {
	return <NotificationStatus label='mention-all' bg='#F38C39' {...props} />;
}

export default All;
