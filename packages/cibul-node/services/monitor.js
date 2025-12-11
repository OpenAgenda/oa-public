import logs from '@openagenda/logs';

const divideBy = 1024 * 1024;
const period = 60 * 1000;

export async function init() {
  const log = logs('monitor');
  const { MASTER_HOST: host, MASTER_ID: ID, MASTER_IP: IP } = process.env;
  setInterval(() => {
    const memoryUsage = process.memoryUsage();

    log.info({
      host,
      ID,
      IP,
      argv: process.argv,
      rss: Math.ceil(memoryUsage.rss / divideBy),
      heapTotal: Math.ceil(memoryUsage.heapTotal / divideBy),
      heapUsed: Math.ceil(memoryUsage.heapUsed / divideBy),
      external: Math.ceil(memoryUsage.external / divideBy),
    });
  }, period);
}
