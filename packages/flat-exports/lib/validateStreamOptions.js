'use strict';

const schema = require('@openagenda/validators/schema');
const pass = require('@openagenda/validators/pass');
const text = require('@openagenda/validators/text');
const integer = require('@openagenda/validators/integer');

schema.register({
  pass,
  text,
  integer,
});

module.exports = schema({
  genUrl: {
    type: 'pass',
    default: null,
  },
  lang: {
    type: 'text',
    default: 'fr',
  },
  slug: {
    type: 'text',
    optional: false,
  },
  identifier: {
    type: 'integer',
    optional: false,
  },
  type: {
    type: 'text',
    default: 'agenda',
  },
  title: {
    type: 'text',
    optional: false,
  },
  description: {
    type: 'text',
  },
  section: {
    type: 'text',
  },
});
