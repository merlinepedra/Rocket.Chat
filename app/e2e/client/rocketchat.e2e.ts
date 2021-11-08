/* eslint-disable @typescript-eslint/camelcase */
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { ReactiveVar } from 'meteor/reactive-var';
import { EJSON } from 'meteor/ejson';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';


import { E2ERoom } from './rocketchat.e2e.room';
import {
	toString,
	toArrayBuffer,
	joinVectorAndEcryptedData,
	splitVectorAndEcryptedData,
	encryptAES,
	decryptAES,
	generateRSAKey,
	exportJWKKey,
	importRSAKey,
	importRawKey,
	deriveKey,
} from './helper';
import * as banners from '../../../client/lib/banners';
import { Rooms, Subscriptions, Messages } from '../../models/client';
import { createDebugLogger } from './logger';
import { waitUntilFind } from '../../../client/lib/utils/waitUntilFind';
import { imperativeModal } from '../../../client/lib/imperativeModal';
import SaveE2EPasswordModal from '../../../client/views/e2e/SaveE2EPasswordModal';
import EnterE2EPasswordModal from '../../../client/views/e2e/EnterE2EPasswordModal';
import { call } from '../../../client/lib/utils/call';
import type { IRoom } from '../../../definition/IRoom';
import type { IMessage } from '../../../definition/IMessage';
import type { ISubscription } from '../../../definition/ISubscription';

import './events';
import './tabbar';

let failedToDecodeKey = false;

class E2E {
	started = false;

	enabled: ReactiveVar<boolean> = new ReactiveVar(false);

	private _ready: ReactiveVar<boolean> = new ReactiveVar(false);

	instancesByRoomId: Record<IRoom['_id'], E2ERoom> = {};

	db_public_key: string | null;

	db_private_key: string | null;

	privateKey: CryptoKey | null;

	protected logger = createDebugLogger('E2E');

	isEnabled(): boolean {
		return this.enabled.get();
	}

	isReady(): boolean {
		return this.enabled.get() && this._ready.get();
	}

	async getInstanceByRoomId(rid: IRoom['_id']): Promise<E2ERoom | null> {
		const room = await waitUntilFind(() => Rooms.findOne({ _id: rid }));

		if (!E2ERoom.isSupportedRoomType(room.t)) {
			return null;
		}

		if (room.encrypted !== true && !room.e2eKeyId) {
			return null;
		}

		const uid = Meteor.userId();

		if (!uid) {
			return null;
		}

		if (!this.instancesByRoomId[rid]) {
			this.instancesByRoomId[rid] = new E2ERoom(uid, rid, room.t);
			this.instancesByRoomId[rid].handshake();
		}

		return this.instancesByRoomId[rid];
	}

	removeInstanceByRoomId(rid: IRoom['_id']): void {
		delete this.instancesByRoomId[rid];
	}

	private getLocalKeyPair(): { publicKey: string; privateKey: string } | undefined {
		const publicKey = Meteor._localStorage.getItem('public_key');
		const privateKey = Meteor._localStorage.getItem('private_key');

		if (!publicKey || !privateKey) {
			return undefined;
		}

		return { publicKey, privateKey };
	}

	private async getRemoteKeyPair(): Promise<{ publicKey: string; privateKey: string } | undefined> {
		const { public_key: publicKey, private_key: privateKey } = await call('e2e.fetchMyKeys');

		if (!publicKey || !privateKey) {
			return undefined;
		}

		return { publicKey, privateKey };
	}

	private async getKeyPair(): Promise<{ publicKey: string; privateKey: string } | undefined> {
		this.logger.log('startClient', 'getKeyPair');

		const localKeyPair = this.getLocalKeyPair();
		const remoteKeyPair = await this.getRemoteKeyPair();

		this.db_public_key = remoteKeyPair?.publicKey ?? null;
		this.db_private_key = remoteKeyPair?.privateKey ?? null;

		if (localKeyPair) {
			this.logger.log('startClient', 'getKeyPair', 'local');
			return localKeyPair;
		}

		if (!remoteKeyPair) {
			this.logger.log('startClient', 'getKeyPair', 'none');
			return undefined;
		}

		try {
			this.logger.log('startClient', 'getKeyPair', 'remote');
			return {
				publicKey: remoteKeyPair.publicKey,
				privateKey: await this.decodePrivateKey(remoteKeyPair.privateKey),
			};
		} catch (error) {
			failedToDecodeKey = true;

			this.openAlert({
				title: TAPi18n.__(
					"Wasn't possible to decode your encryption key to be imported.",
				),
				html: '<div>Your encryption password seems wrong. Click here to try again.</div>',
				modifiers: ['large', 'danger'],
				closable: true,
				icon: 'key',
				action: () => {
					this.startClient();
					this.closeAlert();
				},
			});

			throw error;
		}
	}

