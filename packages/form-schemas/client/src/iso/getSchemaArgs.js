import _ from 'lodash';
import schema from '@openagenda/validators/schema/index';
import getValidatorFromField from './getValidatorFromField.js';
import isObject from './isObject.js';

export default (fields, accessType = null, al = null, options = {}) => {
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

  return fields
    .filter((f) => {
      if (accessType === null) return true;

      if (f[accessType] === null && params.includeUnspecified) return true;

      return !!(_.get(f, accessType, []) || []).filter((t) =>
        accessLevel.includes(t)).length;
    })
    .filter((f) => {
      if (f.type && f.type !== 'field') {
        return false;
      }
      return f.fieldType !== 'abstract';
    })
    .map((f) => {
      const validatorConfiguration = getValidatorFromField(f, params);
      return validatorConfiguration;
    })
    .reduce(
      (schemaConfiguration, f) => _.set(schemaConfiguration, f.field, f),
      {},
    );
};
