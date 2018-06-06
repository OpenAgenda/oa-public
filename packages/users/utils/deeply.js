const _ = require( 'lodash' );

module.exports = function deeply( map ) {
  return ( obj, fn ) => {
    return map( _.mapValues( obj, v => {
      return _.isPlainObject( v ) ? deeply( map )( v, fn ) : v;
    } ), fn );
  }
};
