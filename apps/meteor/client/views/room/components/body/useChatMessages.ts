import { IMessage, IRoom } from '@rocket.chat/core-typings';
import { Mongo } from 'meteor/mongo';
import { RefObject, useEffect, useMemo } from 'react';

import { ChatMessages, chatMessages } from '../../../../../app/ui';

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
	const id = tmid ? `${rid}-${tmid}` : rid;

	const chatMessagesInstance = useMemo(() => {
		const instance = chatMessages[id] ?? new ChatMessages(collection);
		chatMessages[id] = instance;
		return instance;
	}, [collection, id]);

	useEffect(() => {
		const wrapper = wrapperRef.current;

		if (!wrapper) {
			return;
		}

		chatMessagesInstance.initializeWrapper(wrapper);
		return (): void => {
			chatMessagesInstance.onDestroyed(rid, tmid);

			if (tmid) {
				delete chatMessages[id];
			}
		};
	}, [chatMessagesInstance, id, rid, tmid, wrapperRef]);

	return chatMessagesInstance;
};
