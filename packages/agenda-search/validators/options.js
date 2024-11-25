import schemas from '@openagenda/validators/schema/index.js';
import boolean from '@openagenda/validators/boolean.js';
import text from '@openagenda/validators/text.js';
import choice from '@openagenda/validators/choice.js';
import { paths } from '../service/lib/fields.js';

schemas.register({
  boolean,
  text,
  choice,
});

export default schemas({
  detailed: {
    type: 'boolean',
    default: false,
  },
  includeFields: {
    type: 'choice',
    options: paths,
  },
  useDefaultImage: {
    type: 'boolean',
    default: false,
  },
  includeImagePath: {
    type: 'boolean',
    default: true,
  },
  indexed: {
    type: 'boolean',
    allowNull: true,
    default: true,
  },
  access: {
    type: 'text',
    default: 'public',
  },
});
