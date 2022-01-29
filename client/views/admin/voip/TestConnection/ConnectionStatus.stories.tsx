import React, { ReactElement } from 'react';

import { ConnectionStatus } from '.';

export default {
	title: 'Omnichannel/voip/ConnectionStatus',
	component: ConnectionStatus,
};

export const Loading = (): ReactElement => <ConnectionStatus status='loading' />;

export const Failed = (): ReactElement => <ConnectionStatus status='failed' />;

export const Success = (): ReactElement => <ConnectionStatus status='success' />;
