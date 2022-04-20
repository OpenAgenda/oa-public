'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');
const boolean = require('@openagenda/validators/boolean');

schema.register({
  integer,
  boolean,
});

module.exports = schema({
  endpointId: {
    agendaUid: {
      type: 'integer',
      default: null,
    },
    setUid: {
      type: 'integer',
      default: null,
    },
  },
  includeImagePath: {
    type: 'boolean',
    default: false,
  },
  geocodeIfUndefined: {
    type: 'boolean',
    default: false,
  },
});
