import type { IMessage, IRoom } from '@rocket.chat/core-typings';

import type { FieldExpression } from './minimongo';

export type StreamEventsMap = {
	'notify-user': Record<string, (...args: any[]) => void>;
	'notify-all': Record<string, (...args: any[]) => void>;
	'notify-logged': Record<string, (...args: any[]) => void>;
	'notify-room': {
		[eventName: `${IRoom['_id']}/deleteMessage`]: (event: { _id: IMessage['_id'] }) => void;

		[eventName: `${IRoom['_id']}/deleteMessageBulk`]: (event: {
			rid: IRoom['_id'];
			excludePinned: boolean;
			ignoreDiscussion: boolean;
			ts: FieldExpression<Date>;
			users: string[];
		}) => void;
	};
	'notify-room-users': Record<string, (...args: any[]) => void>;
	'importers': Record<string, (...args: any[]) => void>;
	'roles': Record<string, (...args: any[]) => void>;
	'apps': Record<string, (...args: any[]) => void>;
	'apps-engine': Record<string, (...args: any[]) => void>;
	'canned-responses': Record<string, (...args: any[]) => void>;
	'integrationHistory': Record<string, (...args: any[]) => void>;
	'livechat-room': Record<string, (...args: any[]) => void>;
	'livechat-inquiry-queue-observer': Record<string, (...args: any[]) => void>;
	'stdout': Record<string, (...args: any[]) => void>;
	'room-data': Record<string, (...args: any[]) => void>;
	'user-presence': Record<string, (...args: any[]) => void>;
	'room-messages': {
		[eventName: `${IRoom['_id']}`]: (event: IMessage) => void;
	};
};
