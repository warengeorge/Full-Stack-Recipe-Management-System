import { createClient } from 'redis';

const redisConnection = async () => {
  // Connect to your internal Redis instance using the REDIS_URL environment variable
  // The REDIS_URL is set to the internal Redis URL e.g. redis://red-343245ndffg023:6379
  const client = createClient({
      url: process.env.REDIS_URL
  });

  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();
  console.log('Connected to Redis');
  
  // Send and retrieve some values
  await client.set('key', 'node redis');
  const value = await client.get('key');

  console.log("found value: ", value)
  return client;
}

export default redisConnection;