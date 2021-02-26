'use strict';

const debug = require('debug');

const getValidatorFromField = require('./getValidatorFromField');

const schema = require('@openagenda/validators/schema');

const _ = {
  keyBy: require('lodash/keyBy'),
  omit: require('lodash/omit'),
  set: require('lodash/set'),
  get: require('lodash/get')
};

const log = debug('getSchema');

schema.register({
  text: require('@openagenda/validators/text'),
  boolean: require('@openagenda/validators/boolean'),
  link: require('@openagenda/validators/link'),
  number: require('@openagenda/validators/number'),
  date: require('@openagenda/validators/date'),
  multilingual: require('@openagenda/validators/multilingual'),
  integer: require('@openagenda/validators/integer'),
  choice: require('@openagenda/validators/choice'),
  pass: require('@openagenda/validators/pass'),
  file: require('./fileValidator')
});

module.exports = (fields, accessType = null, accessLevel = null, options = {}) => {
  const params = {
    includeUnspecified: true,
    custom: {},
    draft: false,
    ...options
  };

  log('options', options);

  if (params.custom instanceof Object) {
    schema.register(params.custom);
  }

  accessLevel = accessLevel === null ? [] : [].concat(accessLevel);

  const schemaConfiguration = fields.filter(f => {
    if (accessType === null) return true;

    if (f[accessType] === null && params.includeUnspecified) return true;

    return !!(_.get(f, accessType, []) || [])
      .filter(t => accessLevel.includes(t))
      .length;
  })
  .filter(f => f.fieldType !== 'abstract')
  .map(f => {
    const validatorConfiguration = getValidatorFromField(f, params);

    return validatorConfiguration;
  }).reduce((schemaConfiguration, f) => _.set(schemaConfiguration, f.field, f), {});

  return schema(schemaConfiguration);
}
