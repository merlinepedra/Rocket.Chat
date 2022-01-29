import { Box, Icon, Throbber } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

import { useTranslation } from '../../../../contexts/TranslationContext';

type ConnectionStatusPropsType = {
	status: 'default' | 'loading' | 'failed' | 'success';
};

export const ConnectionStatus = ({ status }: ConnectionStatusPropsType): ReactElement => {
	const t = useTranslation();
	switch (status) {
		case 'loading':
			return <Throbber disabled size={12} />;
		case 'failed':
			return (
				<Box display='flex' alignItems='center'>
					<Icon color='danger' name='error-circle' mie='4px' />
					<Box fontScale='c1'>{t('Connection_Failed')}</Box>
				</Box>
			);
		case 'success':
			return (
				<Box display='flex' alignItems='center'>
					<Icon color='success' name='success-circle' mie='4px' />
					<Box fontScale='c1'>{t('Connection_is_working')}</Box>
				</Box>
			);
	}

	return <div></div>;
};
