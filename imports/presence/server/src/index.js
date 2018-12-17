import { afterAll } from './hooks';
import actions from './actions';

export default ({ UserSession, User }) => ({
	version: 1,
	settings: {
		$noVersionPrefix: true,
	},
	name: 'presence',
	mixins: [],
	hooks: {
		after: {
			setConnectionStatus: 'afterAll',
			setStatus:'afterAll',
			newConnection: 'afterAll',
			removeConnection: 'afterAll',
		},
	},
	events: {
		async '$node.disconnected'({ node }) {
			this.removeNode(node._id);
		},
	},
	actions,
	methods:{
		async removeNode(nodeID) {
			const affectedUsers = await this.broker.call('presence.removeLostConnections', { nodeID });
			return affectedUsers.forEach(({ _id: uid }) => this.broker.call('presence.updateUserPresence', { uid }));
		},
		afterAll,
		userSession() { return UserSession ; },
		user() { return User ; },
	},
	started() {
		setTimeout(async() => {
			const affectedUsers = await this.broker.call('presence.removeLostConnections');
			return affectedUsers.forEach(({ _id: uid }) => this.broker.call('presence.updateUserPresence', { uid }));
		}, 1000);
	},
});
