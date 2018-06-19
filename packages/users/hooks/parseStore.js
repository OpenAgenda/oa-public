const _ = require( 'lodash' );
const { alterItems } = require( 'feathers-hooks-common' );

module.exports = function parseStore() {
  return context => {
    if ( context.result === null ) {
      return context;
    }

    return alterItems( record =>
      ({ ...record, store: _.isString( record.store ) ? JSON.parse( record.store || '{}' ) : record.store })
    )( context );
  };
}
