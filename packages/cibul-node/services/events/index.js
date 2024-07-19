import Service from '@openagenda/events';
import onCreate from './onCreate.js';
import onUpdate from './onUpdate.js';
import beforeRemove from './beforeRemove.js';
import onRemove from './onRemove.js';
import getLocations from './getLocations.js';

export function init(config, services) {
  return Service({
    knex: services.knex,
    imagePath: config.aws.imageBucketPath,
    defaultImage: config.aws.defaultImagePath,
    Files: services.files,
    logger: config.getLogConfig('svc', 'events'),
    interfaces: {
      onCreate: onCreate.bind(null, services),
      onUpdate: onUpdate.bind(null, services),
      beforeRemove: beforeRemove.bind(null, services),
      onRemove: onRemove.bind(null, services),
      getOriginAgendas: (uids, options) => services.agendas.list({
        uid: uids,
      }, options).then(({ agendas }) => agendas),
      getLocations: getLocations.promise.bind(null, services),
    },
  });
}
