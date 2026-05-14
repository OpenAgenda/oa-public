import _ from 'lodash';
import parseListArguments from '@openagenda/service-utils/parseListArguments.js';
import promisePlusCb from '@openagenda/service-utils/promisePlusCb.js';
import schema from '@openagenda/validators/schema';
import validators from '@openagenda/validators';
import logger from '@openagenda/logs';
import VError from '@openagenda/verror';
import notificationStates from '../notificationStates.js';

const log = logger('activities/notifications/list');

schema.register({
  text: validators.text,
  pass: validators.pass,
  number: validators.number,
});

function list(config, identifiers, ...rest) {
  const { service, knex } = config;

  let args = parseListArguments(...rest);

  args.query = _.pick(args.query, [
    'ids',
    'actor',
    'verb',
    'object',
    'target',
    'groupBy',
    'state',
    'createdAt',
  ]);

  const validateArgs = schema({
    query: {
      type: 'pass',
    },
    offset: {
      type: 'number',
    },
    limit: {
      type: 'number',
    },
    options: {
      type: 'pass',
    },
    cb: {
      type: 'pass',
    },
  });

  try {
    args = validateArgs(args);
  } catch (errors) {
    return promisePlusCb(
      Promise.reject(
        new VError({ info: { errors } }, 'Arguments validation failed'),
      ),
      args.cb,
    );
  }

  const { offset: fromId, limit, cb } = args;
  let { query } = args;

  if (identifiers.entityType && identifiers.entityType !== 'user') {
    return promisePlusCb(
      Promise.reject(
        new VError('The notifications concern only feeds of type user'),
      ),
      cb,
    );
  }

  const validateQuery = schema({
    verb: {
      type: 'text',
      max: 255,
      optional: true,
    },
    groupBy: {
      type: 'text',
      max: 255,
      optional: true,
    },
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
    ids: {
      type: 'number',
      list: true,
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

  const { ids, stateNot } = query;
  query = _.mapKeys(_.pick(query, 'verb', 'groupBy', 'state'), (value, key) =>
    _.snakeCase(key));

  const promise = service
    .feed(identifiers)
    .get({ internal: true })
    .then((feed) => {
      if (feed === null) return Promise.reject(new VError('Feed not found'));

      if (feed.entityType && feed.entityType !== 'user') {
        return Promise.reject(
          new VError('The notifications concern only feeds of type user'),
        );
      }

      const request = knex(config.schemas.feed_notification)
        .select()
        .where(query)
        .where('feed_id', feed.id)
        .orderBy('updated_at', 'desc')
        .orderBy('id', 'desc');

      if (ids) {
        request.whereIn('id', ids);
      } else {
        request.limit(limit);
      }

      if (stateNot !== undefined) {
        request.where('state', '<>', stateNot);
      }

      if (fromId) {
        request.where('id', '<', fromId);
      }

      return request.then((rows) =>
        rows.map((row) => {
          const mappedRow = _.mapKeys(row, (value, key) => _.camelCase(key));
          mappedRow.store = JSON.parse(mappedRow.store || '{}');
          return mappedRow;
        }));
    })
    .catch((err) => {
      log.error(err);

      return Promise.reject(err);
    });

  return promisePlusCb(promise, cb);
}

export default list;
