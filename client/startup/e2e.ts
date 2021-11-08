import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import { e2e } from '../../app/e2e/client/rocketchat.e2e';
import { E2ERoom } from '../../app/e2e/client/rocketchat.e2e.room';
import { Subscriptions, Rooms } from '../../app/models/client';
import { Notifications } from '../../app/notifications/client';
import { settings } from '../../app/settings/client';
import { IMessage } from '../../definition/IMessage';
import { IRoom } from '../../definition/IRoom';
import { ISubscription } from '../../definition/ISubscription';
import { onClientBeforeSendMessage } from '../lib/onClientBeforeSendMessage';
import { onClientMessageReceived } from '../lib/onClientMessageReceived';
import { isLayoutEmbedded } from '../lib/utils/isLayoutEmbedded';
import { waitUntilFind } from '../lib/utils/waitUntilFind';

const handleE2EKeyRequest = async (roomId: IRoom['_id'], keyId: string): Promise<void> => {
	const e2eRoom = await e2e.getInstanceByRoomId(roomId);
	if (!e2eRoom) {
		return;
	}

	e2eRoom.provideKeyToUser(keyId);
};

Meteor.startup(() => {
	Tracker.autorun(() => {
		if (!Meteor.userId()) {
			return;
		}

		const adminEmbedded = isLayoutEmbedded() && FlowRouter.current().path.startsWith('/admin');

		if (!adminEmbedded && settings.get('E2E_Enable') && window.crypto) {
			e2e.startClient();
			e2e.enabled.set(true);
		} else {
			e2e.enabled.set(false);
			e2e.closeAlert();
		}
	});

	let observable: Meteor.LiveQueryHandle | null = null;
	let offClientMessageReceived: undefined | (() => void);
	let offClientBeforeSendMessage: undefined | (() => void);
	Tracker.autorun(() => {
		if (!e2e.isReady()) {
			offClientMessageReceived?.();
			Notifications.unUser('e2ekeyRequest', handleE2EKeyRequest);
			observable?.stop();
			offClientBeforeSendMessage?.();
			return;
		}

		Notifications.onUser('e2ekeyRequest', handleE2EKeyRequest);

		observable = Subscriptions.find().observe({
			changed: async (doc: ISubscription) => {
				if (!doc.encrypted && !doc.E2EKey) {
					e2e.removeInstanceByRoomId(doc.rid);
					return;
				}

				const e2eRoom = await e2e.getInstanceByRoomId(doc.rid);
				if (!e2eRoom) {
					return;
				}

				e2eRoom.toggle(doc.encrypted);

				// Cover private groups and direct messages
				if (!E2ERoom.isSupportedRoomType(doc.t)) {
					e2eRoom.disable();
					return;
				}

				if (doc.E2EKey && e2eRoom.isWaitingKeys()) {
					e2eRoom.keyReceived();
					return;
				}

				if (!e2eRoom.isReady()) {
					return;
				}

				e2eRoom.decryptLastMessage();
			},
			added: async (doc: ISubscription) => {
				if (!doc.encrypted && !doc.E2EKey) {
					return;
				}
				return e2e.getInstanceByRoomId(doc.rid);
			},
			removed: (doc: ISubscription) => {
				e2e.removeInstanceByRoomId(doc.rid);
			},
		});

		offClientMessageReceived = onClientMessageReceived.use(async (msg: IMessage) => {
			const e2eRoom = await e2e.getInstanceByRoomId(msg.rid);
			if (!e2eRoom || !e2eRoom.shouldConvertReceivedMessages()) {
				return msg;
			}
			return e2e.decryptMessage(msg);
		});

		// Encrypt messages before sending
		offClientBeforeSendMessage = onClientBeforeSendMessage.use(async (message: IMessage) => {
			const e2eRoom = await e2e.getInstanceByRoomId(message.rid);

			if (!e2eRoom) {
				return message;
			}

			const room: IRoom = await waitUntilFind(() => Rooms.findOne({ _id: message.rid }));
			e2eRoom.toggle(room.encrypted);

			if (!(await e2eRoom.shouldConvertSentMessages())) {
				return message;
			}

			return Object.assign(message, {
				msg: await e2eRoom.encrypt(message),
				t: 'e2e',
				e2e: 'pending',
			});
		});
	});
});
