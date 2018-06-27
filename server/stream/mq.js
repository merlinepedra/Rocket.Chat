import redisMq from 'mqemitter-redis';

export default process.env.REDIS &&
	redisMq({
		host: process.env.REDIS
	});
