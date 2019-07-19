import { BaseRaw } from './BaseRaw';

import { Users } from './index';

export class SubscriptionsRaw extends BaseRaw {
	findOneByRoomIdAndUserId(rid, uid, options) {
		const query = {
			rid,
			'u._id': uid,
		};

		return this.col.findOne(query, options);
	}

	isUserInRole(uid, roleName, rid) {
		if (rid == null) {
			return;
		}

		const query = {
			'u._id': uid,
			rid,
			roles: roleName,
		};

		return this.findOne(query, { fields: { roles: 1 } });
	}

	async findUsersInRoles(roles, scope, options) {
		const query = {
			roles: { $in: [].concat(roles) },
		};

		if (scope) {
			query.rid = scope;
		}

		const subscriptions = await this.find(query, { projection: { 'u._id': 1 } }).toArray();
		if (subscriptions.length === 0) {
			return [];
		}

		const uids = new Set(
			subscriptions
				.filter((sub) => sub && sub.u && sub.u._id)
				.map((sub) => sub.u._id)
		);

		return Users.find({ _id: { $in: [...uids] } }, options);
	}
}
