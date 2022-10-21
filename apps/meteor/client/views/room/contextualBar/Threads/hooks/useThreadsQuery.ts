import { IMessage, IRoom, isThreadMainMessage, IThreadMainMessage } from '@rocket.chat/core-typings';
import { useEndpoint, useStreamEvent } from '@rocket.chat/ui-contexts';
import { useInfiniteQuery, UseInfiniteQueryOptions, UseInfiniteQueryResult, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createFilterFromQuery, Query } from '../../../../../lib/minimongo';
import { getIntegerConfig } from '../../../../../lib/utils/getConfig';
import { mapThreadMainMessageFromApi } from '../../../../../lib/utils/mapMessageFromApi';
import { ThreadType } from './useThreadFilterOptions';

export const useThreadsQuery = ({
	rid,
	type,
	text,
	enabled = true,
	...options
}: {
	rid: IRoom['_id'];
	type: ThreadType;
	text: string;
} & UseInfiniteQueryOptions<
	IThreadMainMessage[],
	Error,
	IThreadMainMessage[],
	IThreadMainMessage[],
	readonly ['rooms', IRoom['_id'], 'threads', { type: ThreadType; text: string }]
>): UseInfiniteQueryResult<IThreadMainMessage[], Error> => {
	// fetching

	const count = getIntegerConfig('threadsListSize', 10);

	const getThreadsList = useEndpoint('GET', '/v1/chat.getThreadsList');

	const queryKey = useMemo(() => ['rooms', rid, 'threads', { type, text }] as const, [rid, text, type]);

	const queryResult = useInfiniteQuery(
		queryKey,
		async ({ pageParam = 0 }) => {
			const offset = pageParam * count; // TODO: numeric offset is deprecated, use date instead

			const { threads } = await getThreadsList({
				rid,
				type,
				text,
				offset,
				count,
			});

			return threads.map(mapThreadMainMessageFromApi);
		},
		{
			getNextPageParam: (lastPage, allPages) => {
				if (lastPage.length < count) {
					return undefined;
				}

				return allPages.length;
			},
			enabled,
			...options,
		},
	);

	// invalidating

	const queryClient = useQueryClient();

	useStreamEvent(
		'room-messages',
		rid,
		(event) => {
			queryClient.invalidateQueries(queryKey, {
				exact: true,
				predicate: (query) => {
					// only invalidate the query if event is a previously cached main thread message

					if (!isThreadMainMessage(event)) {
						return false;
					}

					const currentData = queryClient.getQueryData<InfiniteData<IThreadMainMessage[]>>(query.queryKey);

					return currentData?.pages.some((page) => page.some((message) => message._id === event._id)) ?? false;
				},
			});
		},
		{ enabled },
	);

	useStreamEvent(
		'notify-room',
		`${rid}/deleteMessage`,
		({ _id: mid }) => {
			queryClient.invalidateQueries(queryKey, {
				exact: true,
				predicate: ({ queryKey }) => {
					// only invalidate the query if mid matches a previously cached main thread message

					const currentData = queryClient.getQueryData<InfiniteData<IThreadMainMessage[]>>(queryKey, { exact: true });

					return currentData?.pages.some((page) => page.some((message) => message._id === mid)) ?? false;
				},
			});
		},
		{ enabled },
	);

	useStreamEvent(
		'notify-room',
		`${rid}/deleteMessageBulk`,
		({ excludePinned, ignoreDiscussion, rid, ts, users }) => {
			queryClient.invalidateQueries(queryKey, {
				exact: true,
				predicate: ({ queryKey }) => {
					// only invalidate the query if event is a deletion criteria that matches a previously cached main thread message

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

					const currentData = queryClient.getQueryData<InfiniteData<IThreadMainMessage[]>>(queryKey, { exact: true });

					return currentData?.pages.some((page) => page.some(match)) ?? false;
				},
			});
		},
		{ enabled },
	);

	return queryResult;
};
