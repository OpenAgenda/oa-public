module.exports = function generateApiKey() {
  return async context => {
    const { config } = context.service;
    const { keys } = config.interfaces;
    const { publicKey, secretKey } = context.params;

    async function _generate( type ) {
      await keys.remove( {
        type,
        identifier: context.id
      } );

      await keys.create( {
        type,
        identifier: context.id
      } );
    }

    if ( publicKey ) await _generate( 'userPublic' );
    if ( secretKey ) await _generate( 'userPrivate' );

    context.result = context.params.before;
  };
};
