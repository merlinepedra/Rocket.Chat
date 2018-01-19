import BigBlueButtonApi from 'meteor/rocketchat:bigbluebutton';
import {HTTP} from 'meteor/http';
import xml2js from 'xml2js';

const parser = new xml2js.Parser({
	explicitRoot: true
});

const parseString = Meteor.wrapAsync(parser.parseString);

Meteor.methods({
	'jitsi:updateTimeout': (rid) => {

		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'jitsi:updateTimeout' });
		}

		const room = RocketChat.models.Rooms.findOneById(rid);
		const currentTime = new Date().getTime();

		const jitsiTimeout = new Date((room && room.jitsiTimeout) || currentTime).getTime();

		if (jitsiTimeout <= currentTime) {
			RocketChat.models.Rooms.setJitsiTimeout(rid, new Date(currentTime + 35*1000));
			const message = RocketChat.models.Messages.createWithTypeRoomIdMessageAndUser('jitsi_call_started', rid, '', Meteor.user(), {
				actionLinks : [
					{ icon: 'icon-videocam', label: TAPi18n.__('Click_to_join'), method_id: 'joinJitsiCall', params: ''}
				]
			});
			const room = RocketChat.models.Rooms.findOneById(rid);
			message.msg = TAPi18n.__('Started_a_video_call');
			message.mentions = [
				{
					_id:'here',
					username:'here'
				}
			];
			RocketChat.callbacks.run('afterSaveMessage', message, room);
		} else if ((jitsiTimeout - currentTime) / 1000 <= 15) {
			RocketChat.models.Rooms.setJitsiTimeout(rid, new Date(jitsiTimeout + 25*1000));
		}
	},

	'videobridge:join'({rid}) {
		if (!this.userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'videobridge:join' });
		}

		if (!Meteor.call('canAccessRoom', rid, this.userId)) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'videobridge:join' });
		}

		const url = 'https://html5-dev.mconf.com';
		const secret = 'cda391c08ddc8322de34ec2823b1e0d1';

		const api = new BigBlueButtonApi(`${ url }/bigbluebutton/api`, secret);

		const meetingID = RocketChat.settings.get('uniqueID') + rid;
		const room = RocketChat.models.Rooms.findOneById(rid);

		const createUrl = api.urlFor('create', {
			name: room.t === 'd' ? 'Direct' : room.name,
			meetingID,
			attendeePW: 'ap',
			moderatorPW: 'mp',
			welcome: '<br>Welcome to <b>%%CONFNAME%%</b>!',
			meta_html5chat: false,
			meta_html5navbar: false
		});

		const createResult = HTTP.get(createUrl);
		const doc = parseString(createResult.content);

		if (doc.response.returncode[0]) {
			const user = RocketChat.models.Users.findOneById(this.userId);
			return {
				url: api.urlFor('join', {
					password: 'mp', //mp if moderator ap if attendee
					meetingID,
					fullName: user.username,
					userID: user._id,
					avatarURL: Meteor.absoluteUrl(`avatar/${ user.username }`),
					clientURL: `${ url }/html5client/join`
				})
			};
		}
	}
});
