import schema from '@openagenda/validators/schema/index.js';
import choiceValidator from '@openagenda/validators/choice.js';
import integerValidator from '@openagenda/validators/integer.js';

schema.register({
  choice: choiceValidator,
  integer: integerValidator,
});

export default schema({
  userUid: {
    type: 'integer',
    default: null,
  },
  includes: {
    type: 'choice',
    options: ['me.authorizations', 'me.member', 'me.events', 'events', 'agenda'],
    default: ['me.authorizations', 'me.member'],
  },
});
