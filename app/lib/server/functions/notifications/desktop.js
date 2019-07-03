import { metrics } from '../../../../metrics';
import { Notifications } from '../../../../notifications';
import { roomTypes } from '../../../../utils';
/**
 * Send notification to user
 *
 * @param {string} userId The user to notify
 * @param {object} user The sender
 * @param {object} room The room send from
 * @param {object} message The message object
 * @param {number} duration Duration of notification
 * @param {string} notificationMessage The message text to send on notification body
 */
export function notifyDesktopUser({
	userId,
	user,
	message,
	room,
	duration,
	notificationMessage,
}) {
	const { title, text } = roomTypes.getConfig(room.t).getNotificationDetails(room, user, notificationMessage);

	metrics.notificationsSent.inc({ notification_type: 'desktop' });
	Notifications.notifyUser(userId, 'notification', {
		title,
		text,
		duration,
		payload: {
			_id: message._id,
			rid: message.rid,
			sender: message.u,
			type: room.t,
			name: room.name,
			message: {
				msg: message.msg,
				t: message.t,
			},
		},
	});
}

export function shouldNotifyDesktop({
	disableAllMessageNotifications,
	status,
	statusConnection,
	desktopNotifications,
	hasMentionToAll,
	hasMentionToHere,
	isHighlighted,
	hasMentionToUser,
	hasReplyToThread,
	roomType,
	serverDefaultPref,
}) {
	if (disableAllMessageNotifications && desktopNotifications == null && !isHighlighted && !hasMentionToUser && !hasReplyToThread) {
		return false;
	}

	if (statusConnection === 'offline' || status === 'busy' || desktopNotifications === 'nothing') {
		return false;
	}

	if (!desktopNotifications) {
		if (serverDefaultPref === 'all') {
			return true;
		}
		if (serverDefaultPref === 'nothing') {
			return false;
		}
	}

	return roomType === 'd' || (!disableAllMessageNotifications && (hasMentionToAll || hasMentionToHere)) || isHighlighted || desktopNotifications === 'all' || hasMentionToUser || hasReplyToThread;
}
