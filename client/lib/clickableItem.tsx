import { css } from '@rocket.chat/css-in-js';
import { Box } from '@rocket.chat/fuselage';
import colors from '@rocket.chat/fuselage-tokens/colors.json';
import React, { ComponentProps, ComponentType, FunctionComponent, ReactElement } from 'react';

const clickable = css`
	cursor: pointer;
	border-bottom: 2px solid ${colors.n300} !important;

	&:hover,
	&:focus {
		background: ${colors.n100};
	}
`;

export type ClickableItemProps = Pick<ComponentProps<typeof Box>, 'className' | 'tabIndex'>;

// TODO remove border from here
export function clickableItem<TProps extends ClickableItemProps>(
	Component: ComponentType<TProps>,
): FunctionComponent<Omit<TProps, 'className' | 'tabIndex'>> {
	const WrappedComponent = (props: Omit<TProps, 'className' | 'tabIndex'>): ReactElement => (
		<Component className={clickable} tabIndex={0} {...(props as TProps)} />
	);

	WrappedComponent.displayName = `clickableItem(${
		Component.displayName ?? Component.name ?? 'Component'
	})`;

	return WrappedComponent;
}
