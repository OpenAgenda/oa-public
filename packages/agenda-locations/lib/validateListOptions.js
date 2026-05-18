import schema from '@openagenda/validators/schema';
import boolean from '@openagenda/validators/boolean';
import integer from '@openagenda/validators/integer';
import choice from '@openagenda/validators/choice';
import pass from '@openagenda/validators/pass';
import fields from './fields.js';

schema.register({
  boolean,
  integer,
  choice,
  pass,
});

const validate = schema({
  total: {
    type: 'boolean',
    default: false,
  },
  eventCounts: {
    type: 'boolean',
    default: false,
  },
  detailed: {
    type: 'boolean',
    default: false,
  },
  includeFields: {
    type: 'choice',
    options: fields.map((f) => f.field).concat('agendaUid'),
  },
  includeImagePath: {
    type: 'boolean',
    default: false,
  },
  deleted: {
    type: 'boolean',
    default: false,
    allowNull: true,
  },
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
  context: {
    agendaUid: {
      type: 'integer',
      default: null,
    },
  },
  stream: {
    default: false,
    type: 'pass',
  },
  formSchema: {
    type: 'pass',
    default: null,
  },
});

const validateStreamOptions = schema({
  highWaterMark: {
    type: 'integer',
    default: 20,
  },
});

export default (values) => {
  const clean = validate(values);

  if (clean.stream) {
    clean.stream = validateStreamOptions(
      typeof clean.stream === 'boolean' ? {} : clean.stream,
    );
  } else {
    clean.stream = false;
  }

  return clean;
};
