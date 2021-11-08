import { Base64 } from 'meteor/base64';
import { EJSON } from 'meteor/ejson';
import { Random } from 'meteor/random';
import { TimeSync } from 'meteor/mizzao:timesync';
import { Emitter } from '@rocket.chat/emitter';

import { e2e } from './rocketchat.e2e';
import {
	toString,
	toArrayBuffer,
	joinVectorAndEcryptedData,
	splitVectorAndEcryptedData,
	encryptRSA,
	encryptAES,
	decryptRSA,
	decryptAES,
	generateAESKey,
	exportJWKKey,
	importAESKey,
	importRSAKey,
	readFileAsArrayBuffer,
} from './helper';
import { Notifications } from '../../notifications/client';
import { Rooms, Subscriptions, Messages } from '../../models/client';
import { roomTypes, RoomSettingsEnum } from '../../utils/client';
import { createDebugLogger } from './logger';
import { E2ERoomState } from './E2ERoomState';
import { call } from '../../../client/lib/utils/call';
import type { IUser } from '../../../definition/IUser';
import type { IRoom } from '../../../definition/IRoom';
import type { IMessage } from '../../../definition/IMessage';
import type { ISubscription } from '../../../definition/ISubscription';

const KEY_ID = Symbol('keyID');
const PAUSED = Symbol('PAUSED');

const permitedMutations = {
	[E2ERoomState.NOT_STARTED]: [
		E2ERoomState.ESTABLISHING,
		E2ERoomState.DISABLED,
		E2ERoomState.KEYS_RECEIVED,
	],
	[E2ERoomState.READY]: [
		E2ERoomState.DISABLED,
	],
	[E2ERoomState.ERROR]: [
		E2ERoomState.KEYS_RECEIVED,
		E2ERoomState.NOT_STARTED,
	],
	[E2ERoomState.WAITING_KEYS]: [
		E2ERoomState.KEYS_RECEIVED,
		E2ERoomState.ERROR,
		E2ERoomState.DISABLED,
	],
	[E2ERoomState.ESTABLISHING]: [
		E2ERoomState.READY,
		E2ERoomState.KEYS_RECEIVED,
		E2ERoomState.ERROR,
		E2ERoomState.DISABLED,
		E2ERoomState.WAITING_KEYS,
	],
};

const hasPermitedMutations = (state: E2ERoomState): state is keyof typeof permitedMutations =>
	state in permitedMutations;

const filterMutation = (currentState: E2ERoomState, nextState: E2ERoomState): E2ERoomState | false => {
	if (currentState === nextState) {
		return nextState === E2ERoomState.ERROR ? false : nextState;
	}

	if (!hasPermitedMutations(currentState)) {
		return nextState;
	}

	if (permitedMutations[currentState].includes(nextState)) {
		return nextState;
	}

	return false;
};

