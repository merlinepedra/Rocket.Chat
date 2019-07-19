import { Roles } from '../../../models/server/raw';

export const getUsersInRoleAsync = async (roleName, scope, options) => {
	const users = await Roles.findUsersInRole(roleName, scope, options);

	return users && users.toArray();
};

export const getUsersInRole = (roleName, scope, options) =>
	Promise.await(getUsersInRoleAsync(roleName, scope, options));
