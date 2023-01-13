'use strict';

const _ = require('lodash');

const fields = require('./fields');

module.exports = function getFields(options = {}) {
  const {
    access = 'public',
  } = options;

  return {
    fields: fields.filter(f => f.read.includes(access)).map(f => _.omit(f, ['db'])),
    schemaId: 'location',
  };
};
