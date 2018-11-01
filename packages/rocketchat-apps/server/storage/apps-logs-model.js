import { RocketChat } from 'meteor/rocketchat:lib';

export class AppsLogsModel extends RocketChat.models._Base {
	constructor() {
		super('apps_logs');
	}
}
