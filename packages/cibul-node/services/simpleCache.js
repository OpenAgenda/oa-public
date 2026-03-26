import simpleCache from '@openagenda/simple-cache';

export function init(config, services) {
  return simpleCache({
    client: services.redis,
    prefix: config?.cachePrefix ?? 'simplecache',
    logger: config.getLogConfig('svc', 'simpleCache'),
  });
}
