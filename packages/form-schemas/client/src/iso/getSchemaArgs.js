const _ = require('lodash');

const schema = require('@openagenda/validators/schema');

const getValidatorFromField = require('./getValidatorFromField');
const isObject = require('./isObject');

module.exports = (fields, accessType = null, al = null, options = {}) => {
  const params = {
    includeUnspecified: true,
    custom: {},
    draft: false,
    ...options,
  };

  if (isObject(params.custom)) {
    schema.register(params.custom);
  }

  const accessLevel = al === null ? [] : [].concat(al);

  return fields.filter(f => {
    if (accessType === null) return true;

    if (f[accessType] === null && params.includeUnspecified) return true;

    return !!(_.get(f, accessType, []) || [])
      .filter(t => accessLevel.includes(t))
      .length;
  })
    .filter(f => {
      if (f.type && f.type !== 'field') {
        return false;
      }
      return f.fieldType !== 'abstract';
    })
    .map(f => {
      const validatorConfiguration = getValidatorFromField(f, params);

      return validatorConfiguration;
    }).reduce((schemaConfiguration, f) => _.set(schemaConfiguration, f.field, f), {});
};
