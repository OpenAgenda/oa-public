'use strict';

var _includesInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/includes");
var _reduceInstanceProperty = require("@babel/runtime-corejs3/core-js/instance/reduce");
require("core-js/modules/es.array.iterator.js");
require("core-js/modules/web.dom-collections.iterator.js");
const linkValidator = require('@openagenda/validators/link');
const phoneValidator = require('@openagenda/validators/phone');
const emailValidator = require('@openagenda/validators/email');
const validates = {
  link: linkValidator(),
  phone: phoneValidator(),
  email: emailValidator()
};
const extractType = function (value) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const {
    throwOnError = true
  } = options;
  for (const type of ['phone', 'email', 'link']) {
    try {
      validates[type](value);
      return type;
    } catch (e) {
      /* not of type */
    }
  }
  if (!throwOnError) {
    return null;
  }
  throw new Error('unknown registration type');
};
function toListOfObjects(v) {
  return [].concat(v).filter(item => {
    var _context;
    return !_includesInstanceProperty(_context = [null, undefined]).call(_context, item);
  }).map(item => typeof item === 'string' ? {
    value: item,
    type: extractType(item, {
      throwOnError: false
    })
  } : item);
}
const knownServices = ['passCulture'];
module.exports = function validateRegistration(_ref) {
  let {
    field
  } = _ref;
  return v => {
    var _context2;
    const result = _reduceInstanceProperty(_context2 = toListOfObjects(v)).call(_context2, (_ref2, item, index) => {
      let {
        clean,
        errors
      } = _ref2;
      const {
        type,
        value
      } = item;
      const cleanItem = {
        type
      };
      if (!type) {
        errors.push({
          field,
          code: 'registration.invalid',
          message: 'registration value must be a phone, an email or a link',
          origin: value,
          index
        });
      } else {
        cleanItem.value = validates[type](value);
      }
      if (item.service) {
        if (!_includesInstanceProperty(knownServices).call(knownServices, item.service)) {
          errors.push({
            index,
            origin: item.service,
            code: 'service.invalid',
            field
          });
        }
        Object.assign(cleanItem, {
          service: item.service,
          data: item.data
        });
      }
      if (item.lastProcessedAt) cleanItem.lastProcessedAt = item.lastProcessedAt;
      return {
        errors,
        clean: clean.concat(cleanItem)
      };
    }, {
      clean: [],
      errors: []
    });
    if (result.errors.length) {
      throw result.errors;
    }
    return result.clean;
  };
};
module.exports.toListOfObjects = toListOfObjects;
//# sourceMappingURL=registration.js.map