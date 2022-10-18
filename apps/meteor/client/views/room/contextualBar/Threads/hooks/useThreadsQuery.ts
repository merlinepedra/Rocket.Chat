import { IMessage, IRoom, isThreadMainMessage, IThreadMainMessage } from '@rocket.chat/core-typings';
import { useEndpoint, useStream } from '@rocket.chat/ui-contexts';
import { useInfiniteQuery, UseInfiniteQueryOptions, UseInfiniteQueryResult, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getIntegerConfig } from '../../../../../lib/utils/getConfig';
import { mapMessageFromApi } from '../../../../../lib/utils/mapMessageFromApi';
import { useRoom } from '../../../contexts/RoomContext';
import { ThreadType } from './useThreadFilterOptions';

type RoomMessagesRidEvent = IMessage;

type NotifyRoomRidDeleteMessageEvent = { _id: IMessage['_id'] };

type NotifyRoomRidDeleteMessageBulkEvent = {
	rid: IMessage['rid'];
	excludePinned: boolean;
	ignoreDiscussion: boolean;
	ts: Mongo.FieldExpression<Date>;
	users: string[];
};

const threadsQueryKey = (rid: IRoom['_id'], type: ThreadType, text: string) => ['rooms', rid, 'threads', { type, text }] as const;

export const useThreadsQuery = ({
	type,
	text,
	...options
}: {
	type: ThreadType;
	text: string;
} & UseInfiniteQueryOptions<IThreadMainMessage[], Error>): UseInfiniteQueryResult<IThreadMainMessage[], Error> => {
	const count = getIntegerConfig('threadsListSize', 10);

	const room = useRoom();

	const subscribeToRoomMessages = useStream('room-messages');
	const subscribeToNotifyRoom = useStream('notify-room');

	const queryClient = useQueryClient();

	useEffect(() => {
		const unsubscribeFromRoomMessages = subscribeToRoomMessages(room._id, (event: RoomMessagesRidEvent) => {
			if (isThreadMainMessage(event)) queryClient.refetchQueries(threadsQueryKey(room._id, type, text), { exact: true });
		});

		const unsubscribeFromDeleteMessage = subscribeToNotifyRoom(`${room._id}/deleteMessage`, (_event: NotifyRoomRidDeleteMessageEvent) => {
			queryClient.refetchQueries(threadsQueryKey(room._id, type, text), { exact: true });
		});

		const unsubscribeFromDeleteMessageBulk = subscribeToNotifyRoom(
			`${room._id}/deleteMessageBulk`,
			(_event: NotifyRoomRidDeleteMessageBulkEvent) => {
				queryClient.refetchQueries(threadsQueryKey(room._id, type, text), { exact: true });
			},
		);

		return (): void => {
			unsubscribeFromRoomMessages();
			unsubscribeFromDeleteMessage();
			unsubscribeFromDeleteMessageBulk();
		};
	}, [subscribeToRoomMessages, subscribeToNotifyRoom, room._id, queryClient, type, text]);

	const getThreadsList = useEndpoint('GET', '/v1/chat.getThreadsList');

	return useInfiniteQuery<IThreadMainMessage[], Error>(
		threadsQueryKey(room._id, type, text),
		async ({ pageParam = 0 }) => {
			const offset = pageParam * count; // TODO: numeric offset is deprecated, use date instead

			const { threads } = await getThreadsList({
				rid: room._id,
				type,
				text,
				offset,
				count,
			});

			return threads.map(mapMessageFromApi).filter(isThreadMainMessage);
		},
		{
			getNextPageParam: (lastPage, allPages) => {
				if (lastPage.length < count) {
					return undefined;
				}

				return allPages.length;
			},
			...options,
		},
	);
};
