import _ from 'lodash';
import VError from '@openagenda/verror';
import parseListArguments from '@openagenda/service-utils/parseListArguments.js';
import config from './config.js';
import validateArgs from './validators/listArguments.js';

function parse(row) {
  if (!row) return row;

  return _.mapKeys(row, (v, k) => _.camelCase(k));
}

export default async (identifiers, ...args) => {
  let { query, offset, limit, options } = parseListArguments(
    ...[{}].concat(args),
  );
  const { knex, schemas } = config;

  try {
    ({ query, offset, limit, options } = validateArgs({
      query,
      offset,
      limit,
      options,
    }));
  } catch (e) {
    throw new VError(
      {
        name: 'ValidationError',
        info: {
          errors: e,
        },
      },
      'Validation failed',
    );
  }

  const baseRequest = knex(schemas.key).where(identifiers);

  let total = null;

  if (options && options.total) {
    total = (await baseRequest.clone().count('* as total'))[0].total;
  }

  const items = (await baseRequest.limit(limit).offset(offset)).map(parse);

  return { items, total };
};
