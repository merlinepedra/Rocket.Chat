// @ts-nocheck
import { css } from '@rocket.chat/css-in-js';
import { Box } from '@rocket.chat/fuselage';
import React, { memo, ReactElement } from 'react';

const GenericItem = ({ href, active, children, ...props }): ReactElement => (
	<Box
		is='a'
		color='default'
		pb='x8'
		pi='x24'
		href={href}
		className={[
			active && 'active',
			css`
				&:hover,
				&:focus,
				&.active:focus,
				&.active:hover {
					background-color: var(--sidebar-background-light-hover);
				}

				&.active {
					background-color: var(--sidebar-background-light-active);
				}
			`,
		].filter(Boolean)}
		{...props}
	>
		<Box mi='neg-x4' display='flex' flexDirection='row' alignItems='center'>
			{children}
		</Box>
	</Box>
);

export default memo(GenericItem);
