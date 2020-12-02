'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');

module.exports = (fields, preferredlang, obj) => ih(
  obj,
  fields.reduce(
    (update, field) => _.set(update, field, {
      $set: _.get(
        obj[field],
        preferredlang,
        _.get(obj[field], _.first(_.keys(obj[field])))
      )
    }),
    {}
  )
);
