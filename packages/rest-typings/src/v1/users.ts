import type { ITeam, IUser } from '@rocket.chat/core-typings';
import type { PaginatedRequest } from '../helpers/PaginatedRequest';
import type { PaginatedResult } from '../helpers/PaginatedResult';

export type UsersEndpoints = {
	'users.info': {
		GET: (params: { userId?: IUser['_id']; userName?: IUser['username'] }) => {
			user: IUser;
		};
	};
	'users.2fa.sendEmailCode': {
		POST: (params: { emailOrUsername: string }) => void;
	};
	'users.autocomplete': {
		GET: (params: { selector: string }) => { items: IUser[] };
	};
	'users.listTeams': {
		GET: (params: { userId: IUser['_id'] }) => { teams: Array<ITeam> };
	};
	'users.setAvatar': {
		POST: (params: { userId?: IUser['_id']; username?: IUser['username']; avatarUrl?: string }) => void;
	};
	'users.resetAvatar': {
		POST: (params: { userId?: IUser['_id']; username?: IUser['username'] }) => void;
	};
	'users.list': {
		GET: (params: PaginatedRequest<{
			text?: string;
		}>) => PaginatedResult<{
			users: Pick<IUser, '_id' | 'username' | 'name' | 'emails' | 'status' | 'active' | 'roles' | 'lastLogin' | 'avatarETag'>[];
		}>;
	};
};
