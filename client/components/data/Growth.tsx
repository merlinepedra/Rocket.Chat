// @ts-nocheck
import { Box } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

import NegativeGrowthSymbol from './NegativeGrowthSymbol';
import PositiveGrowthSymbol from './PositiveGrowthSymbol';

function Growth({ children, ...props }): ReactElement | null {
	if (children === 0) {
		return null;
	}

	return (
		<Box is='span' color={children < 0 ? 'danger' : 'success'} {...props}>
			{children < 0 ? <NegativeGrowthSymbol /> : <PositiveGrowthSymbol />}
			{String(Math.abs(children))}
		</Box>
	);
}

export default Growth;
