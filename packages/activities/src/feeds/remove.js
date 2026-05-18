import promisePlusCb from '@openagenda/service-utils/promisePlusCb.js';
import logger from '@openagenda/logs';

const log = logger('activities/feeds/remove');

export default function remove(config, identifiers, cb) {
  const { service, knex } = config;

  const promise = service
    .feed(identifiers)
    .get({ internal: true })
    .then((feed) => {
      if (!feed) {
        return 0;
      }

      return knex(config.schemas.feed)
        .delete()
        .where({ id: feed.id })
        .then((result) => {
          log(
            'Feed removed (type %s, uid: %s)',
            feed.entityType,
            feed.entityUid,
          );

          return result;
        });
    });

  return promisePlusCb(promise, cb);
}
