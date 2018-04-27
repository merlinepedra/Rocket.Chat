import { IAppActivationBridge } from "@rocket.chat/apps-engine/server/bridges";

import { AppServerOrchestrator } from '../orchestrator';

export class AppActivationBridge implements IAppActivationBridge {
	private orch: AppServerOrchestrator;

	constructor(orch) {
		this.orch = orch;
	}

	async appAdded(app) {
		await this.orch.getNotifier().appAdded(app.getID());
	}

	async appUpdated(app) {
		await this.orch.getNotifier().appUpdated(app.getID());
	}

	async appRemoved(app) {
		await this.orch.getNotifier().appRemoved(app.getID());
	}

	async appStatusChanged(app, status) {
		await this.orch.getNotifier().appStatusUpdated(app.getID(), status);
	}
}
