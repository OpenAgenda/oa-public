const _ = require( 'lodash' );
const { alterItems } = require( 'feathers-hooks-common' );

module.exports = function formatStore() {
  return alterItems( record =>
    ({ ...record, store: _.isObject( record.store ) ? JSON.stringify( record.store || {} ) : record.store })
  );
};
