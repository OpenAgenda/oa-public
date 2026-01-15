import _ from 'lodash';
import fields from './index.js';

export default fields
  .find((f) => f.field === 'credentials')
  .fields.reduce(
    (credentials, field) => ({
      ...credentials,
      [field.field]: _.omit(field, 'field'),
    }),
    {},
  );
