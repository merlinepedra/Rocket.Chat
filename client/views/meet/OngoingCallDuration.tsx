import { Box } from '@rocket.chat/fuselage';
import React, { FC, useEffect, useState } from 'react';

type OngoingCallDurationProps = {
	counter: number;
};

const OngoingCallDuration: FC<OngoingCallDurationProps> = ({ counter: defaultCounter = 0 }) => {
	const [counter, setCounter] = useState(defaultCounter);
	useEffect(() => {
		const interval = setInterval(() => setCounter((counter) => counter + 1), 1000);

		return (): void => {
			clearInterval(interval);
		};
	}, []);

	// TODO: use formatDuration
	return (
		<Box color='#E4E7EA' textAlign='center'>
			{new Date(counter * 1000).toISOString().substr(11, 8)}
		</Box>
	);
};

export default OngoingCallDuration;
