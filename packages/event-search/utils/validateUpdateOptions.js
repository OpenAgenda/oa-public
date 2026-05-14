import schema from '@openagenda/validators/schema/index';
import boolean from '@openagenda/validators/boolean';
import pass from '@openagenda/validators/pass';
import choice from '@openagenda/validators/choice';

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
