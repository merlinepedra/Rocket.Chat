// @ts-nocheck
import { Box } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

const Info = (props): ReactElement => (
	<Box mbe='x4' is='span' fontScale='p3' color='hint' withTruncatedText {...props} />
);

export default Info;
