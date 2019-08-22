import _ from 'lodash';
import { AbilityBuilder } from '@casl/ability';
import config from './config';

const joinIfArray = (value, delimiter = '|') => (Array.isArray(value) ? value.join(delimiter) : value);
const splitIfNeeded = (value, delimiter = '|') => {
  if (typeof value === 'string' && value.includes(delimiter)) {
    return value.split(delimiter);
  }

  if (Array.isArray(value) && value.length === 1) {
    return value[0];
  }

  return value;
};

export function format(rules) {
  const _format = rule => ({
    id: rule.id || null,
    entity_name: rule.entityName || null,
    identifier: rule.identifier || null,
    actions: joinIfArray(rule.actions || rule.action),
    subject: joinIfArray(rule.subject),
    inverted: rule.inverted || false,
    conditions: rule.conditions ? JSON.stringify(rule.conditions) : null,
    fields: joinIfArray(rule.fields) || null,
    reason: rule.reason || null
  });

  return Array.isArray(rules) ? rules.map(_format) : _format(rules);
}

export function parse(rules) {
  const _parse = rule => ({
    id: rule.id || null,
    entityName: rule.entityName || null,
    identifier: rule.identifier || null,
    actions: splitIfNeeded(rule.actions || rule.action),
    subject: splitIfNeeded(rule.subject),
    inverted: !!rule.inverted,
    conditions:
      typeof rule.conditions === 'string'
        ? JSON.parse(rule.conditions)
        : rule.conditions || null,
    fields: splitIfNeeded(rule.fields) || null,
    reason: rule.reason || null
  });

  return Array.isArray(rules) ? rules.map(_parse) : _parse(rules);
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
      '`identifier` should be a number or an array of numbers'
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

  const rules = _.map(await request, row => _.mapKeys(row, (v, k) => _.camelCase(k)));

  return parse(rules);
}

export function getDefaultFor(entityName) {
  const defaultForFn = config.interfaces
    && config.interfaces.defaultFor
    && config.interfaces.defaultFor[entityName];
  const builder = AbilityBuilder.extract();

  function wrapper(func, ...args) {
    const result = func(...args);

    Object.assign(_.last(this.rules), { entityName, identifier: null });

    return result;
  }

  builder.can = _.wrap(builder.can, wrapper).bind(builder);
  builder.cannot = _.wrap(builder.cannot, wrapper).bind(builder);

  return defaultForFn ? parse(defaultForFn(builder)) : [];
}
