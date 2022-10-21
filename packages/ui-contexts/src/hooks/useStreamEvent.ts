import { useEffect, useRef } from 'react';

import type { StreamEventsMap } from '../lib/streams';
import { useStream } from './useStream';

export const useStreamEvent = <
	TStreamName extends keyof StreamEventsMap,
	TEventName extends Extract<keyof StreamEventsMap[TStreamName], string>,
	TEffect extends Extract<StreamEventsMap[TStreamName][TEventName], (...args: any[]) => void>,
>(
	streamName: TStreamName,
	eventName: TEventName,
	effect: TEffect,
	{
		enabled = true,
		...streamOptions
	}: {
		enabled?: boolean;
		retransmit?: boolean | undefined;
		retransmitToSelf?: boolean | undefined;
	} = {},
): void => {
	const subscribeTo = useStream(streamName, streamOptions);

	const effectRef = useRef(effect);
	effectRef.current = effect;

	useEffect(() => {
		if (!enabled) {
			return;
		}

		const effect = effectRef.current;

		return subscribeTo(eventName, effect);
	}, [enabled, eventName, subscribeTo]);
};
