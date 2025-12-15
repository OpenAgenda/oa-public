import os from 'node:os';
import logs from '@openagenda/logs';

const divideBy = 1024 * 1024;
const period = 60 * 1000;

function getProcessInfo() {
  const { name: pm2ProcessName, pm_id: processID } = process.env;

  const [_nodePath, _processContainer, ...argv] = process.argv;

  const hostname = os.hostname();
  return {
    hostname,
    processName: `${hostname}_${pm2ProcessName}_${processID}`.replace(
      /\s/g,
      '_',
    ),
    argv,
  };
}

export async function init() {
  const log = logs('monitor');
  const processInfo = getProcessInfo();

  setInterval(() => {
    const memoryUsage = process.memoryUsage();

    log.info({
      ...processInfo,
      rss: Math.ceil(memoryUsage.rss / divideBy),
      heapTotal: Math.ceil(memoryUsage.heapTotal / divideBy),
      heapUsed: Math.ceil(memoryUsage.heapUsed / divideBy),
      external: Math.ceil(memoryUsage.external / divideBy),
    });
  }, period);

  return {
    processInfo,
  };
}
