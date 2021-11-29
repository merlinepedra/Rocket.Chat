import { formatDuration, intervalToDuration } from 'date-fns';
import { useEffect, useState } from 'react';

export const useTimeDuration = (start: Date): string => {
	const [timeDuration, setTimeDuration] = useState('');
	useEffect(() => {
		const interval = setInterval(
			() => setTimeDuration(formatDuration(intervalToDuration({ start, end: new Date() }))),
			1000,
		);

		return (): void => {
			clearInterval(interval);
		};
	}, [start]);

	return timeDuration;
};
