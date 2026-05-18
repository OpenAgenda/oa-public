import schema from '@openagenda/validators/schema/index';
import integer from '@openagenda/validators/integer';

schema.register({
  integer,
});

const validate = schema({
  identifier: {
    type: 'integer',
    list: { default: null },
  },
});

export default function listQuery(dirty) {
  const clean = validate(dirty);

  clean.identifier = clean.identifier?.filter((id) => ![undefined, null].includes(id)) ?? null;

  return clean;
}
