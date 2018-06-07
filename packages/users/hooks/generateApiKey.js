const config = require( '../config' );

module.exports = function generateApiKey() {
  return async context => {
    const { keys } = config.interfaces;
    const { publicKey, secretKey } = context.params;

    async function _generate( type ) {
      await keys.remove( {
        type,
        identifier: context.params.before.uid
      } );

      await keys.create( {
        type,
        identifier: context.params.before.uid
      } );
    }

    if ( publicKey ) await _generate( 'userPublic' );
    if ( secretKey ) await _generate( 'userPrivate' );

    context.result = context.params.before;
  };
};
