// @ts-nocheck
import { Box } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

function NotificationStatus({ t = (e): void => e, label, ...props }): ReactElement {
	return <Box width='x8' aria-label={t(label)} borderRadius='full' height='x8' {...props} />;
}

export default NotificationStatus;
