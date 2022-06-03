import { Serialized, IUser } from '@rocket.chat/core-typings';
import { Box } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetting, useRolesDescription, useTranslation } from '@rocket.chat/ui-contexts';
import React, { useMemo, ReactElement, useState, useEffect } from 'react';

import { getUserEmailAddress } from '../../../../lib/getUserEmailAddress';
import { FormSkeleton } from '../../../components/Skeleton';
import UserCard from '../../../components/UserCard';
import { UserStatus } from '../../../components/UserStatus';
import { AsyncStatePhase } from '../../../hooks/useAsyncState';
import { useEndpointData } from '../../../hooks/useEndpointData';
import { getUserEmailVerified } from '../../../lib/utils/getUserEmailVerified';
import UserInfo from '../../room/contextualBar/UserInfo/UserInfo';
import { convertUserFromAPI } from './convertUserFromAPI';
import { UserInfoActions } from './UserInfoActions';

type UserInfoWithDataProps = {
	uid: string;
	username?: string;
	onReload: () => void;
};

const useUserFromAPI = (userFromAPI: Serialized<IUser> | undefined): IUser | undefined => {
	const [user, setUser] = useState<IUser | undefined>();

	useEffect(() => {
		if(!userFromAPI) {
			return;
		}
		const convertedUser = convertUserFromAPI(userFromAPI);
		setUser(convertedUser);
	}, []);

	return user;
};

const UserInfoWithData = ({ uid, username, onReload, ...props }: UserInfoWithDataProps): ReactElement => {
	const t = useTranslation();
	const showRealNames = useSetting('UI_Use_Real_Name');
	const getRoles = useRolesDescription();
	const approveManuallyUsers = useSetting('Accounts_ManuallyApproveNewUsers');

	const {
		value: data,
		phase: state,
		error,
		reload: reloadUserInfo,
	} = useEndpointData(
		'users.info',
		useMemo(() => ({ ...(uid && { userId: uid }), ...(username && { username }) }), [uid, username]),
	);

	const user = useUserFromAPI(data?.user);

	const onChange = useMutableCallback(() => {
		onReload();
		reloadUserInfo();
	});

	const userObj = useMemo(() => {
		if(!user) {
			return;
		}

		// const { user } = data || { user: {} };

		const { name, username, roles = [], status, statusText, bio, utcOffset, lastLogin, nickname } = user;

		return {
			name,
			username,
			lastLogin,
			showRealNames,
			roles: roles && getRoles(roles).map((role, index) => <UserCard.Role key={index}>{role}</UserCard.Role>),
			bio,
			phone: user.phone,
			utcOffset,
			customFields: {
				...user.customFields,
				...(approveManuallyUsers && user.active === false && user.reason && { Reason: user.reason }) as {},
			},
			verified: getUserEmailVerified(user),
			email: getUserEmailAddress(user),
			createdAt: user.createdAt,
			status: <UserStatus status={status} />,
			customStatus: statusText,
			nickname,
		};
	}, [approveManuallyUsers, data, showRealNames, getRoles]);

	if (state === AsyncStatePhase.LOADING) {
		return (
			<Box p='x24'>
				<FormSkeleton />
			</Box>
		);
	}

	if (error) {
		return <Box mbs='x16'>{t('User_not_found')}</Box>;
	}

	const admin = data?.user?.roles?.includes('admin');

	return (
		<UserInfo
			{...userObj}
			data={user}
			onChange={onChange}
			actions={
				user && (
					<UserInfoActions
						isActive={user.active}
						isAdmin={admin}
						_id={user._id}
						username={user.username}
						onChange={onChange}
						onReload={onReload}
					/>
				)
			}
			{...props}
		/>
	);
};

export default UserInfoWithData;
