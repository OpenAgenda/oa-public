import os from 'node:os';
import { monitorEventLoopDelay } from 'node:perf_hooks';
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
    CPUCount: cpus.length,
    idle: totalIdle / cpus.length,
    total: totalTick / cpus.length,
  };
}

const log = logs('monitor');

export async function init() {
  const processInfo = getProcessInfo();

  let lastMeasure = getCPUUsage();

  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const nextMeasure = getCPUUsage();

    const totalDiff = nextMeasure.total - lastMeasure.total;
    const idleDiff = nextMeasure.idle - lastMeasure.idle;

    log.info('resources', {
      ...processInfo,
      rss: Math.ceil(memoryUsage.rss / divideBy),
      heapTotal: Math.ceil(memoryUsage.heapTotal / divideBy),
      heapUsed: Math.ceil(memoryUsage.heapUsed / divideBy),
      external: Math.ceil(memoryUsage.external / divideBy),
      CPUCount: nextMeasure.CPUCount,
      CPUPercentage:
        totalDiff > 0 ? 100 - Math.floor(100 * (idleDiff / totalDiff)) : 0,
    });

    lastMeasure = nextMeasure;
  }, period);

  const lagPeriod = 1000;
  const histogram = monitorEventLoopDelay({
    resolution: 20,
  });
  histogram.enable();

  setInterval(() => {
    const p99 = histogram.percentile(99) / 1e6;
    log.info('event loop', {
      ...processInfo,
      p99,
      p50: histogram.percentile(50) / 1e6,
      max: histogram.max / 1e6,
    });
    histogram.reset();
  }, lagPeriod);

  return {
    processInfo,
  };
}
