import schema from '@openagenda/validators/schema/index.js';
import boolean from '@openagenda/validators/boolean.js';
import integer from '@openagenda/validators/integer.js';
import pass from '@openagenda/validators/pass.js';

schema.register({
  boolean,
  integer,
  pass,
});

export default schema({
  transferToLegacy: {
    type: 'boolean',
    list: { default: false },
  },
  // required for legacy transfer to target an agenda
  agendaId: {
    type: 'integer',
    optional: true,
  },
  draft: {
    type: 'boolean',
    optional: true,
    default: false,
  },
  validate: {
    type: 'boolean',
    optional: true,
    default: true,
  },
  partial: {
    type: 'boolean',
    optional: true,
    default: false,
  },
  preloaded: {
    // in case custom data is already in hand
    type: 'pass',
    optional: true,
  },
});
