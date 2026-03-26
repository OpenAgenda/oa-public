import Agendas from '@openagenda/agendas';
import middleware from './middleware.js';
import resetCache from './lib/resetCache.js';
import onCreate from './onCreate.js';
import onUpdate from './onUpdate.js';
import onRemove from './onRemove.js';
import plugApp from './plugApp.js';

export function init(config, services) {
  const agendasSvc = Agendas({
    knex: config.knex,
    redis: services.redis,
    schemas: config.schemas,
    Files: services.files,
    imagePath: config.s3.mainBucketPath,
    defaultImagePath: config.s3.defaultImagePath,
    logger: config.getLogConfig('svc', 'agendas'),
    interfaces: {
      onCreate: onCreate.bind(null, services),
      onRemove: onRemove.bind(null, services),
      onUpdate: onUpdate.bind(null, services),
    },
  });

  return {
    ...agendasSvc,
    mw: middleware(agendasSvc),
    resetCache: resetCache.bind(null, services),
    plugApp,
  };
}
