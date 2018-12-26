import { Meteor } from 'meteor/meteor';
import { InstanceStatus } from 'meteor/konecty:multiple-instances-status';
import { check } from 'meteor/check';
import _ from 'underscore';
import { DDP } from 'meteor/ddp';
import { DDPCommon } from 'meteor/ddp-common';
import { Logger, LoggerManager } from 'meteor/rocketchat:logger';
import { ServiceBroker } from 'moleculer';

process.env.PORT = String(process.env.PORT).trim();
process.env.INSTANCE_IP = String(process.env.INSTANCE_IP).trim();

const connections = {};
this.connections = connections;

const logger = new Logger('StreamBroadcast', {
	sections: {
		connection: 'Connection',
		auth: 'Auth',
		stream: 'Stream',
	},
});

function _authorizeConnection(instance) {
	logger.auth.info(`Authorizing with ${ instance }`);

	return connections[instance].call('broadcastAuth', InstanceStatus.id(), connections[instance].instanceId, function(err, ok) {
		if (err != null) {
			return logger.auth.error(`broadcastAuth error ${ instance } ${ InstanceStatus.id() } ${ connections[instance].instanceId }`, err);
		}

		connections[instance].broadcastAuth = ok;
		return logger.auth.info(`broadcastAuth with ${ instance }`, ok);
	});
}

function authorizeConnection(instance) {
	const query = {
		_id: InstanceStatus.id(),
	};

	if (!InstanceStatus.getCollection().findOne(query)) {
		return Meteor.setTimeout(function() {
			return authorizeConnection(instance);
		}, 500);
	}

	return _authorizeConnection(instance);
}

function startMatrixBroadcast() {
	const broker = new ServiceBroker({
		transporter: 'TCP',
	});

	broker.createService({
		name: 'broadcast',
		events: {
			'broadcast.notify'({ streamName, eventName, args }, sender) {

				// skip local broadcasts
				if (broker.nodeID === sender) {
					return;
				}

				const instance = Meteor.StreamerCentral.instances[streamName];
				if (!instance) {
					return 'stream-not-exists';
				}

				if (instance.serverOnly) {
					const scope = {};
					instance.emitWithScope(eventName, scope, ...args);
				} else {
					Meteor.StreamerCentral.instances[streamName]._emit(eventName, args);
				}
			},
		},
	});

	broker.start();

	Meteor.StreamerCentral.on('broadcast', function(streamName, eventName, args) {
		broker.broadcast('broadcast.notify', { streamName, eventName, args });
	});
}

Meteor.methods({
	broadcastAuth(remoteId, selfId) {
		check(selfId, String);
		check(remoteId, String);

		this.unblock();

		const query = {
			_id: remoteId,
		};

		if (selfId === InstanceStatus.id() && remoteId !== InstanceStatus.id() && (InstanceStatus.getCollection().findOne(query))) {
			this.connection.broadcastAuth = true;
		}

		return this.connection.broadcastAuth === true;
	},

	stream(streamName, eventName, args) {
		if (!this.connection) {
			return 'self-not-authorized';
		}

		if (this.connection.broadcastAuth !== true) {
			return 'not-authorized';
		}

		const instance = Meteor.StreamerCentral.instances[streamName];
		if (!instance) {
			return 'stream-not-exists';
		}

		if (instance.serverOnly) {
			const scope = {};
			instance.emitWithScope(eventName, scope, ...args);
		} else {
			Meteor.StreamerCentral.instances[streamName]._emit(eventName, args);
		}
	},
});

function startStreamCastBroadcast(value) {
	const instance = 'StreamCast';

	logger.connection.info('connecting in', instance, value);

	const connection = DDP.connect(value, {
		_dontPrintErrors: LoggerManager.logLevel < 2,
	});

	connections[instance] = connection;
	connection.instanceId = instance;
	connection.onReconnect = function() {
		return authorizeConnection(instance);
	};

	connection._stream.on('message', function(raw_msg) {
		const msg = DDPCommon.parseDDP(raw_msg);
		if (!msg || msg.msg !== 'changed' || !msg.collection || !msg.fields) {
			return;
		}

		const { streamName, eventName, args } = msg.fields;

		if (!streamName || !eventName || !args) {
			return;
		}

		if (connection.broadcastAuth !== true) {
			return 'not-authorized';
		}

		if (!Meteor.StreamerCentral.instances[streamName]) {
			return 'stream-not-exists';
		}

		return Meteor.StreamerCentral.instances[streamName]._emit(eventName, args);
	});

	return connection.subscribe('stream');
}

function startStreamBroadcast() {
	if (!process.env.INSTANCE_IP) {
		process.env.INSTANCE_IP = 'localhost';
	}

	logger.info('startStreamBroadcast');

	RocketChat.settings.get('Stream_Cast_Address', function(key, value) {
		// var connection, fn, instance;
		const fn = function(instance, connection) {
			connection.disconnect();
			return delete connections[instance];
		};

		for (const instance of Object.keys(connections)) {
			const connection = connections[instance];
			fn(instance, connection);
		}

		if (value && value.trim() !== '') {
			return startStreamCastBroadcast(value);
		} else {
			return startMatrixBroadcast();
		}
	});
}

Meteor.startup(function() {
	return startStreamBroadcast();
});

Meteor.methods({
	'instances/get'() {
		if (!RocketChat.authz.hasPermission(Meteor.userId(), 'view-statistics')) {
			throw new Meteor.Error('error-action-not-allowed', 'List instances is not allowed', {
				method: 'instances/get',
			});
		}

		return Object.keys(connections).map((address) => {
			const conn = connections[address];
			return Object.assign({ address, currentStatus: conn._stream.currentStatus }, _.pick(conn, 'instanceRecord', 'broadcastAuth'));
		});
	},
});
