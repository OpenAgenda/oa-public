'use strict';

const _ = require('lodash');
const debug = require('debug');
const log = debug('getSchema');

const schema = require('@openagenda/validators/schema');

const getValidatorFromField = require('./getValidatorFromField');
const isObject = require('./isObject');

module.exports = (fields, accessType = null, accessLevel = null, options = {}) => {
  const params = {
    includeUnspecified: true,
    custom: {},
    draft: false,
    ...options
  };

  if (isObject(params.custom)) {
    schema.register(params.custom);
  }

  accessLevel = accessLevel === null ? [] : [].concat(accessLevel);

  return fields.filter(f => {
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
};