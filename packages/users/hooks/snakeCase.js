const _ = require( 'lodash' );
const { alterItems } = require( 'feathers-hooks-common' );

module.exports = function snakeCase() {
  return alterItems( record => _.mapKeys( record, ( value, key ) => _.snakeCase( key ) ) );
}
