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
		const api = new BigBlueButtonApi('https://html5-dev.mconf.com/bigbluebutton/api', 'cda391c08ddc8322de34ec2823b1e0d1');

		const params = {
			allowStartStopRecording: false,
			autoStartRecording: false,
			meetingID: rid,
			password: 'mp',
			attendeePW: 'ap',
			moderatorPW: 'mp',
			name: rid,
			fullName: 'User 8584148',
			record: false,
			recordID: 'random-9998650',
			voiceBridge: '71727',
			welcome: '<br>Welcome to <b>%%CONFNAME%%</b>!',
			publish: false,
			random: '416074726',
			clientURL: 'https://html5-dev.mconf.com/html5client/join'
		};

		// https://html5-dev.mconf.com/html5client/join?sessionToken=xpng6qe7cvnqf0cn

		const createUrl = api.urlFor('create', params);
		const createResult = HTTP.get(createUrl);
		const doc = parseString(createResult.content);

		if (doc.response.returncode[0]) {
			return {
				url: api.urlFor('join', params)
			};
		}
	}
});
