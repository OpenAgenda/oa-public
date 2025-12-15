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

function getCPUUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  for (const cpu of cpus) {
    for (const type of ['user', 'nice', 'sys', 'idle', 'irq']) {
      if (cpu.times[type] === undefined) continue;
      totalTick += cpu.times[type];
      if (type === 'idle') totalIdle += cpu.times[type];
    }
  }

  return {
    idle: totalIdle / cpus.length,
    total: totalTick / cpus.length,
  };
}

export async function init() {
  const log = logs('monitor');
  const processInfo = getProcessInfo();

  let lastMeasure = getCPUUsage();

  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const nextMeasure = getCPUUsage();

    const totalDiff = nextMeasure.total - lastMeasure.total;
    const idleDiff = nextMeasure.idle - lastMeasure.idle;

    log.info({
      ...processInfo,
      rss: Math.ceil(memoryUsage.rss / divideBy),
      heapTotal: Math.ceil(memoryUsage.heapTotal / divideBy),
      heapUsed: Math.ceil(memoryUsage.heapUsed / divideBy),
      external: Math.ceil(memoryUsage.external / divideBy),
      CPUPercentage:
        totalDiff > 0 ? 100 - Math.floor(100 * (idleDiff / totalDiff)) : 0,
    });

    lastMeasure = nextMeasure;
  }, period);

  return {
    processInfo,
  };
}
