import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { Messages, Rooms } from '../../../../models/server';
import { settings } from '../../../../settings/server';
import { API } from '../../../../api/server';
import { hasPermission, canSendMessage } from '../../../../authorization/server';
import { Livechat } from '../../lib/Livechat';
import { hasPermissionAsync } from '../../../../authorization/server/functions/hasPermission';
import { canSendMessageAsync } from '../../../../authorization/server/functions/canSendMessage';

API.v1.addRoute(
	'livechat/webrtc.call',
	{ authRequired: true },
	{
		async get() {
			check(this.queryParams, {
				rid: Match.Maybe(String),
			});

			if (!await hasPermissionAsync(this.userId, 'view-l-room')) {
				return API.v1.unauthorized();
			}

			const room = canSendMessage(this.queryParams.rid, {
				uid: this.userId,
				username: this.user.username,
				type: this.user.type,
			});
			if (!room) {
				throw new Meteor.Error('not-allowed');
			}

			if (!settings.get('WebRTC_Enabled') === true && settings.get('Omnichannel_call_provider') === 'WebRTC') {
				throw new Meteor.Error('webRTC calling not enabled');
			}

			// const config = await settings();
			// if (!config.theme || !config.theme.actionLinks || !config.theme.actionLinks.webrtc) {
			// 	throw new Meteor.Error('invalid-livechat-config');
			// }

			let { callStatus } = room;

			if (!callStatus || callStatus === 'ended' || callStatus === 'declined') {
				callStatus = 'ringing';
				await Rooms.setCallStatusAndCallStartTime(room._id, callStatus);
				await Messages.createWithTypeRoomIdMessageAndUser(
					'livechat_webrtc_video_call',
					room._id,
					TAPi18n.__('Join_my_room_to_start_the_video_call'),
					this.user,
					{
						actionLinks: [
							{
								i18nLabel: 'Join_call',
								label: TAPi18n.__('Join_call'),
								// eslint-disable-next-line @typescript-eslint/camelcase
								method_id: 'joinLivechatWebRTCCall',
							},
							{
								i18nLabel: 'End_call',
								label: TAPi18n.__('End_call'),
								// eslint-disable-next-line @typescript-eslint/camelcase
								method_id: 'endLivechatWebRTCCall',
								danger: true,
							},
						],
					},
				);
			}
			return API.v1.success({
				videoCall: {
					rid: room._id,
					provider: 'webrtc' as const,
					callStatus,
				},
			});
		},
	},
);

API.v1.addRoute(
	'livechat/webrtc.call/:callId',
	{ authRequired: true },
	{
		async put() {
			check(this.urlParams, {
				callId: String,
			});

			check(this.bodyParams, {
				rid: Match.Maybe(String),
				status: Match.Maybe(String),
			});

			const { callId } = this.urlParams;
			const { rid, status } = this.bodyParams;

			if (!hasPermission(this.userId, 'view-l-room') || !await canSendMessageAsync(rid, {
				uid: this.userId,
				username: this.user.username,
				type: this.user.type,
			})) {
				return API.v1.unauthorized();
			}

			const call = await Messages.findOneById(callId);
			if (!call || call.t !== 'livechat_webrtc_video_call') {
				throw new Meteor.Error('invalid-callId');
			}

			await Livechat.updateCallStatus(callId, rid, status, this.user);

			return API.v1.success({ status });
		},
	},
);
