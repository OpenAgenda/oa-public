import schema from '@openagenda/validators/schema/index';
import text from '@openagenda/validators/text';
import integer from '@openagenda/validators/integer';
import choice from '@openagenda/validators/choice';

schema.register({
  choice,
  integer,
  text,
});

const validate = schema({
  after: {
    type: 'text',
    list: true,
    default: null,
  },
  from: {
    type: 'integer',
    default: null,
  },
  size: {
    type: 'integer',
    default: 20,
  },
  page: {
    type: 'integer',
    default: null,
  },
  order: {
    type: 'choice',
    default: 'id.asc',
    unique: true,
    options: [
      'id.asc',
      'id.desc',
      'role.asc',
      'role.desc',
      'slug.asc',
      'slug.desc',
      'actionsCounter.asc',
      'actionsCounter.desc',
    ],
  },
});

export default (nav) => {
  const preClean = {
    ...nav ?? {},
  };

  if ('offset' in preClean && !('from' in preClean)) {
    preClean.from = preClean.offset;
  }

  if ('limit' in preClean && !('size' in preClean)) {
    preClean.size = preClean.limit;
  }

  const clean = validate(preClean);

  if (clean.order === null) {
    clean.order = 'id.asc';
  }

  return clean;
};
