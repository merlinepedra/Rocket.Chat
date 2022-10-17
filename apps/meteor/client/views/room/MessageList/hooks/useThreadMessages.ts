import { IMessage, isThreadMessage, IThreadMessage } from '@rocket.chat/core-typings';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { Messages } from '../../../../../app/models/client';
import { WithRequiredProperty } from '../../../../../definition/WithRequiredProperty';
import { queryClient } from '../../../../lib/queryClient';
import { callWithErrorHandling } from '../../../../lib/utils/callWithErrorHandling';
import { useMessageListContext } from '../contexts/MessageListContext';
import { parseMessageTextToAstMarkdown, removePossibleNullMessageValues } from '../lib/parseMessageTextToAstMarkdown';

const fetchThreadMessages = async (tmid: IThreadMessage['tmid']): Promise<IThreadMessage[]> => {
	const messages = (await callWithErrorHandling('getThreadMessages', { tmid })) as IThreadMessage[];
	return messages?.sort((a: IThreadMessage, b: IThreadMessage) => Number(a.ts) - Number(b.ts));
};

// Edit message is not working (fails to read message dataset)
// Delete message is not working (fails to read message dataset)
// Issues with sequential messages

export const useThreadMessages = ({ tmid }: { tmid: IThreadMessage['tmid'] }): WithRequiredProperty<IThreadMessage, 'md'>[] => {
	const { autoTranslateLanguage, katex, showColors, useShowTranslated } = useMessageListContext();

	const normalizeMessage = useMemo(() => {
		const parseOptions = {
			colors: showColors,
			emoticons: true,
			...(Boolean(katex) && {
				katex: {
					dollarSyntax: katex?.dollarSyntaxEnabled,
					parenthesisSyntax: katex?.parenthesisSyntaxEnabled,
				},
			}),
		};
		return (message: IMessage): WithRequiredProperty<IThreadMessage, 'md'> => {
			const parsedMessage = parseMessageTextToAstMarkdown(
				removePossibleNullMessageValues(message),
				parseOptions,
				autoTranslateLanguage,
				useShowTranslated,
			);

			if (!isThreadMessage(parsedMessage)) {
				throw new Error('Message is not a thread message');
			}

			return parsedMessage;
		};
	}, [autoTranslateLanguage, katex, showColors, useShowTranslated]);

	useEffect(() => {
		const threadsObserve = Messages.find(
			{ $or: [{ tmid }, { _id: tmid }], _hidden: { $ne: true } },
			{
				fields: {
					collapsed: 0,
					threadMsg: 0,
					repliesCount: 0,
				},
			},
		).observe({
			added: (message: IThreadMessage) => {
				queryClient.setQueryData<WithRequiredProperty<IThreadMessage, 'md'>[]>(['threadMessages', tmid], (currentData) => [
					...(currentData || []),
					normalizeMessage(message),
				]);
			},
			changed: (message: IThreadMessage) => {
				queryClient.setQueryData<WithRequiredProperty<IThreadMessage, 'md'>[]>(['threadMessages', tmid], (currentData) => {
					if (!currentData) {
						return [];
					}
					const index = currentData.findIndex((currentMessage) => currentMessage._id === message._id);
					if (index === -1) {
						return currentData;
					}
					return [...currentData.slice(0, index), normalizeMessage(message), ...currentData.slice(index + 1)];
				});
			},
			removed: ({ _id }: IThreadMessage) => {
				queryClient.setQueryData<WithRequiredProperty<IThreadMessage, 'md'>[]>(['threadMessages', tmid], (currentData) => {
					if (!currentData) {
						return [];
					}
					const index = currentData.findIndex((currentMessage) => currentMessage._id === _id);
					if (index === -1) {
						return currentData;
					}
					return [...currentData.slice(0, index), ...currentData.slice(index + 1)];
				});
			},
		});

		return (): void => threadsObserve.stop();
	}, [normalizeMessage, tmid]);

	const { data, isSuccess } = useQuery(['threadMessages', tmid], async () => (await fetchThreadMessages(tmid)).map(normalizeMessage));

	if (isSuccess && data) {
		return data;
	}

	return [];
};
