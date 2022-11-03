import { IMessage, IRoom } from '@rocket.chat/core-typings';
import { Mongo } from 'meteor/mongo';
import { RefObject, useEffect, useMemo } from 'react';

import { ChatMessages, getChatMessagesFor, setChatMessagesFor } from '../../../../../app/ui';

export const useChatMessages = ({
	rid,
	tmid,
	collection,
	wrapperRef,
}: {
	rid: IRoom['_id'];
	tmid?: IMessage['_id'];
	collection?: Mongo.Collection<Omit<IMessage, '_id'>, IMessage> & {
		direct: Mongo.Collection<Omit<IMessage, '_id'>, IMessage>;
		queries: unknown[];
	};
	wrapperRef: RefObject<HTMLElement | null>;
}): ChatMessages => {
	const chatMessagesInstance = useMemo(() => {
		const instance = getChatMessagesFor({ rid, tmid }) ?? new ChatMessages(collection);
		setChatMessagesFor({ rid, tmid }, instance);
		return instance;
	}, [collection, rid, tmid]);

	const wrapper = wrapperRef.current;

	useEffect(() => {
		if (!wrapper) {
			return;
		}

		chatMessagesInstance.initializeWrapper(wrapper);
		return (): void => {
			setChatMessagesFor({ rid, tmid }, undefined);
		};
	}, [chatMessagesInstance, rid, tmid, wrapper]);

	return chatMessagesInstance;
};
