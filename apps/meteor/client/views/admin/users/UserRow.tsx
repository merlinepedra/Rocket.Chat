import { IUser } from '@rocket.chat/core-typings';
import { Box, Table } from '@rocket.chat/fuselage';
import { capitalize } from '@rocket.chat/string-helpers';
import { TranslationKey, useTranslation } from '@rocket.chat/ui-contexts';
import React, { CSSProperties, ReactElement } from 'react';

import { Roles } from '../../../../app/models/client';
import UserAvatar from '../../../components/avatar/UserAvatar';

type UserRowProps = {
	emails?: IUser['emails'];
	_id: IUser['_id'];
	username?: IUser['username'];
	name?: IUser['name'];
	roles: IUser['roles'];
	status?: IUser['status'];
	avatarETag?: IUser['avatarETag'];
	active: IUser['active'];
	onClick: (username: IUser['username']) => () => void;
	mediaQuery: boolean;
};

const style: CSSProperties = {
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis',
	overflow: 'hidden',
};

const UserRow = ({ emails, _id, username, name, roles, status, avatarETag, onClick, mediaQuery, active }: UserRowProps): ReactElement => {
	const t = useTranslation();

	const statusText = active ? t(capitalize(status || '') as TranslationKey) : t('Disabled');
	const roleNames = (roles || [])
		.map((roleId) => Roles.findOne(roleId, { fields: { name: 1 } })?.name)
		.filter((roleName) => !!roleName)
		.join(', ');

	return (
		<Table.Row onKeyDown={onClick(_id)} onClick={onClick(_id)} tabIndex={0} role='link' action qa-user-id={_id}>
			<Table.Cell style={style}>
				<Box display='flex' alignItems='center'>
					<UserAvatar size={mediaQuery ? 'x28' : 'x40'} username={username || ''} etag={avatarETag} />
					<Box display='flex' style={style} mi='x8'>
						<Box display='flex' flexDirection='column' alignSelf='center' style={style}>
							<Box fontScale='p2m' style={style} color='default'>
								{name || username}
							</Box>
							{!mediaQuery && name && (
								<Box fontScale='p2' color='hint' style={style}>
									{' '}
									{`@${username}`}{' '}
								</Box>
							)}
						</Box>
					</Box>
				</Box>
			</Table.Cell>
			{mediaQuery && (
				<Table.Cell>
					<Box fontScale='p2m' style={style} color='hint'>
						{username}
					</Box>{' '}
					<Box mi='x4' />
				</Table.Cell>
			)}
			<Table.Cell style={style}>{emails && emails.length && emails[0].address}</Table.Cell>
			{mediaQuery && <Table.Cell style={style}>{roleNames}</Table.Cell>}
			<Table.Cell fontScale='p2' color='hint' style={style}>
				{statusText}
			</Table.Cell>
		</Table.Row>
	);
};

export default UserRow;
