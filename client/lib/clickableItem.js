import React from 'react';
import { css } from '@rocket.chat/css-in-js';
import colors from '@rocket.chat/fuselage-tokens/colors';

// TODO remove border from here
export function clickableItem(WrappedComponent) {
	const clickable = css`
		border-bottom: 2px solid ${ colors.n300 } !important;
	`;
	return (props) => <WrappedComponent className={clickable} tabIndex={0} {...props}/>;
}
