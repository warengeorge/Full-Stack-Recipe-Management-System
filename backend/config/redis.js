import redis from 'redis';

export const connectRedis = async () => {
  try {
    const redisClient = redis.createClient();
    const redisConnected = await redisClient.connect();
    if (redisConnected) {
      console.log('Connected to Redis');
    } else {
      console.error('Error connecting to Redis');
    }
    return redisClient;
  } catch (error) {
    console.error('Error connecting to Redis:', error.message);
    process.exit(1);
  }
}
