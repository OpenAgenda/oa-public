'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');
const text = require('@openagenda/validators/text');
const date = require('@openagenda/validators/date');

schema.register({
  integer,
  text,
  date,
});

module.exports = schema({
  id: {
    type: 'integer',
    optional: false,
    max: 99999999,
  },
  uid: {
    type: 'integer',
    optional: false,
    max: 99999999,
  },
  title: {
    type: 'text',
    optional: false,
    min: 2,
    max: 255,
  },
  formSchemaId: {
    type: 'integer',
    optional: true,
    max: 99999999,
  },
  createdAt: {
    type: 'date',
    optional: false,
  },
  updatedAt: {
    type: 'date',
    optional: false,
  },
});
