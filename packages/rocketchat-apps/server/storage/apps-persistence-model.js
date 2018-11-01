import { RocketChat } from 'meteor/rocketchat:lib';

export class AppsPersistenceModel extends RocketChat.models._Base {
	constructor() {
		super('apps_persistence');
	}
}
