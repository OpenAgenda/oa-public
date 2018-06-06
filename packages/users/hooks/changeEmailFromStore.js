const _ = require( 'lodash' );

module.exports = function changeEmailFromStore() {
  return context => {
    context.data.email = context.params.before.store.newEmail;

    context.data.store = _.merge( {}, context.params.before.store, context.data.store );

    delete context.data.store.newEmail;
    delete context.data.store.newEmailToken;
  };
};
