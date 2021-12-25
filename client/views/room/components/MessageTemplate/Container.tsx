// @ts-nocheck
import { Box, Margins } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

function Container({ children, ...props }): ReactElement {
	return (
		<Box rcx-message__container display='flex' mi='x4' flexDirection='column' {...props}>
			<Margins block='x2'>{children}</Margins>
		</Box>
	);
}

export default Container;
