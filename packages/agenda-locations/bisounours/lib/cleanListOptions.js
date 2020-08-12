'use strict';

const fields = require('./fields.json');

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const integer = require('@openagenda/validators/integer');
const choice = require('@openagenda/validators/choice');

schema.register({
  boolean,
  integer,
  choice
});

module.exports = schema({
  total: {
    type: 'boolean',
    default: false
  },
  eventCounts: {
    type: 'boolean',
    default: false
  },
  detailed: {
    type: 'boolean',
    default: false
  },
  includeFields: {
    type: 'choice',
    options: fields.map(f => f.field)
  },
  context: {
    agendaUid: {
      type: 'integer',
      default: null
    }
  }
});
