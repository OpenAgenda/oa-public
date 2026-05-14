import schemas from '@openagenda/validators/schema/index';
import boolean from '@openagenda/validators/boolean';
import text from '@openagenda/validators/text';
import choice from '@openagenda/validators/choice';
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
