import { IMessage, isThreadMainMessage, IThreadMainMessage, Serialized } from '@rocket.chat/core-typings';

export const mapMessageFromApi = ({ attachments, tlm, ts, _updatedAt, webRtcCallEndTs, ...message }: Serialized<IMessage>): IMessage => ({
	...message,
	ts: new Date(ts),
	...(tlm && { tlm: new Date(tlm) }),
	_updatedAt: new Date(_updatedAt),
	...(webRtcCallEndTs && { webRtcCallEndTs: new Date(webRtcCallEndTs) }),
	...(attachments && {
		attachments: attachments.map(({ ts, ...attachment }) => ({
			...(ts && { ts: new Date(ts) }),
			...(attachment as any),
		})),
	}),
});

export const mapThreadMainMessageFromApi = (message: Serialized<IMessage>): IThreadMainMessage => {
	const mapped = mapMessageFromApi(message);

	if (!isThreadMainMessage(mapped)) {
		throw new Error('Message is not a thread main message');
	}

	return mapped;
};
