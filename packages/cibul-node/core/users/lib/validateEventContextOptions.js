import schema from '@openagenda/validators/schema/index';
import choiceValidator from '@openagenda/validators/choice';

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
