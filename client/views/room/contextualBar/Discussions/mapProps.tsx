// @ts-nocheck
import React, { ComponentType, ReactElement } from 'react';

export function mapProps(Component): ComponentType {
	const WrappedComponent = ({ msg, username, tcount, ts, ...props }): ReactElement => (
		<Component replies={tcount} username={username} msg={msg} ts={ts} {...props} />
	);

	WrappedComponent.displayName = `mapProps(${
		Component.displayName ?? Component.name ?? 'Component'
	})`;

	return WrappedComponent;
}
