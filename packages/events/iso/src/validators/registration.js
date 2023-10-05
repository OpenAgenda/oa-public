'use strict';

const linkValidator = require('@openagenda/validators/link');
const phoneValidator = require('@openagenda/validators/phone');
const emailValidator = require('@openagenda/validators/email');

const validates = {
  link: linkValidator(),
  phone: phoneValidator(),
  email: emailValidator(),
};

const extractType = value => {
  for (const type of ['phone', 'email', 'link']) {
    try {
      validates[type](value);
      return type;
    } catch (e) { /* not of type */ }
  }
  throw new Error('unknown registration type');
};

function toListOfObjects(v) {
  return [].concat(v)
    .filter(item => ![null, undefined].includes(item))
    .map(item => (
      typeof item === 'string' ? {
        value: item,
        type: extractType(item),
      } : item
    ));
}

const knownServices = ['passCulture'];

module.exports = function validateRegistration({ field }) {
  return v => {
    const result = toListOfObjects(v).reduce(({ clean, errors }, item, index) => {
      const {
        type,
        value,
      } = item;

      const cleanItem = { type };

      try {
        cleanItem.value = validates[type](value);
      } catch (valueErrors) {
        errors.concat(valueErrors.map(ve => ({ ...ve, origin: value, index, field })));
      }

      if (item.service) {
        if (!knownServices.includes(item.service)) {
          errors.push({
            index,
            origin: item.service,
            code: 'service.invalid',
            field,
          });
        }
        Object.assign(cleanItem, {
          service: item.service,
          data: item.data,
        });
      }

      return {
        errors,
        clean: clean.concat(cleanItem),
      };
    }, { clean: [], errors: [] });

    if (result.errors.length) {
      throw result.errors;
    }

    return result.clean;
  };
};

module.exports.toListOfObjects = toListOfObjects;
