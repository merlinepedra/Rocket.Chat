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
			this.decryptSubscription();
		});

		this.on('STATE_CHANGED', () => {
			this.handshake();
		});
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

	isReady(): boolean {
		return this.state === E2ERoomState.READY;
	}

	isDisabled(): boolean {
		return this.state === E2ERoomState.DISABLED;
	}

	enable(): void {
		if (this.state === E2ERoomState.READY) {
			return;
		}

		this.setState(E2ERoomState.READY);
	}

	disable(): void {
		this.setState(E2ERoomState.DISABLED);
	}

	pause(): void {
		this.logger.log('PAUSED', this[PAUSED], '->', true);
		this[PAUSED] = true;
		this.emit('PAUSED', true);
	}

	resume(): void {
		this.logger.log('PAUSED', this[PAUSED], '->', false);
		this[PAUSED] = false;
		this.emit('PAUSED', false);
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

	async decryptSubscription(): Promise<void> {
		const subscription: ISubscription | undefined = Subscriptions.findOne({ rid: this.roomId });

		if (!subscription) {
			this.logger.log('decryptSubscription', 'no subscription to decrypt');
			return;
		}

		const msg = subscription?.lastMessage?.msg;

		if (!msg) {
			this.logger.log('decryptSubscription', 'no last message to decrypt');
			return;
		}

		const decryptedText = await this.decryptMessageText(msg);

		if (!decryptedText) {
			this.logger.log('decryptSubscription', 'nothing to do');
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
		this.logger.log('decryptSubscription', { _id: subscription._id }, 'done');
	}

	async decryptPendingMessages(): Promise<void> {
		return Messages.find({ rid: this.roomId, t: 'e2e', e2e: 'pending' }).forEach(async ({ _id, ...msg }: IMessage) => {
			Messages.direct.update({ _id }, await this.decryptMessage(msg));
		});
	}

	// Initiates E2E Encryption
	async handshake(): Promise<void> {
		if (this.state !== E2ERoomState.KEYS_RECEIVED && this.state !== E2ERoomState.NOT_STARTED) {
			return;
		}

		this.setState(E2ERoomState.ESTABLISHING);

		try {
			const groupKey = Subscriptions.findOne({ rid: this.roomId }).E2EKey;
			if (groupKey) {
				await this.importGroupKey(groupKey);
				this.setState(E2ERoomState.READY);
				return;
			}
		} catch (error) {
			this.setState(E2ERoomState.ERROR);
			this.logger.logError('Error fetching group key: ', error);
			return;
		}

		try {
			const room = Rooms.findOne({ _id: this.roomId });
			if (!room.e2eKeyId) { // TODO CHECK_PERMISSION
				this.setState(E2ERoomState.CREATING_KEYS);
				await this.createGroupKey();
				this.setState(E2ERoomState.READY);
				return;
			}

			this.setState(E2ERoomState.WAITING_KEYS);
			this.logger.log('Requesting room key');
			Notifications.notifyUsersOfRoom(this.roomId, 'e2ekeyRequest', this.roomId, room.e2eKeyId);
		} catch (error) {
			// this.error = error;
			this.setState(E2ERoomState.ERROR);
		}
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
