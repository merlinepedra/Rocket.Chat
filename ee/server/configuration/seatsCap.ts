import { IncomingMessage, ServerResponse } from 'http';

import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import { WebApp } from 'meteor/webapp';

import type { IToggleableFeature } from '../lib/featureToggle';
import { isEnterprise } from '../../app/license/server';
import {
	createSeatsLimitBanners,
	disableDangerBannerDiscardingDismissal,
	disableWarningBannerDiscardingDismissal,
	enableDangerBanner,
	enableWarningBanner,
} from '../../app/license/server/maxSeatsBanners';
import { canAddNewUser, getMaxActiveUsers } from '../../app/license/server/license';
import { validateUserRoles } from '../../app/authorization/server/validateUserRoles';
import type { IUser } from '../../../definition/IUser';
import { Users } from '../../../app/models/server';
import { callbacks } from '../../../app/callbacks/server';
import { getSeatsRequestLink } from '../../app/license/server/getSeatsRequestLink';
import { Analytics } from '../../../server/sdk';

const handleOnCreateUser = ({ isGuest }: { isGuest: boolean }): void => {
	if (isGuest) {
		return;
	}

	if (!canAddNewUser()) {
		throw new Meteor.Error('error-license-user-limit-reached', TAPi18n.__('error-license-user-limit-reached'));
	}
};

const handleBeforeActiveUser = (user: IUser): void => {
	if (user.roles.length === 1 && user.roles.includes('guest')) {
		return;
	}

	if (user.type === 'app') {
		return;
	}

	if (!canAddNewUser()) {
		throw new Meteor.Error('error-license-user-limit-reached', TAPi18n.__('error-license-user-limit-reached'));
	}
};

const handleValidateUserRoles = (userData: Record<string, any>): void => {
	const isGuest = userData.roles?.includes('guest');
	if (isGuest) {
		validateUserRoles(Meteor.userId(), userData);
		return;
	}

	if (!userData._id) {
		return;
	}

	const currentUserData = Users.findOneById(userData._id);
	if (currentUserData.type === 'app') {
		return;
	}

	const wasGuest = currentUserData?.roles?.length === 1 && currentUserData.roles.includes('guest');
	if (!wasGuest) {
		return;
	}

	if (!canAddNewUser()) {
		throw new Meteor.Error('error-license-user-limit-reached', TAPi18n.__('error-license-user-limit-reached'));
	}
};

const handleMaxSeatsBanners = (): void => {
	const maxActiveUsers = getMaxActiveUsers();

	if (!maxActiveUsers) {
		disableWarningBannerDiscardingDismissal();
		disableDangerBannerDiscardingDismissal();
		return;
	}

	const activeUsers = Users.getActiveLocalUserCount();

	// callback runs before user is added, so we should add the user
	// that is being created to the current value.
	const ratio = activeUsers / maxActiveUsers;
	const seatsLeft = maxActiveUsers - activeUsers;

	if (ratio < 0.8 || ratio >= 1) {
		disableWarningBannerDiscardingDismissal();
	} else {
		enableWarningBanner(seatsLeft);
	}

	if (ratio < 1) {
		disableDangerBannerDiscardingDismissal();
	} else {
		enableDangerBanner();
	}
};

export class SeatsCap implements IToggleableFeature {
	isEnabled(): boolean {
		return isEnterprise();
	}

	initialize(): void {
		createSeatsLimitBanners();

		WebApp.connectHandlers.use('/requestSeats/', Meteor.bindEnvironment((_req: IncomingMessage, res: ServerResponse, next: () => void) => {
			if (!this.isEnabled()) {
				next();
				return;
			}

			const url = getSeatsRequestLink();

			Analytics.saveSeatRequest();
			res.writeHead(302, { Location: url });
			res.end();
			next();
		}));
	}

	attach(): void {
		handleMaxSeatsBanners();
		callbacks.add('onCreateUser', handleOnCreateUser, callbacks.priority.MEDIUM, 'check-max-user-seats');
		callbacks.add('beforeActivateUser', handleBeforeActiveUser, callbacks.priority.MEDIUM, 'check-max-user-seats');
		callbacks.add('validateUserRoles', handleValidateUserRoles, callbacks.priority.MEDIUM, 'check-max-user-seats');
		callbacks.add('afterCreateUser', handleMaxSeatsBanners, callbacks.priority.MEDIUM, 'handle-max-seats-banners');
		callbacks.add('afterSaveUser', handleMaxSeatsBanners, callbacks.priority.MEDIUM, 'handle-max-seats-banners');
		callbacks.add('afterDeleteUser', handleMaxSeatsBanners, callbacks.priority.MEDIUM, 'handle-max-seats-banners');
		callbacks.add('afterDeactivateUser', handleMaxSeatsBanners, callbacks.priority.MEDIUM, 'handle-max-seats-banners');
		callbacks.add('afterActivateUser', handleMaxSeatsBanners, callbacks.priority.MEDIUM, 'handle-max-seats-banners');
	}

	detach(): void {
		handleMaxSeatsBanners();
		callbacks.remove('onCreateUser', 'check-max-user-seats');
		callbacks.remove('beforeActivateUser', 'check-max-user-seats');
		callbacks.remove('validateUserRoles', 'check-max-user-seats');
		callbacks.remove('afterCreateUser', 'handle-max-seats-banners');
		callbacks.remove('afterSaveUser', 'handle-max-seats-banners');
		callbacks.remove('afterDeleteUser', 'handle-max-seats-banners');
		callbacks.remove('afterDeactivateUser', 'handle-max-seats-banners');
		callbacks.remove('afterActivateUser', 'handle-max-seats-banners');
	}
}
