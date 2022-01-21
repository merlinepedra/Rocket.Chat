import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { settings } from '../../settings/server';
import { Rooms } from '../../models/server';
import { slashCommands } from '../../utils/lib/slashCommand';
import { api } from '../../../server/sdk/api';

function Create(command: string, params: Record<string, any>, item: Record<string, string>) {
	function getParams(str: string) {
		const regex = /(--(\w+))+/g;
		const result = [];
		let m;
		while ((m = regex.exec(str)) !== null) {
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			result.push(m[2]);
		}
		return result;
	}

    let settings_channel_names = settings.get('UTF8_Channel_Names_Validation');

    if (typeof(settings_channel_names) !== 'string') {
        return;
    }

	const regexp = new RegExp(settings_channel_names);

	if (command !== 'create' || !Match.test(params, String)) {
		return;
	}
	let channel = regexp.exec(params.trim());

    if (!channel) {
        return;
    }

	let channel_str:string = channel ? channel[0] : '';
	if (channel_str === '') {
		return;
	}
    const userId = Meteor.userId();
	if (!userId) {
		return;
	}

	const user = Meteor.users.findOne(userId);
    if (!user) {
        return;
    }

	const room = Rooms.findOneByName(channel_str);
	if (room != null) {
		api.broadcast('notify.ephemeralMessage', userId, item.rid, {
			msg: TAPi18n.__('Channel_already_exist', {
				postProcess: 'sprintf',
				sprintf: [channel_str],
				lng: settings.get('Language') || 'en',
			}),
		});
		return;
	}

	if (getParams(params).indexOf('private') > -1) {
		return Meteor.call('createPrivateGroup', channel_str, []);
	}

	Meteor.call('createChannel', channel_str, []);
}

slashCommands.add('create', Create, {
	description: 'Create_A_New_Channel',
	params: '#channel',
	permission: ['create-c', 'create-p'],
});
