import schema from '@openagenda/validators/schema/index';
import text from '@openagenda/validators/text';
import bool from '@openagenda/validators/boolean';

schema.register({
  text,
  bool,
});

export default schema({
  includeEmbedScripts: {
    type: 'bool',
    default: true,
  },
  cspNonce: {
    type: 'text',
  },
});
