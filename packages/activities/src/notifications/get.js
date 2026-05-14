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

function parseArguments(identifiers, query, options, cb) {
  const result = {
    identifiers,
    query,
    options,
    cb,
  };

  // eslint-disable-next-line prefer-rest-params
  const args = Array.isArray(arguments) ? arguments : Array.from(arguments);

  if (typeof args[args.length - 1] !== 'function') {
    args.push(null);
  }

  if (args.length === 3) {
    Object.assign(result, {
      identifiers: args[0],
      query: args[1],
      options: {},
      cb: args[2],
    });
  }

  return result;
}

function get(config, ...rest) {
  const { service, knex } = config;

  const args = parseArguments(...rest);

  const { identifiers, options, cb } = args;
  let { query } = args;

  const params = _.merge(
    {
      excludeIds: [],
    },
    options,
  );

  if (identifiers.entityType && identifiers.entityType !== 'user') {
    return promisePlusCb(
      Promise.reject(
        new VError('The notifications concern only feeds of type user'),
      ),
      cb,
    );
  }

  const validateQuery = schema({
    feedId: {
      type: 'number',
      optional: true,
    },
    verb: {
      type: 'text',
      max: 255,
      optional: false,
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
  });

  if (typeof query !== 'number') {
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
  } else {
    query = { id: query };
  }

  const where = _.pickBy(
    _.mapKeys(query, (value, key) => _.snakeCase(key)),
    (value) => value !== undefined,
  );

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
        .first()
        .where(where)
        .where('feed_id', feed.id);

      if (params.excludeIds) {
        request.whereNotIn('id', params.excludeIds);
      }

      return request.then((result) => {
        if (result) {
          const mappedResult = _.mapKeys(result, (value, key) =>
            _.camelCase(key));
          mappedResult.store = JSON.parse(mappedResult.store || '{}');
          return mappedResult;
        }

        return result;
      });
    });

  return promisePlusCb(promise, cb);
}

export default get;
