"use strict";

var utils = require('utils');

module.exports = function (config) {

  var params = utils.extend({
    field: undefined,
    type: 'pass'
  }, config || {});

  return utils.extend(validate, {
    type: 'pass',
    field: params.field
  });

  function validate(value) {
    return value;
  }
};