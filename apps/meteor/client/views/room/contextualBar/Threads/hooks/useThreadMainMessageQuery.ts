import { IMessage, IRoom, IThreadMainMessage, isThreadMainMessage } from '@rocket.chat/core-typings';
import { useEndpoint, useStream } from '@rocket.chat/ui-contexts';
import { useQuery, useQueryClient, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { Mongo } from 'meteor/mongo';
import { useEffect, useMemo } from 'react';

import { Messages } from '../../../../../../app/models/client';
import { createFilterFromQuery, Query } from '../../../../../lib/minimongo';
import { mapThreadMainMessageFromApi } from '../../../../../lib/utils/mapMessageFromApi';

export const useThreadMainMessageQuery = ({
	rid,
	tmid,
	enabled = true,
	...options
}: { rid: IRoom['_id']; tmid: IMessage['_id'] } & UseQueryOptions<
	IThreadMainMessage,
	Error,
	IThreadMainMessage,
	readonly ['rooms', IRoom['_id'], 'threads', IMessage['_id'], 'main-message']
>): UseQueryResult<IThreadMainMessage, Error> => {
	// fetching

	const getMessage = useEndpoint('GET', '/v1/chat.getMessage');

	const queryKey = useMemo(() => ['rooms', rid, 'threads', tmid, 'main-message'] as const, [rid, tmid]);

	const queryResult = useQuery(
		queryKey,
		async (): Promise<IThreadMainMessage> => {
			const fromCachedCollection = (Messages as Mongo.Collection<IMessage>)
				.find({ _id: tmid, rid }, { reactive: false })
				.fetch()
				.filter(isThreadMainMessage)[0] as IThreadMainMessage | undefined;

			if (fromCachedCollection) return fromCachedCollection;

			const { message: rawMessage } = await getMessage({ msgId: tmid });
			const message = mapThreadMainMessageFromApi(rawMessage);
			if (message.rid === rid) return message;

			throw new Error('Thread main message not found');
		},
		{
			enabled,
			...options,
		},
	);

	// updating

	const queryClient = useQueryClient();

	const subscribeToRoomMessages = useStream('room-messages');
	const subscribeToNotifyRoom = useStream('notify-room');

	useEffect(() => {
		const message = queryResult.data;

		if (!message) {
			return;
		}

		const unsubscribeToRoomMessages = subscribeToRoomMessages(message.rid, (event) => {
			queryClient.invalidateQueries(queryKey, {
				exact: true,
				predicate: () => event._id === message._id,
			});
		});

		const unsubscribeToDeleteMessage = subscribeToNotifyRoom(`${message.rid}/deleteMessage`, (event) => {
			queryClient.invalidateQueries(queryKey, {
				exact: true,
				predicate: () => event._id === message._id,
			});
		});

		const unsubscribeToDeleteMessageBulk = subscribeToNotifyRoom(
			`${message.rid}/deleteMessageBulk`,
			({ rid, ts, excludePinned, ignoreDiscussion, users }) => {
				queryClient.invalidateQueries(queryKey, {
					exact: true,
					predicate: () => {
						const query: Query<IMessage> = { rid, ts };
						if (excludePinned) {
							query.pinned = { $ne: true };
						}
						if (ignoreDiscussion) {
							query.drid = { $exists: false };
						}
						if (users?.length) {
							query['u.username'] = { $in: users };
						}

						const match = createFilterFromQuery<IMessage>(query);

						return match(message);
					},
				});
			},
		);

		return (): void => {
			unsubscribeToRoomMessages();
			unsubscribeToDeleteMessage();
			unsubscribeToDeleteMessageBulk();
		};
	}, [queryResult.data, queryKey, queryClient, subscribeToRoomMessages, subscribeToNotifyRoom]);

	return queryResult;
};
