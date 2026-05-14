import _ from 'lodash';

import fields from './fields.js';

export default function getSchema(options = {}) {
  const { access = 'public', includeLegacyAdminLevels = true } = options;

  return {
    fields: fields
      .filter((f) => f.read.includes(access))
      .filter(
        (f) =>
          includeLegacyAdminLevels
          || !['region', 'department', 'city', 'district'].includes(f.field),
      )
      .map((f) => _.omit(f, ['db'])),
    schemaId: 'location',
  };
}
