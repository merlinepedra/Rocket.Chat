const PromService = require('moleculer-prometheus');
export default {
	name:'metrics',
	mixins: [PromService],
	settings: {
		port: 9100,
		collectDefaultMetrics: true,
		timeout: 5 * 1000,
	},
};
