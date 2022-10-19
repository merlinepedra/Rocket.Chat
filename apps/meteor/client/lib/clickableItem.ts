import { css } from '@rocket.chat/css-in-js';
import { Box } from '@rocket.chat/fuselage';
import colors from '@rocket.chat/fuselage-tokens/colors';
import { createElement, ComponentType, FunctionComponent, ReactElement, ComponentProps } from 'react';

// TODO remove border from here.
export const clickableItem = <TProps extends Pick<ComponentProps<typeof Box>, 'className' | 'tabIndex'>>(
	Component: ComponentType<TProps>,
): FunctionComponent<TProps> => {
	const clickable = css`
		cursor: pointer;
		&:hover,
		&:focus {
			background: ${colors.n100};
		}
		border-bottom: 2px solid ${colors.n300} !important;
	`;

	const WrappedComponent = (props: TProps): ReactElement => createElement(Component, { className: clickable, tabIndex: 0, ...props });

	WrappedComponent.displayName = `clickableItem(${Component.displayName ?? Component.name ?? 'Component'})`;

	return WrappedComponent;
};
