import { RocketChat } from 'meteor/rocketchat:lib';

export class AppsModel extends RocketChat.models._Base {
	constructor() {
		super('apps');
	}
}
