import Service from '@openagenda/events';
import onCreate from './onCreate.mjs';
import onUpdate from './onUpdate.mjs';
import beforeRemove from './beforeRemove.mjs';
import onRemove from './onRemove.mjs';
import getLocations from './getLocations.mjs';

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
