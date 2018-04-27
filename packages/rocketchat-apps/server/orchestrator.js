import { RealAppBridges } from './bridges';
import { AppMethods, AppsRestApi, AppServerNotifier } from './communication';
import { AppMessagesConverter, AppRoomsConverter, AppSettingsConverter, AppUsersConverter } from './converters';
import { AppsLogsModel, AppsModel, AppsPersistenceModel, AppRealStorage, AppRealLogsStorage } from './storage';

import { AppManager } from '@rocket.chat/apps-engine/server/AppManager';

export class AppServerOrchestrator {
	constructor() {
		if (RocketChat.models && RocketChat.models.Permissions) {
			RocketChat.models.Permissions.createOrUpdate('manage-apps', ['admin']);
		}

		this._model = new AppsModel();
		this._logModel = new AppsLogsModel();
		this._persistModel = new AppsPersistenceModel();
		this._storage = new AppRealStorage(this._model);
		this._logStorage = new AppRealLogsStorage(this._logModel);

		this._converters = new Map();
		this._converters.set('messages', new AppMessagesConverter(this));
		this._converters.set('rooms', new AppRoomsConverter(this));
		this._converters.set('settings', new AppSettingsConverter(this));
		this._converters.set('users', new AppUsersConverter(this));

		this._bridges = new RealAppBridges(this);

		this._manager = new AppManager(this._storage, this._logStorage, this._bridges);

		this._communicators = new Map();
		this._communicators.set('methods', new AppMethods(this._manager));
		this._communicators.set('notifier', new AppServerNotifier(this));
		this._communicators.set('restapi', new AppsRestApi(this, this._manager));
	}

	getModel() {
		return this._model;
	}

	getPersistenceModel() {
		return this._persistModel;
	}

	getStorage() {
		return this._storage;
	}

	getLogStorage() {
		return this._logStorage;
	}

	getConverters() {
		return this._converters;
	}

	getBridges() {
		return this._bridges;
	}

	getNotifier() {
		return this._communicators.get('notifier');
	}

	getManager() {
		return this._manager;
	}

	isEnabled() {
		return true;
	}

	isLoaded() {
		return this.getManager().areAppsLoaded();
	}
}
