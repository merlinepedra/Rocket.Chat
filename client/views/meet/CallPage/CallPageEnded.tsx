import { Box } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

import { useTranslation } from '../../../contexts/TranslationContext';

const CallPageEnded = (): ReactElement => {
	const t = useTranslation();

	return (
		<Box
			minHeight='90%'
			display='flex'
			justifyContent='center'
			alignItems='center'
			color='white'
			fontSize='s1'
		>
			{t('Call_declined')}
		</Box>
	);
};

export default CallPageEnded;
