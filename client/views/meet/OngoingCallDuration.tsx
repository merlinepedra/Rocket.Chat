import { Box } from '@rocket.chat/fuselage';
import React, { ReactElement } from 'react';

import { useTimeDuration } from './hooks/useTimeDuration';

type OngoingCallDurationProps = {
	start: Date;
};

const OngoingCallDuration = ({ start }: OngoingCallDurationProps): ReactElement => {
	const duration = useTimeDuration(start);

	return (
		<Box color='#E4E7EA' textAlign='center'>
			{duration}
		</Box>
	);
};

export default OngoingCallDuration;
