import './OEmbedCacheCleanup';
import './addAllUserToRoom';
import './addRoomLeader';
import './addRoomModerator';
import './addRoomOwner';
import './afterVerifyEmail';
import './browseChannels';
import './canAccessRoom';
import './channelsList';
import './createDirectMessage';
import './deleteFileMessage';
import './deleteUser';
import './eraseRoom';
import './getAvatarSuggestion';
import './getPasswordPolicy';
import './getRoomById';
import './getRoomIdByNameOrId';
import './getRoomNameById';
import './getSetupWizardParameters';
import './getTotalChannels';
import './getUsersOfRoom';
import './hideRoom';
import './ignoreUser';
import './loadHistory';
import './loadLocale';
import './loadMissedMessages';
import './loadNextMessages';
import './loadSurroundingMessages';
import './logoutCleanUp';
import './messageSearch';
import './migrate';
import './muteUserInRoom';
import './openRoom';
import './readMessages';
import './readThreads';
import './registerUser';
import './removeRoomLeader';
import './removeRoomModerator';
import './removeRoomOwner';
import './removeUserFromRoom';
import './reportMessage';
import './requestDataDownload';
import './resetAvatar';
import './roomNameExists';
import './saveUserPreferences';
import './saveUserProfile';
import './sendConfirmationEmail';
import './sendForgotPasswordEmail';
import './setAvatarFromService';
import './setUserActiveStatus';
import './setUserPassword';
import './toogleFavorite';
import './unmuteUserInRoom';
import { Meteor } from 'meteor/meteor';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import userSetUtcOffset from './userSetUtcOffset';

const methods = {
	userSetUtcOffset,
} as const;

Meteor.methods(methods);

const hasRule = <F>(fn: F): fn is F & {
	rule: Omit<DDPRateLimiter.Matcher, 'type' | 'name'> & {
		numRequests: number;
		timeInterval: number;
	};
} => 'rule' in fn
	&& typeof (fn as F & { rule: unknown }).rule === 'object'
	&& (fn as F & { rule: unknown }).rule !== null
	&& typeof (fn as F & { rule: { numRequests: unknown } }).rule.numRequests === 'number'
	&& typeof (fn as F & { rule: { timeInterval: unknown } }).rule.timeInterval === 'number';

for (const [methodName, fn] of Object.entries(methods)) {
	if (!hasRule(fn)) {
		continue;
	}

	const { numRequests, timeInterval, ...matcher } = fn.rule;
	DDPRateLimiter.addRule({
		type: 'method',
		name: methodName,
		...matcher,
	}, numRequests, timeInterval);
}

export type MethodName = keyof typeof methods;
export type MethodParams<M extends MethodName> = Parameters<typeof methods[M]>;
export type MethodReturn<M extends MethodName> = ReturnType<typeof methods[M]>;

export const callSync = <M extends MethodName>(methodName: M, ...params: MethodParams<M>): MethodReturn<M> =>
	Meteor.call(methodName, ...params);

export const call = <M extends MethodName>(methodName: M, ...params: MethodParams<M>): Promise<MethodReturn<M>> => new Promise((resolve, reject) => {
	Meteor.call(methodName, ...params, (error: Meteor.Error | null, result: MethodReturn<M>) => {
		if (error) {
			reject(error);
			return;
		}

		resolve(result);
	});
});

export default methods;
