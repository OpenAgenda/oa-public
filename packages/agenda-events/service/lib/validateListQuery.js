import _ from 'lodash';
import schema from '@openagenda/validators/schema/index';

import integerValidator from '@openagenda/validators/integer';
import choiceValidator from '@openagenda/validators/choice';
import states from '../../iso/states.js';

schema.register({
  choice: choiceValidator,
  integer: integerValidator,
});

const validate = schema({
  state: {
    type: 'choice',
    optional: true,
    unique: true,
    options: _.keys(states)
      .map((k) => k.toLowerCase())
      .concat(_.values(states)),
  },
  eventUid: {
    type: 'integer',
    optional: true,
    list: {
      default: null,
    },
  },
  aggregated: {
    type: 'boolean',
    optional: true,
    default: null,
  },
  canEdit: {
    type: 'boolean',
    optional: true,
  },
  updatedAt: ['gt', 'lt', 'gte', 'lte'].reduce(
    (updatedAt, op) => ({
      ...updatedAt,
      [op]: { type: 'date' },
    }),
    {},
  ),
});

export default (values) => {
  const clean = validate(values);

  if (clean.state && typeof clean.state === 'string') {
    clean.state = states[
      Object.keys(states).filter((k) => clean.state === k.toLowerCase())[0]
    ];
  } else if (clean.state === null) {
    return _.omit(clean, ['state']);
  }

  return clean;
};
