export const redisConfig = {
	host: process.env.REDIS_HOST || 'localhost',
	port: process.env.REDIS_PORT || 6379,
	// family: 4, // 4 (IPv4) or 6 (IPv6)
	// password: 'auth',
	db: process.env.REDIS_DB || 0
};

if (process.env.REDIS_PASS) {
	redisConfig.password = process.env.REDIS_PASS;
}

export default redisConfig;
