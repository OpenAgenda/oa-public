'use strict';

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const integer = require('@openagenda/validators/integer');

schema.register({
  boolean,
  integer
});

module.exports = schema({
  eventCounts: {
    type: 'boolean',
    default: false
  },
  includeImagePath: {
    type: 'boolean',
    default: false
  },
  context: {
    agendaUid: {
      type: 'integer',
      default: null
    },
    setUid: {
      type: 'integer',
      default: null
    }
  }
});
