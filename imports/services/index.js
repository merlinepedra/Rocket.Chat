// import config from './moleculer.config';
import Notifications from './services/Notifications';
import Authorization from './services/authorization';
import Message from './services/message';
import User from './services/user';
import Settings from './services/settings';
import Core from '../rocketchat-lib/server/service';
import Apps from './services/apps';
import Streamer from '../rocketchat-streamer/index';
import PersonalAccessTokens from '../personal-access-tokens/server/service';
import GetReadReceipts from '../message-read-receipt/server/service';
import { ServiceBroker } from 'moleculer';
import { Meteor } from 'meteor/meteor';
import { RocketChat } from 'meteor/rocketchat:lib';
import config from './moleculer.config';

const broker = new ServiceBroker(config);

const { NOTIFICATION_DISABLE, HUB_DISABLE, PRESENCE_DISABLE } = process.env;

if (!NOTIFICATION_DISABLE) {
	broker.createService(Notifications);
}

broker.createService(Authorization);
broker.createService(User);
broker.createService(Settings);
broker.createService(Core);
broker.createService(PersonalAccessTokens);
broker.createService(GetReadReceipts);
broker.createService(Apps);

broker.createService(Message);

broker.createService(Streamer);

RocketChat.Services = broker;

Meteor.startup(() => {
	if (!HUB_DISABLE) {
		broker.createService(require('../rocketchat-hub/').default);
	}
	if (!PRESENCE_DISABLE) {
		broker.createService(require('../presence/server').default);
	}
	broker.start();
});



export default broker;
