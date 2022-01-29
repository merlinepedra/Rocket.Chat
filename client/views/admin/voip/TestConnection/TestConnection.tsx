import { Box, Button } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

import { ConnectionStatus } from '.';
import { useTranslation } from '../../../../contexts/TranslationContext';

type TestConnectionPropsType = {
	status: 'default' | 'loading' | 'failed' | 'success';
	disabled: boolean;
	onClick: () => void;
};

export const TestConnection = ({ status, disabled, onClick }: TestConnectionPropsType): ReactElement => {
	const t = useTranslation();

	return (
		<Box display='flex' justifyContent='space-between' alignItems='center'>
			<ConnectionStatus status={status} />
			<Button primary small disabled={disabled} onClick={onClick}>
				{t('Test_Connection')}
			</Button>
		</Box>
	);
};
