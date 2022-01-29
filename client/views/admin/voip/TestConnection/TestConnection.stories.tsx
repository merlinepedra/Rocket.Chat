import { Box } from '@rocket.chat/fuselage';
import React, { ReactElement, useState } from 'react';

import { TestConnection } from '.';

export default {
	title: 'Omnichannel/voip/TestConnection',
	component: TestConnection,
};

export const Default = (): ReactElement => {
	const [status, setStatus] = useState<'default' | 'loading' | 'failed' | 'success'>('default');
	const [disabled, setDisabled] = useState(false);

	const onClick = () => {
		setDisabled(true);
		setStatus('loading');

		setTimeout(() => {
			setDisabled(false);
			setStatus('success');
		}, 2000);
	};

	return (
		<Box width='500px'>
			<TestConnection status={status} disabled={disabled} onClick={onClick} />
		</Box>
	);
};
