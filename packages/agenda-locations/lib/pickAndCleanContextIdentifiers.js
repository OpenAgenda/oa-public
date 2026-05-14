import schema from '@openagenda/validators/schema';
import integer from '@openagenda/validators/integer';

import { BadRequest } from '@openagenda/verror';

schema.register({ integer });

const validate = schema({
  agendaUid: {
    type: 'integer',
  },
  setUid: {
    type: 'integer',
  },
});

export default (context = {}, fields = []) => {
  const ids = fields
    .filter((field) => context[field] !== null)
    .reduce(
      (identifiers, field) => ({ ...identifiers, [field]: context[field] }),
      {},
    );

  try {
    validate(ids);
    return ids;
  } catch (e) {
    throw new BadRequest('Invalid location identifier', e);
  }
};
