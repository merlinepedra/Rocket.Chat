import { Accordion, Box, Icon } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

import { useTranslation } from '../../../contexts/TranslationContext';
import { ConnectivitySettings } from './ConnectivitySettings';

export const AdminVoipSettingsPage = (): ReactElement => {
	const t = useTranslation();

	return (
		<Box marginInline='auto' width='full' maxWidth='x580'>
			<Accordion>
				<Accordion.Item
					title={
						<Box display='flex' fontScale='h4' alignItems='center'>
							<Icon name='customize' size={32} mie='8px' />
							{t('General_Settings')}
						</Box>
					}
					defaultExpanded
				>
					<ConnectivitySettings />
				</Accordion.Item>
			</Accordion>
		</Box>
	);
};