export class E2ERoom extends Emitter<{
	STATE_CHANGED: E2ERoomState;
	PAUSED: boolean;
} & {
	[State in E2ERoomState]: E2ERoom;
}> {
	static isSupportedRoomType(type: IRoom['t']): boolean {
		return roomTypes.getConfig(type).allowRoomSettingChange({}, RoomSettingsEnum.E2E);
	}

	state: E2ERoomState = E2ERoomState.NOT_STARTED;

	[KEY_ID]: string;

	[PAUSED]: boolean | undefined = undefined;

	sessionKeyExportedString: string;

	groupSessionKey: CryptoKey;

	protected logger = createDebugLogger('E2E ROOM', () => [{ state: this.state, rid: this.roomId }]);

	constructor(
		public userId: IUser['_id'],
		public roomId: IRoom['_id'],
		public typeOfRoom: IRoom['t'],
	) {
		super();

		this.once(E2ERoomState.READY, () => {
			this.decryptPendingMessages();
			this.decryptLastMessage();
		});

		this.on('STATE_CHANGED', () => {
			if (this.state !== E2ERoomState.KEYS_RECEIVED && this.state !== E2ERoomState.NOT_STARTED) {
				return;
			}

			this.handshake();
		});

		this.on(E2ERoomState.ESTABLISHING, () => this.handleEstabilishing());
		this.on(E2ERoomState.WAITING_KEYS, () => this.handleWaitingKeys());
		this.on(E2ERoomState.CREATING_KEYS, () => this.handleCreatingKeys());
	}

	private setState(requestedState: E2ERoomState): void {
		const currentState = this.state;
		const nextState = filterMutation(currentState, requestedState);

		if (!nextState) {
			this.logger.logError(`invalid state ${ currentState } -> ${ requestedState }`);
			return;
		}

		this.state = nextState;
		this.logger.log(currentState, '->', nextState);
		this.emit('STATE_CHANGED', currentState);
		this.emit(nextState, this);
	}

	private async handleEstabilishing(): Promise<void> {
		try {
			const subscription: ISubscription | undefined = Subscriptions.findOne({ rid: this.roomId });
			if (subscription?.E2EKey) {
				await this.importGroupKey(subscription.E2EKey);
				this.setState(E2ERoomState.READY);
				return;
			}

			const room: IRoom | undefined = Rooms.findOne({ _id: this.roomId });
			if (room?.e2eKeyId) {
				this.setState(E2ERoomState.WAITING_KEYS);
				return;
			}

			this.setState(E2ERoomState.CREATING_KEYS);
		} catch (error) {
			this.catchError(error);
		}
	}

	private async handleWaitingKeys(): Promise<void> {
		const room: IRoom | undefined = Rooms.findOne({ _id: this.roomId });
		if (room?.e2eKeyId) {
			this.logger.log('e2ekeyRequest', { rid: this.roomId, e2eKeyId: room.e2eKeyId });
			Notifications.notifyUsersOfRoom(this.roomId, 'e2ekeyRequest', this.roomId, room.e2eKeyId);
		}
	}

	private async handleCreatingKeys(): Promise<void> {
		// TODO CHECK_PERMISSION
		await this.createGroupKey();
		this.setState(E2ERoomState.READY);
	}

	handshake(): void {
		this.logger.log('handshake');
		this.setState(E2ERoomState.ESTABLISHING);
	}

	catchError(error: unknown): void {
		this.setState(E2ERoomState.ERROR);
		this.logger.logError(error);
	}

	enable(): void {
		this.setState(E2ERoomState.READY);
	}

	isReady(): boolean {
		return this.state === E2ERoomState.READY;
	}

	isDisabled(): boolean {
		return this.state === E2ERoomState.DISABLED;
	}

	disable(): void {
		this.setState(E2ERoomState.DISABLED);
	}

	private pause(): void {
		this.logger.log('PAUSED', this[PAUSED], '->', true);
		this[PAUSED] = true;
		this.emit('PAUSED', true);
	}

	private resume(): void {
		this.logger.log('PAUSED', this[PAUSED], '->', false);
		this[PAUSED] = false;
		this.emit('PAUSED', false);
	}

	toggle(enabled = this.isDisabled()): void {
		if (enabled && this.isDisabled()) {
			this.resume();
			return;
		}

		if (!enabled && !this.isDisabled()) {
			this.pause();
		}
	}

	keyReceived(): void {
		this.setState(E2ERoomState.KEYS_RECEIVED);
	}

	async shouldConvertSentMessages(): Promise<boolean> {
		if (!this.isReady() || this[PAUSED]) {
			return false;
		}

		if (this[PAUSED] === undefined) {
			return new Promise((resolve) => {
				this.once('PAUSED', resolve);
			});
		}

		return true;
	}

	shouldConvertReceivedMessages(): boolean {
		return this.isReady();
	}

	isWaitingKeys(): boolean {
		return this.state === E2ERoomState.WAITING_KEYS;
	}

	get keyID(): string {
		return this[KEY_ID];
	}

	set keyID(keyID: string) {
		this[KEY_ID] = keyID;
	}

	private async decryptMessageText(msg: string): Promise<string | undefined> {
		const result = await this.decrypt(msg);

		if (typeof result === 'string') {
			return result;
		}

		if (typeof result === 'object') {
			return result.text;
		}

		return undefined;
	}

	async decryptLastMessage(): Promise<void> {
		const subscription: ISubscription | undefined = Subscriptions.findOne({ rid: this.roomId });

		if (!subscription) {
			this.logger.log('decryptLastMessage', 'no subscription to decrypt');
			return;
		}

		const msg = subscription?.lastMessage?.msg;

		if (!msg) {
			this.logger.log('decryptLastMessage', 'no last message to decrypt');
			return;
		}

		const decryptedText = await this.decryptMessageText(msg);

		if (!decryptedText) {
			this.logger.log('decryptLastMessage', 'nothing to do');
			return;
		}

		Subscriptions.direct.update({
			_id: subscription._id,
		}, {
			$set: {
				'lastMessage.msg': decryptedText,
				'lastMessage.e2e': 'done',
			},
		});
		this.logger.log('decryptLastMessage', { _id: subscription._id }, 'done');
	}

	async decryptPendingMessages(): Promise<void> {
		return Messages.find({ rid: this.roomId, t: 'e2e', e2e: 'pending' }).forEach(async ({ _id, ...msg }: IMessage) => {
			Messages.direct.update({ _id }, await this.decryptMessage(msg));
		});
	}

	async importGroupKey(groupKey: string): Promise<void> {
		this.logger.log('Importing room key ->', this.roomId);
		// Get existing group key
		// const keyID = groupKey.slice(0, 12);
		groupKey = groupKey.slice(12);
		const _groupKey = Base64.decode(groupKey);

		// Decrypt obtained encrypted session key
		try {
			if (e2e.privateKey === null) {
				throw new Error('TODO');
			}

			const decryptedKey = await decryptRSA(e2e.privateKey, _groupKey);
			this.sessionKeyExportedString = toString(decryptedKey);
		} catch (error) {
			return this.logger.logError('Error decrypting group key: ', error);
		}

		this.keyID = Base64.encode(this.sessionKeyExportedString).slice(0, 12);

		// Import session key for use.
		try {
			const key = await importAESKey(JSON.parse(this.sessionKeyExportedString));
			// Key has been obtained. E2E is now in session.
			this.groupSessionKey = key;
		} catch (error) {
			return this.logger.logError('Error importing group key: ', error);
		}
	}

	async createGroupKey(): Promise<void> {
		this.logger.log('Creating room key');
		// Create group key
		try {
			this.groupSessionKey = await generateAESKey();
		} catch (error) {
			console.error('Error generating group key: ', error);
			throw error;
		}

		try {
			const sessionKeyExported = await exportJWKKey(this.groupSessionKey);
			this.sessionKeyExportedString = JSON.stringify(sessionKeyExported);
			this.keyID = Base64.encode(this.sessionKeyExportedString).slice(0, 12);

			await call('e2e.setRoomKeyID', this.roomId, this.keyID);
			await this.encryptKeyForOtherParticipants();
		} catch (error) {
			this.logger.logError('Error exporting group key: ', error);
			throw error;
		}
	}

	async encryptKeyForOtherParticipants(): Promise<void> {
		// Encrypt generated session key for every user in room and publish to subscription model.
		try {
			const { users } = await call('e2e.getUsersOfRoomWithoutKey', this.roomId);
			users.forEach((user) => this.encryptForParticipant(user));
		} catch (error) {
			return this.logger.logError('Error getting room users: ', error);
		}
	}

	async encryptForParticipant(user: IUser): Promise<void> {
		let userKey;
		try {
			if (!user.e2e) {
				throw new Error('missing e2e key pair for user');
			}

			userKey = await importRSAKey(JSON.parse(user.e2e.public_key), ['encrypt']);
		} catch (error) {
			return this.logger.logError('Error importing user key: ', error);
		}
		// const vector = crypto.getRandomValues(new Uint8Array(16));

		// Encrypt session key for this user with his/her public key
		try {
			const encryptedUserKey = await encryptRSA(userKey, toArrayBuffer(this.sessionKeyExportedString));
			// Key has been encrypted. Publish to that user's subscription model for this room.
			await call('e2e.updateGroupKey', this.roomId, user._id, this.keyID + Base64.encode(new Uint8Array(encryptedUserKey)));
		} catch (error) {
			return this.logger.logError('Error encrypting user key: ', error);
		}
	}

	// Encrypts files before upload. I/O is in arraybuffers.
	async encryptFile(file: File): Promise<File | void> {
		if (!E2ERoom.isSupportedRoomType(this.typeOfRoom)) {
			return;
		}

		const fileArrayBuffer = await readFileAsArrayBuffer(file);

		const vector = crypto.getRandomValues(new Uint8Array(16));
		let result;
		try {
			result = await encryptAES(vector, this.groupSessionKey, fileArrayBuffer);
		} catch (error) {
			return this.logger.logError('Error encrypting group key: ', error);
		}

		const output = joinVectorAndEcryptedData(vector, result);

		const chunk = toArrayBuffer(EJSON.stringify(output));

		if (!chunk) {
			throw new Error('TODO');
		}

		const encryptedFile = new File([chunk], file.name);

		return encryptedFile;
	}

	// Decrypt uploaded encrypted files. I/O is in arraybuffers.
	async decryptFile(message: string): Promise<ArrayBuffer | false | void> {
		if (message[0] !== '{') {
			return;
		}

		const [vector, cipherText] = splitVectorAndEcryptedData(EJSON.parse(message) as Uint8Array);

		try {
			return await decryptAES(vector, this.groupSessionKey, cipherText);
		} catch (error) {
			this.logger.logError('Error decrypting file: ', error);

			return false;
		}
	}

	// Encrypts messages
	async encryptText(data: Uint8Array | string): Promise<string> {
		if (typeof data === 'string') {
			data = new TextEncoder().encode(EJSON.stringify({ text: data, ack: Random.id((Random.fraction() + 1) * 20) }));
		}

		const vector = crypto.getRandomValues(new Uint8Array(16));
		let result;
		try {
			result = await encryptAES(vector, this.groupSessionKey, data);
		} catch (error) {
			this.logger.logError('Error encrypting message: ', error);
			throw new Error('TODO');
		}

		return this.keyID + Base64.encode(joinVectorAndEcryptedData(vector, result));
	}

	// Helper function for encryption of messages
	async encrypt(message: IMessage): Promise<string> {
		if (!E2ERoom.isSupportedRoomType(this.typeOfRoom)) {
			return message.msg;
		}

		let ts;
		if (isNaN(TimeSync.serverOffset())) {
			ts = new Date();
		} else {
			ts = new Date(Date.now() + TimeSync.serverOffset());
		}

		const data = new TextEncoder().encode(EJSON.stringify({
			_id: message._id,
			text: message.msg,
			userId: this.userId,
			ts,
		}));

		return this.encryptText(data);
	}

	// Decrypt messages

	async decryptMessage(message: Omit<IMessage, '_id'>): Promise<Omit<IMessage, '_id'>> {
		if (message.t !== 'e2e' || message.e2e === 'done') {
			return message;
		}

		const data = await this.decrypt(message.msg);

		if (typeof data === 'string' || !data?.text) {
			return message;
		}

		return {
			...message,
			msg: data.text,
			e2e: 'done',
		};
	}

	async decrypt(message: string): Promise<string | { text: string } | void> {
		if (!E2ERoom.isSupportedRoomType(this.typeOfRoom)) {
			return message;
		}

		const keyID = message.slice(0, 12);

		if (keyID !== this.keyID) {
			return message;
		}

		message = message.slice(12);

		const [vector, cipherText] = splitVectorAndEcryptedData(Base64.decode(message));

		try {
			const result = await decryptAES(vector, this.groupSessionKey, cipherText);
			return EJSON.parse(new TextDecoder().decode(new Uint8Array(result))) as { text: string };
		} catch (error) {
			return this.logger.logError('Error decrypting message: ', error, message);
		}
	}

	provideKeyToUser(keyId: string): void {
		if (this.keyID !== keyId) {
			return;
		}

		this.encryptKeyForOtherParticipants();
	}
}
