import _ from 'lodash';
import VError from '@openagenda/verror';
import promisePlusCb from '@openagenda/service-utils/promisePlusCb.js';
import notificationStates from '../notificationStates.js';

function parseArguments(identifiers, query, newState, options, cb) {
  const result = {
    identifiers,
    query,
    newState,
    options,
    cb,
  };

  // eslint-disable-next-line prefer-rest-params
  const args = Array.isArray(arguments) ? arguments : Array.from(arguments);

  if (typeof args[args.length - 1] !== 'function') {
    args.push(null);
  }

  if (args.length === 4) {
    Object.assign(result, {
      identifiers: args[0],
      query: args[1],
      newState: args[2],
      options: {},
      cb: args[3],
    });
  }

  return result;
}

function markAs(config, ...rest) {
  const { service, knex } = config;

  const args = parseArguments(...rest);
  const { identifiers, query, options, cb } = args;
  let { newState } = args;

  if (identifiers.entityType && identifiers.entityType !== 'user') {
    return promisePlusCb(
      Promise.reject(
        new VError('The notifications concern only feeds of type user'),
      ),
      cb,
    );
  }

  const params = _.merge(
    {
      allowRegress: true,
      listArgs: [],
    },
    options,
  );

  if (typeof newState === 'string') newState = notificationStates.reverse[newState];

  const promise = service
    .feed(identifiers)
    .get({ internal: true })
    .then((feed) => {
      if (feed === null) {
        return Promise.reject(new VError('Feed not found'));
      }

      if (feed.entityType !== 'user') {
        return Promise.reject(
          new VError('The notifications concern only user feeds'),
        );
      }

      return service
        .feed(feed)
        .notifications.list.apply(null, [query].concat(params.listArgs))
        .then((notifs) => {
          const request = knex(config.schemas.feed_notification)
            .where('feed_id', feed.id)
            .whereIn(
              'id',
              notifs.map((v) => v.id),
            );

          if (!params.allowRegress) {
            request.where('state', '<', newState);
          }

          return request
            .update({
              state: newState,
            })
            .then(() =>
              service
                .feed(feed)
                .notifications.list.apply(
                  null,
                  [query].concat(params.listArgs),
                ));
        });
    });

  return promisePlusCb(promise, cb);
}

export default markAs;
