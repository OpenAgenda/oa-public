'use strict';

const _ = require('lodash');
const schema = require('@openagenda/validators/schema');
const legacy = JSON.parse(JSON.stringify(require('./fields/legacy')));

schema.register({
  text: require('@openagenda/validators/text'),
  boolean: require('@openagenda/validators/boolean'),
  link: require('@openagenda/validators/link'),
  integer: require('@openagenda/validators/integer'),
  date: require('@openagenda/validators/date'),
  slug: require('../slugs/validator'),
  choice: require('@openagenda/validators/choice'),
  ip: require('@openagenda/validators/ip')
});

module.exports = schema(legacy.all);
