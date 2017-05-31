"use strict";

var rgx = require('./regex'),
    emailValidator = require('./email')(),
    isURL = require('validator/lib/isURL'),
    _ = {
  extend: require('lodash/extend')
};

module.exports = function (config) {

  var params = _.extend({
    field: undefined,
    error: {
      code: 'link.invalid',
      message: 'value is not a link'
    },
    type: 'link',
    optional: true
  }, config || {}),
      shouldntMatch = [/\s/, /\/:/, /;/],
      validator = function validator(value) {

    var templateError = {
      field: validator.field,
      code: 'link.invalid',
      message: 'value is not a link'
    },
        clean = value,
        isEmail = true,
        error = [_.extend({
      origin: value
    }, templateError)];

    if (value) {

      clean = value.trim();
    }

    if ((!value || !value.length) && params.optional) {

      return value;
    }

    try {

      emailValidator(value);
    } catch (e) {

      isEmail = false;
    }

    if (isEmail) throw error;

    // add http:// if link is like www.google.com ( protocol missing )
    if (!/^(http(s|):|)\/\//.test(clean)) {

      clean = 'http://' + clean;
    }

    if (clean.indexOf('.') == -1) {

      throw error;
    }

    if (clean.substr(clean.length - 1, 1) === '.') {

      throw error;
    }

    shouldntMatch.forEach(function (rgx) {

      if (rgx.test(clean)) {

        throw error;
      }
    });

    try {

      // first check before regex
      decodeURI(clean);
    } catch (e) {

      throw [_.extend({}, error[0], {
        message: 'URI malformed'
      })];
    }

    if (!isURL(clean, {
      allow_protocol_relative_urls: true
    })) {

      throw error;
    }

    return clean;
  };

  validator.type = 'link';

  validator.field = params.field;

  return validator;
};