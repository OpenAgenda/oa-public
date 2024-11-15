import schema from '@openagenda/validators/schema/index.js';
import boolean from '@openagenda/validators/boolean.js';
import pass from '@openagenda/validators/pass.js';
import choice from '@openagenda/validators/choice.js';

schema.register({
  boolean,
  pass,
  choice,
});

export default schema({
  refresh: {
    type: 'boolean',
    default: false,
  },
  formSchema: {
    type: 'pass',
    default: null,
  },
  operation: {
    type: 'choice',
    options: ['update', 'index'],
    default: 'update',
    unique: true,
  },
});
