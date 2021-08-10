import utils from '@openagenda/utils';
import listify from './listify';

module.exports = (...args) => {
  const options = args.length === 1 ? {} : args[0];
  const validators = args.length === 1 ? args[0] : args[1];

  const params = {
    field: null,
    list: false,
    ...options
  };

  const validate = values => {
    const errors = [];
    const clean = [];

    validators.forEach(validator => {
      let matchingValue = (values || []).filter(v => v.field === validator.field);

      matchingValue = matchingValue.length ? matchingValue[0] : {
        field: validator.field,
        value: validator.type === 'object' ? [] : undefined
      };

      if (validator.type !== 'object') {
        try {
          clean.push({
            field: matchingValue.field,
            value: validator(matchingValue.value)
          });
        } catch (caughtErrors) {
          [].concat(caughtErrors).forEach(error => errors.push(error));
        }
      } else if (typeof matchingValue.value !== 'object') {
        errors.push([{
          field: matchingValue.field,
          origin: matchingValue.value,
          code: 'object.invalidtype',
          message: 'not an object'
        }]);
      } else {
        try {
          validator(matchingValue.value).map(c => utils.extend(c, {
            field: `${matchingValue.field}.${c.field}`
          })).forEach(cleanItem => {
            clean.push(cleanItem);
          });
        } catch (caughtErrors) {
          caughtErrors.forEach(error => {
            errors.push({
              ...error,
              field: `${matchingValue.field}.${error.field}`
            });
          });
        }
      }
    });

    if (errors.length) {
      throw errors;
    }

    return clean;
  };

  const validator = Object.assign(validate, {
    type: 'object',
    field: params.field,
  });

  return params.list ? listify(validator) : validator;
};
