import * as redis from 'redis';
import Queues from '@openagenda/queues';
import config from '../config.dev.js';
import Service from '../server/index.js';

const redisClient = redis.createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

const queue = Queues({
  redis: redisClient,
  prefix: 'agendadocxtest:',
})('docx');

const service = Service({
  s3: config.s3,
  localTmpPath: config.localTmpPath,
  queue,
});

export default (router) => {
  console.log('init server');
  router.use('/docx', service.app);
};
