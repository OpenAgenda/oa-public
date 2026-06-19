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
  // Restrictive counterpart of `includeFields`: when set, ONLY these fields are
  // projected (overrides base/detailed). Implemented in defineIncludes; exposed
  // here so the v3 `?fields=` selector can push its selection down to `_source`.
  onlyIncludeFields: {
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
