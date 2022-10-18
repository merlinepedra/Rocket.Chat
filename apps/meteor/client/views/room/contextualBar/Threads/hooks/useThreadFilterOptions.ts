import { IRoom } from '@rocket.chat/core-typings';
import { useDebouncedValue, useLocalStorage } from '@rocket.chat/fuselage-hooks';
import { useTranslation, useUserId } from '@rocket.chat/ui-contexts';
import { FormEvent, useCallback, useMemo, useState } from 'react';

import { useRoom, useRoomSubscription } from '../../../contexts/RoomContext';

export type ThreadType = 'all' | 'following' | 'unread';

const searchKinds = {
	all: (rid: IRoom['_id'], text: string) =>
		({
			rid,
			text,
			type: 'all',
		} as const),
	following: (rid: IRoom['_id'], text: string) =>
		({
			rid,
			text,
			type: 'following',
		} as const),
	unread: (rid: IRoom['_id'], text: string) =>
		({
			rid,
			text,
			type: 'unread',
		} as const),
} as const;

export const useThreadFilterOptions = (): {
	readonly type: ThreadType;
	readonly typeOptions: [type: ThreadType, label: string][];
	readonly onTypeChange: (type: string) => void;
	readonly messageText: string;
	readonly onMessageTextChange: (event: FormEvent<HTMLInputElement>) => void;
	readonly searchParameters: ReturnType<typeof searchKinds[keyof typeof searchKinds]>;
} => {
	const t = useTranslation();

	const [type, setType] = useLocalStorage<ThreadType>('thread-list-type', 'all');

	const typeOptions: [type: ThreadType, label: string][] = useMemo(
		() => [
			['all', t('All')],
			['following', t('Following')],
			['unread', t('Unread')],
		],
		[t],
	);

	const onTypeChange = useCallback(
		(type: string) => {
			const isThreadType = (type: string): type is ThreadType => typeOptions.some(([optionType]) => optionType === type);
			if (isThreadType(type)) setType(type);
		},
		[typeOptions, setType],
	);

	const [messageText, setMessageText] = useState('');

	const onMessageTextChange = useCallback((event: FormEvent<HTMLInputElement>) => {
		setMessageText(event.currentTarget.value);
	}, []);

	const room = useRoom();
	const subscription = useRoomSubscription();
	const subscribed = !!subscription;
	const uid = useUserId();

	const searchParameters = useDebouncedValue(
		useMemo(() => {
			if (subscribed && uid) {
				switch (type) {
					case 'following':
						return searchKinds.following(room._id, messageText);

					case 'unread':
						return searchKinds.unread(room._id, messageText);
				}
			}

			return searchKinds.all(room._id, messageText);
		}, [type, subscribed, uid, room._id, messageText]),
		400,
	);

	return {
		type,
		typeOptions,
		onTypeChange,
		messageText,
		onMessageTextChange,
		searchParameters,
	};
};