	private async loadKeys({ publicKey, privateKey }: { publicKey: string; privateKey: string }): Promise<void> {
		this.logger.log('loadKeys');

		try {
			this.privateKey = await importRSAKey(EJSON.parse(privateKey) as JsonWebKey, ['decrypt']);

			Meteor._localStorage.setItem('public_key', publicKey);
			Meteor._localStorage.setItem('private_key', privateKey);
		} catch (error) {
			this.logger.logError(error);
		}
	}

	async startClient(): Promise<void> {
		if (this.started) {
			this.logger.log('startClient', 'already started');
			return;
		}

		this.logger.log('startClient');

		this.started = true;

		let keyPair;

		try {
			keyPair = await this.getKeyPair();
		} catch (error) {
			this.logger.logError(error);
			this.started = false;
			return;
		}

		if (keyPair) {
			await this.loadKeys(keyPair);
		} else {
			await this.createAndLoadKeys();
		}

		// TODO: Split in 2 methods to persist keys
		if (!this.db_public_key || !this.db_private_key) {
			await call('e2e.setUserPublicAndPrivateKeys', {
				public_key: Meteor._localStorage.getItem('public_key'),
				private_key: await this.encodePrivateKey(
					Meteor._localStorage.getItem('private_key') ?? undefined,
					this.createRandomPassword(),
				),
			});
		}

		const randomPassword = Meteor._localStorage.getItem('e2e.randomPassword');
		if (randomPassword) {
			const passwordRevealText = TAPi18n.__('E2E_password_reveal_text', {
				postProcess: 'sprintf',
				sprintf: [randomPassword],
			});

			this.openAlert({
				title: TAPi18n.__('Save_Your_Encryption_Password'),
				html: TAPi18n.__('Click_here_to_view_and_copy_your_password'),
				modifiers: ['large'],
				closable: false,
				icon: 'key',
				action: () => {
					imperativeModal.open({
						component: SaveE2EPasswordModal,
						props: {
							passwordRevealText,
							onClose: imperativeModal.close,
							onCancel: (): void => {
								this.closeAlert();
								imperativeModal.close();
							},
							onConfirm: (): void => {
								Meteor._localStorage.removeItem('e2e.randomPassword');
								this.closeAlert();
								imperativeModal.close();
							},
						},
					});
				},
			});
		}

		this._ready.set(true);
		this.decryptLastMessages();
	}

	async stopClient(): Promise<void> {
		this.logger.log('-> Stop Client');
		this.closeAlert();

		Meteor._localStorage.removeItem('public_key');
		Meteor._localStorage.removeItem('private_key');
		this.instancesByRoomId = {};
		this.privateKey = null;
		this.enabled.set(false);
		this._ready.set(false);
		this.started = false;
	}

	async changePassword(newPassword: string): Promise<void> {
		await call('e2e.setUserPublicAndPrivateKeys', {
			public_key: Meteor._localStorage.getItem('public_key'),
			private_key: await this.encodePrivateKey(
				Meteor._localStorage.getItem('private_key') ?? undefined,
				newPassword,
			),
		});

		if (Meteor._localStorage.getItem('e2e.randomPassword')) {
			Meteor._localStorage.setItem('e2e.randomPassword', newPassword);
		}
	}

	async createAndLoadKeys(): Promise<void> {
		// Could not obtain public-private keypair from server.
		let key;
		try {
			key = await generateRSAKey();
			this.privateKey = key.privateKey;
		} catch (error) {
			return this.logger.logError('Error generating key: ', error);
		}

		try {
			const publicKey = await exportJWKKey(key.publicKey);

			Meteor._localStorage.setItem('public_key', JSON.stringify(publicKey));
		} catch (error) {
			return this.logger.logError('Error exporting public key: ', error);
		}

		try {
			const privateKey = await exportJWKKey(key.privateKey);

			Meteor._localStorage.setItem('private_key', JSON.stringify(privateKey));
		} catch (error) {
			this.logger.logError('Error exporting private key: ', error);
		}

		this.requestSubscriptionKeys();
	}

	async requestSubscriptionKeys(): Promise<void> {
		call('e2e.requestSubscriptionKeys');
	}

