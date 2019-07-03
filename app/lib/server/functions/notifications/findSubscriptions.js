import { Subscriptions } from '../../../../models/server/raw';

const project = {
	$project: {
		audioNotifications: 1,
		desktopNotificationDuration: 1,
		desktopNotifications: 1,
		emailNotifications: 1,
		mobilePushNotifications: 1,
		muteGroupMentions: 1,
		name: 1,
		userHighlights: 1,
		'u._id': 1,
		'receiver.active': 1,
		'receiver.emails': 1,
		'receiver.language': 1,
		'receiver.status': 1,
		'receiver.statusConnection': 1,
		'receiver.username': 1,
	},
};

const filter = {
	$match: {
		'receiver.active': true,
	},
};

const lookup = {
	$lookup: {
		from: 'users',
		localField: 'u._id',
		foreignField: '_id',
		as: 'receiver',
	},
};

const notificationTypes = ['audio', 'desktop', 'mobile', 'email'];

// the query is defined by the server's default values and Notifications_Max_Room_Members setting.
export async function findSubscriptions({
	rid,
	roomType,
	senderId,
	usersInThread,
	disableAllMessageNotifications,
	mentionIdsWithoutGroups,
	hasMentionToAll,
	hasMentionToHere,
	serverNotificationPreference,
}) {
	const query = {
		rid,
		ignored: { $ne: senderId },
		disableNotifications: { $ne: true },
		$or: [
			{ 'userHighlights.0': { $exists: 1 } },
			...usersInThread.length > 0 ? [{ 'u._id': { $in: usersInThread } }] : [],
		],
	};

	notificationTypes.forEach((kind) => {
		const notificationField = `${ kind === 'mobile' ? 'mobilePush' : kind }Notifications`;

		const filter = { [notificationField]: 'all' };

		if (disableAllMessageNotifications) {
			filter[`${ kind }PrefOrigin`] = { $ne: 'user' };
		}

		query.$or.push(filter);

		if (mentionIdsWithoutGroups.length > 0) {
			query.$or.push({
				[notificationField]: 'mentions',
				'u._id': { $in: mentionIdsWithoutGroups },
			});
		} else if (!disableAllMessageNotifications && (hasMentionToAll || hasMentionToHere)) {
			query.$or.push({
				[notificationField]: 'mentions',
			});
		}

		if ((roomType === 'd' && serverNotificationPreference[kind] !== 'nothing') || (!disableAllMessageNotifications && (serverNotificationPreference[kind] === 'all' || hasMentionToAll || hasMentionToHere))) {
			query.$or.push({
				[notificationField]: { $exists: false },
			});
		} else if (serverNotificationPreference[kind] === 'mentions' && mentionIdsWithoutGroups.length > 0) {
			query.$or.push({
				[notificationField]: { $exists: false },
				'u._id': { $in: mentionIdsWithoutGroups },
			});
		}
	});

	return Subscriptions.aggregate([
		{ $match: query },
		lookup,
		filter,
		project,
	]).toArray();
}
