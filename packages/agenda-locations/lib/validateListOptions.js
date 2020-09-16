'use strict';

const fields = require('./fields.json');

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const integer = require('@openagenda/validators/integer');
const choice = require('@openagenda/validators/choice');
const pass = require('@openagenda/validators/pass');

schema.register({
  boolean,
  integer,
  choice,
  pass
});

const validate = schema({
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
  includeImagePath: {
    type: 'boolean',
    default: false
  },
  context: {
    agendaUid: {
      type: 'integer',
      default: null
    }
  },
  stream: {
    default: false,
    type: 'pass'
  }
});

const validateStreamOptions = schema({
  highWaterMark: {
    type: 'integer',
    default: 20
  }
});

module.exports = values => {
  const clean = validate(values);

  if (clean.stream) {
    clean.stream = validateStreamOptions(typeof clean.stream === 'boolean' ? {} : clean.stream)
  } else {
    clean.stream = false;
  }

  return clean;
}