	createRandomPassword(): string {
		const randomPassword = `${ Random.id(3) }-${ Random.id(3) }-${ Random.id(
			3,
		) }`.toLowerCase();
		Meteor._localStorage.setItem('e2e.randomPassword', randomPassword);
		return randomPassword;
	}

	async encodePrivateKey(private_key: string | undefined, password: string): Promise<string | void> {
		if (private_key === undefined) {
			throw new Error('TODO');
		}

		const masterKey = await this.getMasterKey(password);

		const vector = crypto.getRandomValues(new Uint8Array(16));
		try {
			const encodedPrivateKey = await encryptAES(
				vector,
				masterKey,
				toArrayBuffer(private_key),
			);

			return EJSON.stringify(
				joinVectorAndEcryptedData(vector, encodedPrivateKey),
			);
		} catch (error) {
			return this.logger.logError('Error encrypting encodedPrivateKey: ', error);
		}
	}

	async getMasterKey(password: string): Promise<CryptoKey> {
		if (password == null) {
			alert('You should provide a password');
		}

		// First, create a PBKDF2 "key" containing the password
		let baseKey;
		try {
			baseKey = await importRawKey(toArrayBuffer(password));
		} catch (error) {
			this.logger.logError('Error creating a key based on user password: ', error);
			throw new Error('TODO');
		}

		const uid = Meteor.userId();

		if (!uid) {
			throw new Error('TODO');
		}

		// Derive a key from the password
		try {
			return await deriveKey(toArrayBuffer(uid), baseKey);
		} catch (error) {
			this.logger.logError('Error deriving baseKey: ', error);
			throw new Error('TODO');
		}
	}

	async requestPassword(): Promise<string> {
		return new Promise((resolve) => {
			const showModal = (): void => {
				imperativeModal.open({
					component: EnterE2EPasswordModal,
					props: {
						onClose: imperativeModal.close,
						onCancel: (): void => {
							failedToDecodeKey = false;
							this.closeAlert();
							imperativeModal.close();
						},
						onConfirm: (password): void => {
							resolve(password);
							this.closeAlert();
							imperativeModal.close();
						},
					},
				});
			};

			const showAlert = (): void => {
				this.openAlert({
					title: TAPi18n.__('Enter_your_E2E_password'),
					html: TAPi18n.__('Click_here_to_enter_your_encryption_password'),
					modifiers: ['large'],
					closable: false,
					icon: 'key',
					action() {
						showModal();
					},
				});
			};

			if (failedToDecodeKey) {
				showModal();
			} else {
				showAlert();
			}
		});
	}

	async decodePrivateKey(private_key: string): Promise<string> {
		const password = await this.requestPassword();

		const masterKey = await this.getMasterKey(password);

		const [vector, cipherText] = splitVectorAndEcryptedData(
			EJSON.parse(private_key) as Uint8Array,
		);

		try {
			const privKey = await decryptAES(vector, masterKey, cipherText);
			return toString(privKey);
		} catch (error) {
			throw new Error('E2E -> Error decrypting private key');
		}
	}

	async decryptMessage<TMessage extends Omit<IMessage, '_id'>>(message: TMessage): Promise<TMessage> {
		if (message.t !== 'e2e' || message.e2e === 'done') {
			return message;
		}

		const e2eRoom = await this.getInstanceByRoomId(message.rid);

		if (!e2eRoom) {
			return message;
		}

		const data = await e2eRoom.decrypt(message.msg);

		if (!data) {
			return message;
		}

		return {
			...message,
			msg: typeof data === 'string' ? data : data.text,
			e2e: 'done',
		};
	}

	async decryptPendingMessages(): Promise<void> {
		return Messages.find({ t: 'e2e', e2e: 'pending' }).forEach(
			async ({ _id, ...msg }: IMessage) => {
				Messages.direct.update({ _id }, await this.decryptMessage(msg));
			},
		);
	}

	async decryptLastMessage(subscription: ISubscription): Promise<void> {
		this.logger.log('decryptLastMessage', { _id: subscription._id, rid: subscription.rid });

		const e2eRoom = await this.getInstanceByRoomId(subscription.rid);
    e2eRoom?.decryptLastMessage();
	}

	decryptLastMessages(): void {
		this.logger.log('decryptLastMessages');

		Subscriptions.find({ encrypted: true, lastMessage: { $exists: true } })
			.forEach((subscription: ISubscription) => {
				this.decryptLastMessage(subscription);
			});
	}

	openAlert(config: Omit<banners.LegacyBannerPayload, 'id'>): void {
		banners.open({ id: 'e2e', ...config });
	}

	closeAlert(): void {
		banners.closeById('e2e');
	}
}

export const e2e = new E2E();
