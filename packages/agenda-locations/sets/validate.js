import _ from 'lodash';
import schema from '@openagenda/validators/schema';
import text from '@openagenda/validators/text';
import fields from './fields.json' with { type: 'json' };

schema.register({
  text,
});

export default schema(
  fields
    .filter((f) => f.write.includes('administrator'))
    .reduce(
      (result, field) => ({
        ...result,
        [field.field]: _.omit(field, ['field', 'db', 'read']),
      }),
      {},
    ),
);
