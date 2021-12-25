// @ts-nocheck
import { Box } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

import { useTranslation } from '../../../../contexts/TranslationContext';

export default function NewBot(): ReactElement {
	const t = useTranslation();
	return (
		<Box
			pb='x20'
			fontScale='h4'
			key='bots'
			dangerouslySetInnerHTML={{ __html: t('additional_integrations_Bots') }}
		/>
	);
}
