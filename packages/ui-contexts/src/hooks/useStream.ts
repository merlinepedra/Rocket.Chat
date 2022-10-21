import { useContext, useMemo } from 'react';

import type { StreamEventsMap } from '../lib/streams';
import { ServerContext } from '../ServerContext';

export const useStream = <TStreamName extends keyof StreamEventsMap>(
	streamName: TStreamName,
	options?: {
		retransmit?: boolean;
		retransmitToSelf?: boolean;
	},
): (<
	TEventName extends Extract<keyof StreamEventsMap[TStreamName], string>,
	TCallback extends Extract<StreamEventsMap[TStreamName][TEventName], (...args: any[]) => void>,
>(
	eventName: TEventName,
	callback: TCallback,
) => () => void) => {
	const { getStream } = useContext(ServerContext);

	return useMemo(() => getStream(streamName, options), [getStream, streamName, options]);
};
