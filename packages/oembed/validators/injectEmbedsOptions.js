import schema from '@openagenda/validators/schema/index.js';
import text from '@openagenda/validators/text.js';
import bool from '@openagenda/validators/boolean.js';

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
