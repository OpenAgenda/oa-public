'use strict';

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const integer = require('@openagenda/validators/integer');
const choice = require('@openagenda/validators/choice');

const fields = require('./fields');

schema.register({
  boolean,
  integer,
  choice,
});

module.exports = schema({
  eventCounts: {
    type: 'boolean',
    default: false,
  },
  includeImagePath: {
    type: 'boolean',
    default: false,
  },
  includeFields: {
    type: 'choice',
    options: fields.map(f => f.field),
  },
  throwOnNotFound: {
    type: 'boolean',
    default: false,
  },
  includeLinkedAgendas: {
    type: 'boolean',
    default: false
  },
  includeOriginAgendaUid: {
    type: 'boolean',
    default: false,
  },
  deleted: {
    type: 'boolean',
    default: false,
    allowNull: true
  },
  context: {
    agendaUid: {
      type: 'integer',
      default: null,
    },
    setUid: {
      type: 'integer',
      default: null,
    },
  },
  returnMergeTarget: {
    type: 'boolean',
    default: false,
  }
});
