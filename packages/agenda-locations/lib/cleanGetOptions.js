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

export default schema({
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
    options: fields.map((f) => f.field).concat('agendaUid'),
  },
  throwOnNotFound: {
    type: 'boolean',
    default: false,
  },
  includeLinkedAgendas: {
    type: 'boolean',
    default: false,
  },
  includeOriginAgendaUid: {
    type: 'boolean',
    default: false,
  },
  deleted: {
    type: 'boolean',
    default: false,
    allowNull: true,
  },
  context: {
    agendaUid: {
      type: 'integer',
      default: null,
    },
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
  returnMergeTarget: {
    type: 'boolean',
    default: false,
  },
  formSchema: {
    type: 'pass',
    default: null,
  },
});
