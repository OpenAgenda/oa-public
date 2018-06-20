"use strict";

var _ = {
  extend: require('lodash/extend'),
  get: require('lodash/get'),
  keys: require('lodash/keys'),
  isArray: require('lodash/isArray')
};

var text = require('./text');

module.exports = function (config) {

  var params = _.extend({
    field: false,
    optional: true,
    defaultLanguage: 'en',
    languages: [] // if array is set, languages are required
  }, config || {});

  return _.extend(validate, {
    type: 'multilingual',
    field: params.field
  });

  function validate(origin) {

    var clean = {},
        tmp = {};

    var validateText = text(params);

    var errors = [];

    var value = typeof origin === 'string' ? [params.defaultLanguage].reduce(function (l) {
      return _.set({}, l, origin);
    }, {}) : origin || {};

    // if languages have been pre-specified, they should be
    // part of validation and sanitizing
    if (_.isArray(params.languages)) {

      params.languages.forEach(function (l) {

        value[l] = _.get(value, l, '');
      });
    }

    if (!params.optional && !_.keys(value).length) {

      throw [{
        field: params.field,
        code: 'required',
        message: 'at least one language entry is required',
        origin: origin
      }];
    }

    if (!_.keys(value).length && typeof params['default'] !== 'undefined') {

      return params['default'];
    }

    _.keys(value).forEach(function (l) {

      var langValue = value[l];

      if (langValue === undefined || langValue === null) {

        return;
      }

      try {

        clean[l] = validateText(langValue);
      } catch (lErrors) {

        errors = errors.concat(lErrors.map(function (e) {
          return _.extend({ lang: l }, e);
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