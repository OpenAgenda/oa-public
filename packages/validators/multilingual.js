"use strict";

var utils = require('@openagenda/utils'),
    text = require('./text');

module.exports = function (config) {

  var params = utils.extend({
    field: false,
    optional: true,
    defaultLanguage: 'en'
  }, config || {});

  return utils.extend(validate, {
    type: 'multilingual',
    field: params.field
  });

  function validate(origin) {

    var clean = {},
        tmp = {},
        errors = [],
        value = void 0,
        validateText = text(params);

    if (typeof origin === 'string') {

      tmp[params.defaultLanguage] = origin;

      value = tmp;
    } else {

      value = origin || {};
    }

    if (!params.optional && !Object.keys(value).length) {

      throw [{
        field: params.field,
        code: 'required',
        message: 'at least one language entry is required',
        origin: origin
      }];
    }

    if (!Object.keys(value).length && typeof params['default'] !== 'undefined') {

      return params['default'];
    }

    Object.keys(value).forEach(function (l) {

      var langValue = value[l];

      if (langValue === undefined || langValue === null) {

        return;
      }

      try {

        clean[l] = validateText(langValue);
      } catch (lErrors) {

        errors = errors.concat(lErrors.map(function (e) {
          return utils.extend({ lang: l }, e);
        }));
      }
    });

    if (errors.length) {

      throw errors;
    }

    return clean;
  }
};
//# sourceMappingURL=multilingual.js.map