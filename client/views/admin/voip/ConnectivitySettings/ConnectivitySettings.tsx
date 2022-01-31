import { Box, Field, FieldGroup, TextInput } from '@rocket.chat/fuselage';
import React, { ReactElement, useState } from 'react';

import { useTranslation } from '../../../../contexts/TranslationContext';

export const ConnectivitySettings = (): ReactElement => {
	const t = useTranslation();
	const [error, setError] = useState('');

	return (
		<>
			<Box color='default' fontScale='p1' marginBlockEnd='x16'>
				{t('Connectivity_Settings')}
			</Box>
			<FieldGroup>
				<Field>
					<Field.Label>{t('IP_Hostname')}</Field.Label>
					<Field.Row>
						<TextInput
							id='ip_hostname'
							placeholder={t('your_host_rocket_chat')}
							value={''}
							error={error}
							onChange={(): void => {
								setError('teste');
							}}
						/>
					</Field.Row>
					<Field.Error>{error}</Field.Error>
				</Field>
			</FieldGroup>
		</>
	);
};
