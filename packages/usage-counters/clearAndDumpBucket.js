import logs from '@openagenda/logs';

const log = logs('usageCounters/clearAndDumpBucket');

const splitKey = (key) => {
  const split = key.split(':');

  if (split.length === 3) {
    return {
      prefix: split[0],
      actorNamespace: split[1],
      actorIdentifier: split[2],
      targetNamespace: null,
    };
  }
  return {
    prefix: split[0],
    targetNamespace: split[1],
    actorNamespace: split[2],
    actorIdentifier: split[3],
  };
};

export default async function clearAndDumpBucket(internals, key, value) {
  const { knex, redisClient, setKey, schema } = internals;

  const { actorNamespace, actorIdentifier, targetNamespace } = splitKey(key);
  log.info('clearAndDumpBucket', {
    key,
    actorNamespace,
    actorIdentifier,
    targetNamespace,
    value,
  });

  redisClient.srem(setKey, key);
  redisClient.del(key);

  await knex(schema).insert({
    store: value.store,
    begin: new Date(value.begin),
    end: new Date(value.end),
    actor_identifier: actorIdentifier,
    actor_namespace: actorNamespace,
    target_namespace: targetNamespace,
  });
  log('dumped successfully');
}
