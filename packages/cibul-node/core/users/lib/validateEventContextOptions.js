import schema from '@openagenda/validators/schema/index.js';
import choiceValidator from '@openagenda/validators/choice.js';

schema.register({
  choice: choiceValidator,
});

export default schema({
  includes: {
    type: 'choice',
    options: ['me.authorizations', 'me.member', 'member'],
    default: ['me.authorizations', 'me.member', 'member'],
  },
});
