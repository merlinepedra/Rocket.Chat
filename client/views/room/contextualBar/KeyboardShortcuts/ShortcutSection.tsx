// @ts-nocheck
import { Box, Divider } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

const ShortcutSection = ({ title, command }): ReactElement => (
	<Box is='section' mb='x16'>
		<Box fontScale='p4' fontWeight='700'>
			{title}
		</Box>
		<Divider />
		<Box fontScale='p3'>{command}</Box>
	</Box>
);

export default ShortcutSection;
