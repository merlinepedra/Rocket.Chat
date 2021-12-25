// @ts-nocheck
import { Box, Icon } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

const Item = ({ children, icon, ...props }): ReactElement => (
	<Box is='li' marginBlockEnd='x8' display='flex' alignItems='center' color='default' {...props}>
		{icon === 'check' && <Icon name='check' size='x20' marginInlineEnd='x8' color='primary' />}
		{icon === 'circle' && (
			<Icon name='circle' size='x8' marginInlineStart='x8' marginInlineEnd='x12' color='default' />
		)}
		{children}
	</Box>
);

export default Item;
