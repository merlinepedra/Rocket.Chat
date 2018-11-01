import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { AppClientOrchestrator } from './orchestrator';
import { Apps } from '../lib/Apps';
import { RocketChat } from 'meteor/rocketchat:lib';
import '../assets/stylesheets/apps.css';
import './admin/apps.html';
import './admin/apps';
import './admin/appManage.html';
import './admin/appManage';
import './admin/appInstall.html';
import './admin/appInstall';
import './admin/appLogs.html';
import './admin/appLogs';
import './admin/appWhatIsIt.html';
import './admin/appWhatIsIt';


Meteor.startup(function _rlClientOrch() {
	Apps = new AppClientOrchestrator();

	RocketChat.CachedCollectionManager.onLogin(() => {
		Meteor.call('apps/is-enabled', (error, isEnabled) => {
			Apps.load(isEnabled);
		});
	});
});

const appsRouteAction = function _theRealAction(whichCenter) {
	Meteor.defer(() => Apps.getLoadingPromise().then((isEnabled) => {
		if (isEnabled) {
			BlazeLayout.render('main', { center: whichCenter, old: true }); // TODO remove old
		} else {
			FlowRouter.go('app-what-is-it');
		}
	}));
};

// Bah, this has to be done *before* `Meteor.startup`
FlowRouter.route('/admin/apps', {
	name: 'apps',
	action() {
		appsRouteAction('apps');
	},
});

FlowRouter.route('/admin/app/install', {
	name: 'app-install',
	action() {
		appsRouteAction('appInstall');
	},
});

FlowRouter.route('/admin/apps/:appId', {
	name: 'app-manage',
	action() {
		appsRouteAction('appManage');
	},
});

FlowRouter.route('/admin/apps/:appId/logs', {
	name: 'app-logs',
	action() {
		appsRouteAction('appLogs');
	},
});

FlowRouter.route('/admin/app/what-is-it', {
	name: 'app-what-is-it',
	action() {
		Meteor.defer(() => Apps.getLoadingPromise().then((isEnabled) => {
			if (isEnabled) {
				FlowRouter.go('apps');
			} else {
				BlazeLayout.render('main', { center: 'appWhatIsIt' });
			}
		}));
	},
});

export {
	Apps,
};
