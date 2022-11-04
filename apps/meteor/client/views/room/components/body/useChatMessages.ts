import { IMessage, IRoom } from '@rocket.chat/core-typings';
import { Mongo } from 'meteor/mongo';
import { RefObject, useEffect, useMemo } from 'react';

import { ChatMessage } from '../../../../../app/models/client';
import { ChatMessages, getChatMessagesFor, setChatMessagesFor } from '../../../../../app/ui';

export const useChatMessages = ({
	rid,
	tmid,
	collection = ChatMessage,
	findMessageByID = (id): IMessage | undefined => collection.findOne(id, { reactive: false }),
	findLastMessage = (): IMessage | undefined => collection.findOne({ rid, tmid }, { fields: { ts: 1 }, sort: { ts: -1 }, reactive: false }),
	upsertMessage = (message): void => {
		collection.upsert({ _id: message._id }, { $set: message });
	},
	wrapperRef,
}: {
	rid: IRoom['_id'];
	tmid?: IMessage['_id'];
	collection?: Mongo.Collection<Omit<IMessage, '_id'>, IMessage>;
	findMessageByID?: (id: string | undefined) => IMessage | undefined;
	findLastMessage?: () => IMessage | undefined;
	upsertMessage?: (message: Partial<IMessage>) => void;
	wrapperRef: RefObject<HTMLElement | null>;
}): ChatMessages => {
	const chatMessagesInstance = useMemo(() => {
		const instance = getChatMessagesFor({ rid, tmid }) ?? new ChatMessages({ findMessageByID, findLastMessage, upsertMessage });
		setChatMessagesFor({ rid, tmid }, instance);
		return instance;
	}, [findLastMessage, findMessageByID, rid, tmid, upsertMessage]);

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
