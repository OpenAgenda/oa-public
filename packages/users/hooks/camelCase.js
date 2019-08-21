const _ = require( 'lodash' );
const { alterItems } = require( 'feathers-hooks-common' );

module.exports = function camelCase() {
  return context => {
    if ( context.result === null ) {
      return context;
    }

    return alterItems( record => _.mapKeys( record, ( value, key ) => _.camelCase( key ) ) )( context );
  };
};
