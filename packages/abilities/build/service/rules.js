import _wrap from "lodash/wrap.js";
import _last from "lodash/last.js";
import _camelCase from "lodash/camelCase.js";
import _mapKeys from "lodash/mapKeys.js";
import _map from "lodash/map.js";
import _every from "lodash/every.js";
import _isNumber from "lodash/isNumber.js";
import _isString from "lodash/isString.js";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/es.promise.js";
import "core-js/modules/es.regexp.exec.js";
import "core-js/modules/web.dom-collections.iterator.js";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import abilityPkg from '@casl/ability';
import config from './config.js';
const {
  AbilityBuilder
} = abilityPkg;
const joinIfArray = function (value) {
  let delimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '|';
  return Array.isArray(value) ? value.join(delimiter) : value;
};
const splitIfNeeded = function (value) {
  let delimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '|';
  if (typeof value === 'string' && _includesInstanceProperty(value).call(value, delimiter)) {
    return value.split(delimiter);
  }
  if (Array.isArray(value) && value.length === 1) {
    return value[0];
  }
  return value;
};
export function format(r) {
  return Array.isArray(r) ? r.map(format) : {
    id: r.id || null,
    entity_name: r.entityName || null,
    identifier: r.identifier || null,
    actions: joinIfArray(r.actions || r.action),
    subject: joinIfArray(r.subject),
    inverted: r.inverted || false,
    conditions: r.conditions ? JSON.stringify(r.conditions) : null,
    fields: joinIfArray(r.fields) || null,
    reason: r.reason || null
  };
}
export function parse(r) {
  return Array.isArray(r) ? r.map(parse) : {
    id: r.id || null,
    entityName: r.entityName || null,
    identifier: r.identifier || null,
    actions: splitIfNeeded(r.actions || r.action),
    subject: splitIfNeeded(r.subject),
    inverted: !!r.inverted,
    conditions: typeof r.conditions === 'string' ? JSON.parse(r.conditions) : r.conditions || null,
    fields: splitIfNeeded(r.fields) || null,
    reason: r.reason || null
  };
}
export async function list(entityName, identifier) {
  if (!_isString(entityName)) {
    throw new TypeError('`entityName` should be a string');
  }
  if (!(_isNumber(identifier) || Array.isArray(identifier) && _every(identifier, _isNumber))) {
    throw new TypeError('`identifier` should be a number or an array of numbers');
  }
  const request = config.knex(config.schemas.rule).select().where('entity_name', entityName);
  if (Array.isArray(identifier)) {
    request.whereIn('identifier', identifier);
  } else {
    request.where('identifier', identifier);
  }
  const rules = _map(await request, row => _mapKeys(row, (v, k) => _camelCase(k)));
  return parse(rules);
}
export function getDefaultFor(entityName) {
  const defaultForFn = config.interfaces && config.interfaces.defaultFor && config.interfaces.defaultFor[entityName];
  const builder = AbilityBuilder.extract();
  function wrapper(func) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    const result = func(...args);
    Object.assign(_last(this.rules), {
      entityName,
      identifier: null
    });
    return result;
  }
  builder.can = _wrap(builder.can, wrapper).bind(builder);
  builder.cannot = _wrap(builder.cannot, wrapper).bind(builder);
  return defaultForFn ? parse(defaultForFn(builder)) : [];
}
//# sourceMappingURL=rules.js.map