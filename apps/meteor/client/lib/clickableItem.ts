import { css } from '@rocket.chat/css-in-js';
import { Box, Palette } from '@rocket.chat/fuselage';
import { createElement, ComponentType, FunctionComponent, ReactElement, ComponentProps } from 'react';

// TODO remove border from here.
export const clickableItem = <TProps extends Pick<ComponentProps<typeof Box>, 'className' | 'tabIndex'>>(
	Component: ComponentType<TProps>,
): FunctionComponent<TProps> => {
	const clickable = css`
		cursor: pointer;
		&:hover,
		&:focus {
			background: ${Palette.surface['surface-tint']};
		}
		border-bottom: 2px solid ${Palette.stroke['stroke-extra-light']} !important;
	`;

	const WrappedComponent = (props: TProps): ReactElement => createElement(Component, { className: clickable, tabIndex: 0, ...props });

	WrappedComponent.displayName = `clickableItem(${Component.displayName ?? Component.name ?? 'Component'})`;

	return WrappedComponent;
};
