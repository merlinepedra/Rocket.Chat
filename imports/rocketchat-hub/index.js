import hub from './src';
import { RocketChat } from 'meteor/rocketchat:lib';
const { HUB_BROADCAST } = process.env;
export default hub({
	local: !HUB_BROADCAST,
	Users: RocketChat.models.Users.model.rawCollection(),
	Trash: RocketChat.models.Trash.rawCollection(),
	Messages: RocketChat.models.Messages.model.rawCollection(),
	Subscriptions: RocketChat.models.Subscriptions.model.rawCollection(),
	Rooms: RocketChat.models.Rooms.model.rawCollection(),
	Settings: RocketChat.models.Settings.model.rawCollection(),
});
