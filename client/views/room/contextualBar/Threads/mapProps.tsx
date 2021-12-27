import React, { ComponentType, ReactElement } from 'react';

type InputProps = {
	replies?: unknown[];
	tcount?: number;
};

type OutputProps = {
	replies: unknown;
	participants?: unknown;
};

export function mapProps<TProps>(
	Component: ComponentType<TProps & OutputProps>,
): ComponentType<Omit<TProps, keyof OutputProps> & InputProps> {
	type WrappedComponentProps = Omit<TProps, keyof OutputProps> & InputProps;

	const WrappedComponent = ({
		replies = [],
		tcount = 0,
		...props
	}: WrappedComponentProps): ReactElement => (
		<Component replies={tcount} participants={replies?.length} {...(props as TProps)} />
	);

	WrappedComponent.displayName = `mapProps(${
		Component.displayName ?? Component.name ?? 'Component'
	})`;

	return WrappedComponent;
}
