import _ from 'lodash';
import VError from '@openagenda/verror';
import promisePlusCb from '@openagenda/service-utils/promisePlusCb.js';
import schema from '@openagenda/validators/schema';
import validators from '@openagenda/validators';
import notificationStates from '../notificationStates.js';

schema.register({
  choice: validators.choice,
  text: validators.text,
});

function markAll(config, identifiers, query, newState, cb) {
  const { service, knex } = config;

  if (identifiers.entityType && identifiers.entityType !== 'user') {
    return promisePlusCb(
      Promise.reject(
        new VError('The notifications concern only feeds of type user'),
      ),
      cb,
    );
  }

  const resolvedNewState = typeof newState === 'string'
    ? notificationStates.reverse[newState]
    : newState;

  const validateQuery = schema({
    state: {
      type: 'choice',
      options: notificationStates.codes,
      unique: true,
      optional: true,
    },
    stateNot: {
      type: 'choice',
      options: notificationStates.codes,
      unique: true,
      optional: true,
    },
  });

  try {
    validateQuery(query);
  } catch (errors) {
    return promisePlusCb(
      Promise.reject(
        new VError({ info: { errors } }, 'Query validation failed'),
      ),
      cb,
    );
  }

  const { stateNot } = query;
  const where = _.pickBy(
    _.mapKeys(_.pick(query, 'state'), (value, key) => _.snakeCase(key)),
    (value) => value !== undefined,
  );

  const promise = service
    .feed(identifiers)
    .get({ internal: true })
    .then((feed) => {
      if (feed === null) return Promise.reject(new VError('Feed not found'));

      if (feed.entityType !== 'user') {
        return Promise.reject(
          new VError('The notifications concern only user feeds'),
        );
      }

      const request = knex(config.schemas.feed_notification)
        .where(where)
        .where('feed_id', feed.id);

      if (stateNot !== undefined) {
        request.where('state', '<>', stateNot);
      }

      return request.update({ state: resolvedNewState });
    });

  return promisePlusCb(promise, cb);
}

export default markAll;
