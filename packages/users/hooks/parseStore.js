const _ = require( 'lodash' );
const { alterItems } = require( 'feathers-hooks-common' );

module.exports = function parseStore() {
  return context => {
    if ( context.result === null ) {
      return context;
    }

    return alterItems( record =>
      (_.isString( record.store ) ? { ...record, store: JSON.parse( record.store || '{}' ) } : record )
    )( context );
  };
}
