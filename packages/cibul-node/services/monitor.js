import os from 'node:os';
import logs from '@openagenda/logs';

const divideBy = 1024 * 1024;
const period = 60 * 1000;

export async function init() {
  const log = logs('monitor');
  const { NODE_APP_INSTANCE: appInstance } = process.env;

  const hostname = os.hostname();

  setInterval(() => {
    const memoryUsage = process.memoryUsage();

    const [_nodePath, _processContainer, ...argv] = process.argv;

    log.info({
      hostname,
      appInstance,
      argv,
      rss: Math.ceil(memoryUsage.rss / divideBy),
      heapTotal: Math.ceil(memoryUsage.heapTotal / divideBy),
      heapUsed: Math.ceil(memoryUsage.heapUsed / divideBy),
      external: Math.ceil(memoryUsage.external / divideBy),
    });
  }, period);
}
