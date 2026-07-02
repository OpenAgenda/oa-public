import _ from 'lodash';
import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import config from './config.js';

const joinIfArray = (value, delimiter = '|') =>
  (Array.isArray(value) ? value.join(delimiter) : value);
const splitIfNeeded = (value, delimiter = '|') => {
  if (typeof value === 'string' && value.includes(delimiter)) {
    return value.split(delimiter);
  }

  if (Array.isArray(value) && value.length === 1) {
    return value[0];
  }

  return value;
};

export function format(r) {
  return Array.isArray(r)
    ? r.map(format)
    : {
      id: r.id || null,
      entity_name: r.entityName || null,
      identifier: r.identifier || null,
      actions: joinIfArray(r.actions || r.action),
      subject: joinIfArray(r.subject),
      inverted: r.inverted || false,
      conditions: r.conditions ? JSON.stringify(r.conditions) : null,
      fields: joinIfArray(r.fields) || null,
      reason: r.reason || null,
    };
}

export function parse(r) {
  return Array.isArray(r)
    ? r.map(parse)
    : {
      id: r.id || null,
      entityName: r.entityName || null,
      identifier: r.identifier || null,
      actions: splitIfNeeded(r.actions || r.action),
      subject: splitIfNeeded(r.subject),
      inverted: !!r.inverted,
      conditions:
          typeof r.conditions === 'string'
            ? JSON.parse(r.conditions)
            : r.conditions || null,
      fields: splitIfNeeded(r.fields) || null,
      reason: r.reason || null,
    };
}

export async function list(entityName, identifier) {
  if (!_.isString(entityName)) {
    throw new TypeError('`entityName` should be a string');
  }

  if (
    !(
      _.isNumber(identifier)
      || (Array.isArray(identifier) && _.every(identifier, _.isNumber))
    )
  ) {
    throw new TypeError(
      '`identifier` should be a number or an array of numbers',
    );
  }

  const request = config
    .knex(config.schemas.rule)
    .select()
    .where('entity_name', entityName);

  if (Array.isArray(identifier)) {
    request.whereIn('identifier', identifier);
  } else {
    request.where('identifier', identifier);
  }

  const rules = _.map(await request, (row) =>
    _.mapKeys(row, (v, k) => _.camelCase(k)));

  return parse(rules);
}

export function getDefaultFor(entityName) {
  const defaultForFn = config.interfaces
    && config.interfaces.defaultFor
    && config.interfaces.defaultFor[entityName];
  const builder = new AbilityBuilder(createMongoAbility);

  function wrapper(func, ...args) {
    const result = func(...args);

    Object.assign(_.last(this.rules), { entityName, identifier: null });

    return result;
  }

  builder.can = _.wrap(builder.can, wrapper).bind(builder);
  builder.cannot = _.wrap(builder.cannot, wrapper).bind(builder);

  return defaultForFn ? parse(defaultForFn(builder)) : [];
}
